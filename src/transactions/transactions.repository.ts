import { Injectable } from '@nestjs/common'
import { Prisma, TransactionType } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'

type ListFilters = {
  category?: string
  startDate?: Date
  endDate?: Date
}

type CreateTransactionParams = {
  firebaseUid: string
  description: string
  amount: string
  type: TransactionType
  category: string
  userProfile?: {
    email?: string
    name?: string
    picture?: string
  }
}

@Injectable()
export class TransactionsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(firebaseUid: string, filters: ListFilters) {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid },
      select: { id: true },
    })

    if (!user) {
      return []
    }

    return this.prisma.transaction.findMany({
      where: {
        userId: user.id,
        category: filters.category,
        createdAt:
          filters.startDate || filters.endDate
            ? {
                gte: filters.startDate,
                lte: filters.endDate,
              }
            : undefined,
      },
      orderBy: { createdAt: 'desc' },
    })
  }

  async createForUser(params: CreateTransactionParams) {
    const user = await this.prisma.user.upsert({
      where: { firebaseUid: params.firebaseUid },
      create: {
        firebaseUid: params.firebaseUid,
        email: params.userProfile?.email,
        name: params.userProfile?.name,
        avatarUrl: params.userProfile?.picture,
      },
      update: {
        email: params.userProfile?.email,
        name: params.userProfile?.name,
        avatarUrl: params.userProfile?.picture,
      },
      select: { id: true },
    })

    return this.prisma.transaction.create({
      data: {
        userId: user.id,
        description: params.description,
        amount: new Prisma.Decimal(params.amount),
        type: params.type,
        category: params.category,
      },
    })
  }
}
