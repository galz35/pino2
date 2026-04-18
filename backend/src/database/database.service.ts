import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool, PoolClient, QueryResult, QueryResultRow } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private slowQueryConfigCache: {
    active: boolean;
    thresholdMs: number;
    loadedAt: number;
  } | null = null;
  private readonly slowQueryConfigTtlMs = 30_000;

  constructor(
    @Inject('PG_CONNECTION') private readonly pool: Pool,
    private readonly configService: ConfigService,
  ) {
    this.pool.on('error', (err) => {
      this.logger.warn(
        'A database connection was dropped (possibly closed by the cloud provider). Pool will recover automatically.',
        err.message,
      );
    });
  }

  async onModuleInit() {
    await this.ensureOperationalTables();
  }

  /**
   * Ejecuta una consulta directa usando el Pool
   */
  async query<T extends QueryResultRow = any>(
    text: string,
    params?: any[],
  ): Promise<QueryResult<T>> {
    const start = Date.now();
    try {
      const res = await this.pool.query<T>(text, params);
      const duration = Date.now() - start;
      // this.logger.debug(`Executed query: { text: ${text}, time: ${duration}ms, rows: ${res.rowCount} }`);
      await this.maybeCaptureSlowQuery(
        text,
        params,
        duration,
        res.rowCount ?? 0,
        'pool',
      );
      return res;
    } catch (error) {
      const duration = Date.now() - start;
      await this.maybeCaptureSlowQuery(
        text,
        params,
        duration,
        0,
        'pool',
        error,
      );
      throw error;
    }
  }

  /**
   * Obtiene un cliente dedicado del Pool
   * Ideal para transacciones múltiples
   */
  async getClient(): Promise<PoolClient> {
    return await this.pool.connect();
  }

  /**
   * Envuelve una función dentro de un bloque Transaccional BEGIN / COMMIT
   * Si la función tira error, hace ROLLBACK automáticamente.
   */
  async withTransaction<T>(
    callback: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.getClient();
    const rawQuery = client.query.bind(client);
    try {
      (client as PoolClient & { query: any }).query = async (
        text: string,
        params?: any[],
      ) => {
        const start = Date.now();
        try {
          const result = await rawQuery(text, params);
          const duration = Date.now() - start;
          await this.maybeCaptureSlowQuery(
            text,
            params,
            duration,
            result.rowCount ?? 0,
            'transaction',
          );
          return result;
        } catch (error) {
          const duration = Date.now() - start;
          await this.maybeCaptureSlowQuery(
            text,
            params,
            duration,
            0,
            'transaction',
            error,
          );
          throw error;
        }
      };

      await rawQuery('BEGIN');

      const result = await callback(client);

      await rawQuery('COMMIT');
      return result;
    } catch (e) {
      this.logger.error('Transaction rollback due to error', e.stack);
      await rawQuery('ROLLBACK');
      throw e;
    } finally {
      (client as PoolClient & { query: any }).query = rawQuery;
      client.release();
    }
  }

  private async ensureOperationalTables() {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS consultasql (
        id SMALLINT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
        activo BOOLEAN NOT NULL DEFAULT FALSE,
        umbral_ms INTEGER NOT NULL DEFAULT 200 CHECK (umbral_ms >= 0),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.pool.query(`
      INSERT INTO consultasql (id, activo, umbral_ms)
      VALUES (1, FALSE, 200)
      ON CONFLICT (id) DO NOTHING;
    `);

    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS consultasql_historial (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        operacion VARCHAR(20),
        origen VARCHAR(30) NOT NULL DEFAULT 'pool',
        duracion_ms INTEGER NOT NULL,
        row_count INTEGER,
        consulta TEXT NOT NULL,
        parametros JSONB,
        error_message TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_consultasql_historial_created_at
      ON consultasql_historial(created_at DESC);
    `);

    await this.pool.query(`
      CREATE INDEX IF NOT EXISTS idx_consultasql_historial_duracion
      ON consultasql_historial(duracion_ms DESC);
    `);

    // Asegurar columnas de Idempotencia (Id para Offline Sync)
    const tables = ['sales', 'orders', 'collections', 'returns'];
    for (const table of tables) {
      await this.pool.query(`
        DO $$ 
        BEGIN 
          IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = '${table}' AND column_name = 'external_id') THEN
            ALTER TABLE ${table} ADD COLUMN external_id UUID UNIQUE;
          END IF;
        END $$;
      `);
    }

    // Asegurar store_type para arquitectura multi-tienda corporativa
    await this.pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'stores' AND column_name = 'store_type') THEN
          ALTER TABLE stores ADD COLUMN store_type VARCHAR(50) DEFAULT 'SUPERMERCADO';
        END IF;
      END $$;
    `);

    // Tabla de estado de sincronización por tienda
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS sync_status (
        store_id UUID PRIMARY KEY REFERENCES stores(id) ON DELETE CASCADE,
        last_sync TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        status VARCHAR(20) DEFAULT 'IDLE',
        last_error TEXT,
        ops_count INTEGER DEFAULT 0,
        duplicates_avoided INTEGER DEFAULT 0
      );
    `);

    // Tabla de departamentos (asegurar columnas para sub-departamentos)
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS departments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        description TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await this.pool.query(`
      DO $$ 
      BEGIN 
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'departments' AND column_name = 'parent_id') THEN
          ALTER TABLE departments ADD COLUMN parent_id UUID REFERENCES departments(id) ON DELETE SET NULL;
        END IF;
      END $$;
    `);

    // Tabla para Tokens de Dispositivos (FCM)
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS device_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        token TEXT NOT NULL UNIQUE,
        platform VARCHAR(20) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);
  }

  private async maybeCaptureSlowQuery(
    text: string,
    params: any[] | undefined,
    durationMs: number,
    rowCount: number,
    source: 'pool' | 'transaction',
    error?: any,
  ) {
    if (!text || this.shouldSkipSlowQueryCapture(text)) {
      return;
    }

    const config = await this.getSlowQueryConfig();
    if (!config.active || durationMs < config.thresholdMs) {
      return;
    }

    const operation = this.extractOperation(text);
    const trimmedText = text.trim().replace(/\s+/g, ' ').slice(0, 4000);
    const serializedParams = this.serializeParams(params);
    const errorMessage =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
          ? error
          : null;

    await this.pool.query(
      `INSERT INTO consultasql_historial (
         operacion,
         origen,
         duracion_ms,
         row_count,
         consulta,
         parametros,
         error_message
       ) VALUES ($1, $2, $3, $4, $5, $6::jsonb, $7)`,
      [
        operation,
        source,
        durationMs,
        rowCount,
        trimmedText,
        serializedParams ? JSON.stringify(serializedParams) : null,
        errorMessage,
      ],
    );

    this.logger.warn(
      `Slow query captured: { operation: ${operation}, source: ${source}, time: ${durationMs}ms, rows: ${rowCount} }`,
    );
  }

  private async getSlowQueryConfig() {
    const now = Date.now();
    if (
      this.slowQueryConfigCache &&
      now - this.slowQueryConfigCache.loadedAt < this.slowQueryConfigTtlMs
    ) {
      return this.slowQueryConfigCache;
    }

    const defaultThreshold = Number(
      this.configService.get<string>('DATABASE_SLOW_QUERY_THRESHOLD_MS') || 200,
    );

    try {
      const res = await this.pool.query(
        'SELECT activo, umbral_ms FROM consultasql WHERE id = 1 LIMIT 1',
      );
      const row = res.rows[0];
      this.slowQueryConfigCache = {
        active: !!row?.activo,
        thresholdMs: Number(row?.umbral_ms ?? defaultThreshold ?? 200),
        loadedAt: now,
      };
    } catch {
      this.slowQueryConfigCache = {
        active: false,
        thresholdMs: defaultThreshold || 200,
        loadedAt: now,
      };
    }

    return this.slowQueryConfigCache;
  }

  private shouldSkipSlowQueryCapture(text: string) {
    const normalized = text.trim().toLowerCase();
    if (!normalized) {
      return true;
    }

    return (
      normalized.startsWith('begin') ||
      normalized.startsWith('commit') ||
      normalized.startsWith('rollback') ||
      normalized.includes('consultasql_historial') ||
      normalized.includes(' from consultasql ') ||
      normalized.includes(' into consultasql ')
    );
  }

  private extractOperation(text: string) {
    const operation = text.trim().split(/\s+/)[0]?.toUpperCase() || 'UNKNOWN';
    return operation.slice(0, 20);
  }

  private serializeParams(params?: any[]) {
    if (!params || params.length === 0) {
      return null;
    }

    return params.map((value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      if (typeof value === 'bigint') {
        return value.toString();
      }
      if (Buffer.isBuffer(value)) {
        return `<Buffer:${value.length}>`;
      }
      return value;
    });
  }
}
