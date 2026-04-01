import { Module, Global } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseService } from './database.service';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: 'PG_CONNECTION',
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const pool = new Pool({
          host: configService.get<string>('DATABASE_HOST'),
          port: configService.get<number>('DATABASE_PORT'),
          user: configService.get<string>('DATABASE_USER'),
          password: configService.get<string>('DATABASE_PASSWORD'),
          database: configService.get<string>('DATABASE_NAME'),
          application_name: configService.get<string>('DATABASE_APP_NAME') || 'pino-backend',
          keepAlive: true,
          max: Number(configService.get<string>('DATABASE_POOL_MAX') || 20),
          idleTimeoutMillis: Number(
            configService.get<string>('DATABASE_IDLE_TIMEOUT_MS') || 30000,
          ),
          connectionTimeoutMillis: Number(
            configService.get<string>('DATABASE_CONNECTION_TIMEOUT_MS') || 2000,
          ),
          statement_timeout: Number(
            configService.get<string>('DATABASE_STATEMENT_TIMEOUT_MS') || 0,
          ),
          query_timeout: Number(configService.get<string>('DATABASE_QUERY_TIMEOUT_MS') || 0),
        });

        return pool;
      },
    },
    DatabaseService,
  ],
  exports: ['PG_CONNECTION', DatabaseService],
})
export class DatabaseModule {}
