import { Module } from '@nestjs/common';
import { AccountsReceivableController } from './accounts-receivable.controller';
import { AccountsReceivableService } from './accounts-receivable.service';
import { DatabaseModule } from '../../database/database.module';
import { CollectionsModule } from '../collections/collections.module';

@Module({
  imports: [DatabaseModule, CollectionsModule],
  controllers: [AccountsReceivableController],
  providers: [AccountsReceivableService],
})
export class AccountsReceivableModule {}
