import { Module } from '@nestjs/common';
import { CargasCamionService } from './cargas-camion.service';
import { CargasCamionController } from './cargas-camion.controller';

@Module({
  controllers: [CargasCamionController],
  providers: [CargasCamionService],
  exports: [CargasCamionService],
})
export class CargasCamionModule {}
