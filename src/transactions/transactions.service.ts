import { Injectable } from '@nestjs/common'

import { AuthenticatedUser } from '../common/types/authenticated-user.type'
import {
  CreateTransactionInput,
  ListTransactionsQuery,
} from './transactions.schemas'
import { TransactionsRepository } from './transactions.repository'

@Injectable()
export class TransactionsService {
  constructor(
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async listTransactions(
    user: AuthenticatedUser,
    query: ListTransactionsQuery,
  ) {
    const dateRange = this.resolveDateRange(query)

    return this.transactionsRepository.findByUser(user.uid, {
      category: query.category,
      ...dateRange,
    })
  }

  async createTransaction(
    user: AuthenticatedUser,
    input: CreateTransactionInput,
  ) {
    return this.transactionsRepository.createForUser({
      firebaseUid: user.uid,
      description: input.description,
      amount: input.amount,
      type: input.type,
      category: input.category,
      userProfile: {
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    })
  }

  private resolveDateRange(query: ListTransactionsQuery): {
    startDate?: Date
    endDate?: Date
  } {
    if (query.startDate || query.endDate) {
      return {
        startDate: query.startDate,
        endDate: query.endDate,
      }
    }

    if (!query.period) {
      return {}
    }

    const now = new Date()
    const startDate = new Date(now)

    if (query.period === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else if (query.period === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    } else if (query.period === 'year') {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    return {
      startDate,
      endDate: now,
    }
  }
}
