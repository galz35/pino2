import { Module } from '@nestjs/common';
import { GruposEconomicosService } from './grupos-economicos.service';
import { GruposEconomicosController } from './grupos-economicos.controller';

@Module({
  controllers: [GruposEconomicosController],
  providers: [GruposEconomicosService],
  exports: [GruposEconomicosService],
})
export class GruposEconomicosModule {}
