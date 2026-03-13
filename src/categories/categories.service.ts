import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { Prisma } from '@prisma/client'

import { AuthenticatedUser } from '../common/types/authenticated-user.type'
import {
  CreateCategoryInput,
  ListCategoriesQuery,
  UpdateCategoryInput,
} from './categories.schemas'
import { CategoriesRepository } from './categories.repository'

@Injectable()
export class CategoriesService {
  constructor(private readonly categoriesRepository: CategoriesRepository) {}

  async listCategories(user: AuthenticatedUser, query: ListCategoriesQuery) {
    return this.categoriesRepository.listByUser(user.uid, query)
  }

  async getCategoryById(user: AuthenticatedUser, categoryId: string) {
    const category = await this.categoriesRepository.findOneByUser(
      categoryId,
      user.uid,
    )

    if (!category) {
      throw new NotFoundException('Category not found')
    }

    return category
  }

  async createCategory(user: AuthenticatedUser, input: CreateCategoryInput) {
    try {
      return await this.categoriesRepository.createForUser({
        firebaseUid: user.uid,
        name: input.name,
        limit: input.limit,
        userProfile: {
          email: user.email,
          name: user.name,
          picture: user.picture,
        },
      })
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Category with this name already exists')
      }

      throw error
    }
  }

  async updateCategory(
    user: AuthenticatedUser,
    categoryId: string,
    input: UpdateCategoryInput,
  ) {
    try {
      const category = await this.categoriesRepository.updateForUser({
        id: categoryId,
        firebaseUid: user.uid,
        name: input.name,
        limit: input.limit,
      })

      if (!category) {
        throw new NotFoundException('Category not found')
      }

      return category
    } catch (error: unknown) {
      if (this.isUniqueConstraintError(error)) {
        throw new ConflictException('Category with this name already exists')
      }

      throw error
    }
  }

  async deleteCategory(user: AuthenticatedUser, categoryId: string) {
    const deleted = await this.categoriesRepository.deleteForUser(
      categoryId,
      user.uid,
    )

    if (!deleted) {
      throw new NotFoundException('Category not found')
    }
  }

  private isUniqueConstraintError(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    )
  }
}
