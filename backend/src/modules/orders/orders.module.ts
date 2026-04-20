import { Module } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { GruposEconomicosModule } from '../grupos-economicos/grupos-economicos.module';

@Module({
  imports: [NotificationsModule, GruposEconomicosModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
