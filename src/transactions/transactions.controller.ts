import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'

import { FirebaseAuthGuard } from '../auth/firebase-auth.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  createTransactionSchema,
  CreateTransactionInput,
  ListTransactionsQuery,
  listTransactionsQuerySchema,
} from './transactions.schemas'
import { TransactionsService } from './transactions.service'

@Controller('transactions')
@UseGuards(FirebaseAuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Get()
  async getTransactions(
    @Req() request: Request,
    @Query(new ZodValidationPipe(listTransactionsQuerySchema))
    query: ListTransactionsQuery,
  ) {
    const transactions = await this.transactionsService.listTransactions(
      request.user!,
      query,
    )

    return { transactions }
  }

  @Post()
  async createTransaction(
    @Req() request: Request,
    @Body(new ZodValidationPipe(createTransactionSchema))
    body: CreateTransactionInput,
  ) {
    return this.transactionsService.createTransaction(request.user!, body)
  }
}
