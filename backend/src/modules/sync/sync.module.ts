import { Module } from '@nestjs/common';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { SalesModule } from '../sales/sales.module';
import { OrdersModule } from '../orders/orders.module';
import { CollectionsModule } from '../collections/collections.module';
import { ReturnsModule } from '../returns/returns.module';

@Module({
  imports: [SalesModule, OrdersModule, CollectionsModule, ReturnsModule],
  controllers: [SyncController],
  providers: [SyncService],
  exports: [SyncService],
})
export class SyncModule {}
