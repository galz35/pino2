import { Controller, Get, Inject } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { Pool } from 'pg';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(@Inject('PG_CONNECTION') private readonly pool: Pool) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Health check — verifica API y conexión a DB' })
  async check() {
    const start = Date.now();
    let dbStatus = 'ok';
    try {
      await this.pool.query('SELECT 1');
    } catch {
      dbStatus = 'error';
    }
    return {
      status: dbStatus === 'ok' ? 'healthy' : 'degraded',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      db: dbStatus,
      responseTimeMs: Date.now() - start,
    };
  }
}
