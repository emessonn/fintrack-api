import { Injectable } from '@nestjs/common'
import { BillRecurrence, BillStatus, Prisma } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'

type BillFilters = {
  status?: BillStatus
  recurrence?: BillRecurrence
  category?: string
}

type CreateBillParams = {
  firebaseUid: string
  description: string
  amount: string
  dueDate: Date
  category: string
  recurrence: BillRecurrence
  userProfile?: {
    email?: string
    name?: string
    picture?: string
  }
}

type UpdateBillParams = {
  id: string
  firebaseUid: string
  description?: string
  amount?: string
  dueDate?: Date
  category?: string
  status?: BillStatus
  recurrence?: BillRecurrence
  paidAt?: Date | null
}

@Injectable()
export class BillsRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByUser(firebaseUid: string, filters: BillFilters) {
    return this.prisma.bill.findMany({
      where: {
        user: { firebaseUid },
        status: filters.status,
        recurrence: filters.recurrence,
        category: filters.category,
      },
      orderBy: [{ dueDate: 'asc' }, { createdAt: 'desc' }],
    })
  }

  async findOneByUser(id: string, firebaseUid: string) {
    return this.prisma.bill.findFirst({
      where: {
        id,
        user: { firebaseUid },
      },
    })
  }

  async createForUser(params: CreateBillParams) {
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

    return this.prisma.bill.create({
      data: {
        userId: user.id,
        description: params.description,
        amount: new Prisma.Decimal(params.amount),
        dueDate: params.dueDate,
        category: params.category,
        recurrence: params.recurrence,
      },
    })
  }

  async updateForUser(params: UpdateBillParams) {
    const bill = await this.prisma.bill.findFirst({
      where: {
        id: params.id,
        user: { firebaseUid: params.firebaseUid },
      },
      select: { id: true },
    })

    if (!bill) {
      return null
    }

    return this.prisma.bill.update({
      where: { id: bill.id },
      data: {
        description: params.description,
        amount:
          params.amount !== undefined
            ? new Prisma.Decimal(params.amount)
            : undefined,
        dueDate: params.dueDate,
        category: params.category,
        status: params.status,
        recurrence: params.recurrence,
        paidAt: params.paidAt,
      },
    })
  }

  async deleteForUser(id: string, firebaseUid: string) {
    const result = await this.prisma.bill.deleteMany({
      where: {
        id,
        user: { firebaseUid },
      },
    })

    return result.count > 0
  }
}
