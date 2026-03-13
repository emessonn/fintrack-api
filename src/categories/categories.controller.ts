import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { Request } from 'express'

import { FirebaseAuthGuard } from '../auth/firebase-auth.guard'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import {
  CategoryIdParam,
  categoryIdParamSchema,
  CreateCategoryInput,
  createCategorySchema,
  ListCategoriesQuery,
  listCategoriesQuerySchema,
  UpdateCategoryInput,
  updateCategorySchema,
} from './categories.schemas'
import { CategoriesService } from './categories.service'

@Controller('categories')
@UseGuards(FirebaseAuthGuard)
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  async getCategories(
    @Req() request: Request,
    @Query(new ZodValidationPipe(listCategoriesQuerySchema))
    query: ListCategoriesQuery,
  ) {
    const categories = await this.categoriesService.listCategories(
      request.user!,
      query,
    )

    return { categories }
  }

  @Get(':id')
  async getCategoryById(
    @Req() request: Request,
    @Param(new ZodValidationPipe(categoryIdParamSchema))
    params: CategoryIdParam,
  ) {
    const category = await this.categoriesService.getCategoryById(
      request.user!,
      params.id,
    )

    return { category }
  }

  @Post()
  async createCategory(
    @Req() request: Request,
    @Body(new ZodValidationPipe(createCategorySchema))
    body: CreateCategoryInput,
  ) {
    const category = await this.categoriesService.createCategory(
      request.user!,
      body,
    )

    return { category }
  }

  @Patch(':id')
  async updateCategory(
    @Req() request: Request,
    @Param(new ZodValidationPipe(categoryIdParamSchema))
    params: CategoryIdParam,
    @Body(new ZodValidationPipe(updateCategorySchema))
    body: UpdateCategoryInput,
  ) {
    const category = await this.categoriesService.updateCategory(
      request.user!,
      params.id,
      body,
    )

    return { category }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCategory(
    @Req() request: Request,
    @Param(new ZodValidationPipe(categoryIdParamSchema))
    params: CategoryIdParam,
  ) {
    await this.categoriesService.deleteCategory(request.user!, params.id)
  }
}
