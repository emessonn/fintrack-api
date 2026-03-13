import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { PrismaService } from '../prisma/prisma.service'
import { ListCategoriesQuery } from './categories.schemas'

type CreateCategoryParams = {
  firebaseUid: string
  name: string
  limit?: string
  userProfile?: {
    email?: string
    name?: string
    picture?: string
  }
}

type UpdateCategoryParams = {
  id: string
  firebaseUid: string
  name?: string
  limit?: string | null
}

@Injectable()
export class CategoriesRepository {
  constructor(private readonly prisma: PrismaService) {}

  async listByUser(firebaseUid: string, filters: ListCategoriesQuery) {
    return this.prisma.category.findMany({
      where: {
        user: { firebaseUid },
        name: filters.search
          ? {
              contains: filters.search,
              mode: 'insensitive',
            }
          : undefined,
      },
      orderBy: { name: 'asc' },
    })
  }

  async findOneByUser(id: string, firebaseUid: string) {
    return this.prisma.category.findFirst({
      where: {
        id,
        user: { firebaseUid },
      },
    })
  }

  async createForUser(params: CreateCategoryParams) {
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

    return this.prisma.category.create({
      data: {
        userId: user.id,
        name: params.name,
        limit:
          params.limit !== undefined
            ? new Prisma.Decimal(params.limit)
            : undefined,
      },
    })
  }

  async updateForUser(params: UpdateCategoryParams) {
    const category = await this.prisma.category.findFirst({
      where: {
        id: params.id,
        user: { firebaseUid: params.firebaseUid },
      },
      select: { id: true },
    })

    if (!category) {
      return null
    }

    return this.prisma.category.update({
      where: { id: category.id },
      data: {
        name: params.name,
        limit:
          params.limit === undefined
            ? undefined
            : params.limit === null
              ? null
              : new Prisma.Decimal(params.limit),
      },
    })
  }

  async deleteForUser(id: string, firebaseUid: string) {
    const result = await this.prisma.category.deleteMany({
      where: {
        id,
        user: { firebaseUid },
      },
    })

    return result.count > 0
  }
}
