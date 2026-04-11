import { Module } from '@nestjs/common';
import { RoutesController } from './routes.controller';
import { RoutesService } from './routes.service';
import { DatabaseModule } from '../../database/database.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [DatabaseModule, NotificationsModule],
  controllers: [RoutesController],
  providers: [RoutesService],
})
export class RoutesModule {}
