import { Module } from '@nestjs/common';
import { ArqueosService } from './arqueos.service';
import { ArqueosController } from './arqueos.controller';

@Module({
  controllers: [ArqueosController],
  providers: [ArqueosService],
  exports: [ArqueosService],
})
export class ArqueosModule {}
