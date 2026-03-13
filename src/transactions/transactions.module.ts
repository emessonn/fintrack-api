import { Module } from '@nestjs/common'

import { AuthModule } from '../auth/auth.module'
import { TransactionsController } from './transactions.controller'
import { TransactionsRepository } from './transactions.repository'
import { TransactionsService } from './transactions.service'

@Module({
  imports: [AuthModule],
  controllers: [TransactionsController],
  providers: [TransactionsService, TransactionsRepository],
})
export class TransactionsModule {}
