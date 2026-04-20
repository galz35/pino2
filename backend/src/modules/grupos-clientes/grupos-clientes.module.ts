import { Module } from '@nestjs/common';
import { GruposClientesService } from './grupos-clientes.service';
import { GruposClientesController } from './grupos-clientes.controller';

@Module({
  controllers: [GruposClientesController],
  providers: [GruposClientesService],
  exports: [GruposClientesService],
})
export class GruposClientesModule {}
