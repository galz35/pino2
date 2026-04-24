const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf-8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const match = trimmed.match(/^([^=]+)=(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    process.env[key] = process.env[key] || rawValue.replace(/^["']|["']$/g, '');
  }
}

const migrationFile = process.argv[2] || '2026-04-21_barcode_refactor.sql';
const migrationPath = path.resolve(__dirname, migrationFile);

const client = new Client({
  host: process.env.DATABASE_HOST,
  port: Number(process.env.DATABASE_PORT || 5432),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Conectado a la BD');

    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename TEXT PRIMARY KEY,
        applied_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
      )
    `);

    const sql = fs.readFileSync(migrationPath, 'utf-8');

    console.log(`🔄 Ejecutando migración: ${path.basename(migrationPath)}`);
    await client.query(sql);
    await client.query(
      `INSERT INTO schema_migrations (filename)
       VALUES ($1)
       ON CONFLICT (filename) DO UPDATE SET applied_at = NOW()`,
      [path.basename(migrationPath)],
    );
    console.log('✅ Migración ejecutada exitosamente');

    // Validar tablas creadas
    const tables = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('grupos_economicos', 'grupos_clientes', 'arqueos', 'liquidaciones_ruta', 'cargas_camion', 'historial_asignacion_clientes')
      ORDER BY table_name
    `);
    console.log('\n📋 Tablas nuevas verificadas:');
    tables.rows.forEach(r => console.log(`  ✅ ${r.table_name}`));

    // Validar columnas nuevas en clients
    const clientCols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'clients' AND column_name IN ('grupo_economico_id', 'grupo_cliente_id', 'preventa_id', 'limite_credito', 'saldo_pendiente', 'dias_credito', 'zona', 'lat', 'lng', 'frecuencia_visita', 'dia_visita')
      ORDER BY column_name
    `);
    console.log('\n📋 Columnas nuevas en clients:');
    clientCols.rows.forEach(r => console.log(`  ✅ ${r.column_name}`));

    // Validar columnas nuevas en orders
    const orderCols = await client.query(`
      SELECT column_name FROM information_schema.columns 
      WHERE table_name = 'orders' AND column_name IN ('tipo_pedido', 'requiere_cobro', 'requiere_autorizacion', 'autorizado_por', 'rutero_id', 'camion_id', 'fecha_entrega_programada', 'grupo_carga_id')
      ORDER BY column_name
    `);
    console.log('\n📋 Columnas nuevas en orders:');
    orderCols.rows.forEach(r => console.log(`  ✅ ${r.column_name}`));

    // Validar JSONB permisos en users
    const userCols = await client.query(`
      SELECT column_name, data_type FROM information_schema.columns 
      WHERE table_name = 'users' AND column_name IN ('permisos', 'comision_porcentaje')
    `);
    console.log('\n📋 Columnas nuevas en users:');
    userCols.rows.forEach(r => console.log(`  ✅ ${r.column_name} (${r.data_type})`));

    console.log('\n🎉 MIGRACIÓN COMPLETA Y VERIFICADA');

  } catch (error) {
    console.error('❌ Error durante la migración:', error.message);
    if (error.detail) console.error('  Detalle:', error.detail);
  } finally {
    await client.end();
  }
}

run();
