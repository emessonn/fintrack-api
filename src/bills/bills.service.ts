import { Injectable, NotFoundException } from '@nestjs/common'
import { Bill, BillStatus } from '@prisma/client'

import { AuthenticatedUser } from '../common/types/authenticated-user.type'
import {
  CreateBillInput,
  ListBillsQuery,
  UpdateBillInput,
} from './bills.schemas'
import { BillsRepository } from './bills.repository'

type BillResponse = {
  id: string
  description: string
  amount: string
  dueDate: Date
  category: string
  status: BillStatus
  recurrence: Bill['recurrence']
  paidAt: Date | null
  createdAt: Date
  updatedAt: Date
}

@Injectable()
export class BillsService {
  constructor(private readonly billsRepository: BillsRepository) {}

  async listBills(user: AuthenticatedUser, query: ListBillsQuery) {
    const bills = await this.billsRepository.findByUser(user.uid, query)
    return bills.map((bill) => this.serializeBill(bill))
  }

  async getBillById(user: AuthenticatedUser, billId: string) {
    const bill = await this.billsRepository.findOneByUser(billId, user.uid)

    if (!bill) {
      throw new NotFoundException('Bill not found')
    }

    return this.serializeBill(bill)
  }

  async createBill(user: AuthenticatedUser, input: CreateBillInput) {
    const bill = await this.billsRepository.createForUser({
      firebaseUid: user.uid,
      description: input.description,
      amount: input.amount,
      dueDate: input.dueDate,
      category: input.category,
      recurrence: input.recurrence,
      userProfile: {
        email: user.email,
        name: user.name,
        picture: user.picture,
      },
    })

    return this.serializeBill(bill)
  }

  async updateBill(
    user: AuthenticatedUser,
    billId: string,
    input: UpdateBillInput,
  ) {
    const paidAt = this.resolvePaidAt(input.status, input.paidAt)

    const bill = await this.billsRepository.updateForUser({
      id: billId,
      firebaseUid: user.uid,
      description: input.description,
      amount: input.amount,
      dueDate: input.dueDate,
      category: input.category,
      status: input.status,
      recurrence: input.recurrence,
      paidAt,
    })

    if (!bill) {
      throw new NotFoundException('Bill not found')
    }

    return this.serializeBill(bill)
  }

  async deleteBill(user: AuthenticatedUser, billId: string) {
    const deleted = await this.billsRepository.deleteForUser(billId, user.uid)

    if (!deleted) {
      throw new NotFoundException('Bill not found')
    }
  }

  private serializeBill(bill: Bill): BillResponse {
    const todayIsoDate = new Date().toISOString().slice(0, 10)
    const dueIsoDate = bill.dueDate.toISOString().slice(0, 10)
    const isOverdue =
      bill.status === BillStatus.pending && dueIsoDate < todayIsoDate

    return {
      id: bill.id,
      description: bill.description,
      amount: bill.amount.toString(),
      dueDate: bill.dueDate,
      category: bill.category,
      status: isOverdue ? BillStatus.overdue : bill.status,
      recurrence: bill.recurrence,
      paidAt: bill.paidAt,
      createdAt: bill.createdAt,
      updatedAt: bill.updatedAt,
    }
  }

  private resolvePaidAt(status?: BillStatus, paidAt?: Date | null) {
    if (status === BillStatus.paid) {
      return paidAt ?? new Date()
    }

    if (status === BillStatus.pending || status === BillStatus.overdue) {
      return null
    }

    return paidAt
  }
}
