import { Module } from '@nestjs/common';
import { LiquidacionesRutaService } from './liquidaciones-ruta.service';
import { LiquidacionesRutaController } from './liquidaciones-ruta.controller';

@Module({
  controllers: [LiquidacionesRutaController],
  providers: [LiquidacionesRutaService],
  exports: [LiquidacionesRutaService],
})
export class LiquidacionesRutaModule {}
