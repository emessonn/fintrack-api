import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { BillsController } from './bills.controller'
import { BillsRepository } from './bills.repository'
import { BillsService } from './bills.service'
import { TransactionsModule } from '../transactions/transactions.module'

@Module({
  imports: [AuthModule, TransactionsModule],
  controllers: [BillsController],
  providers: [BillsService, BillsRepository],
})
export class BillsModule {}
