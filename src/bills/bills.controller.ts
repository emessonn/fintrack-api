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
  BillIdParam,
  billIdParamSchema,
  CreateBillInput,
  createBillSchema,
  ListBillsQuery,
  listBillsQuerySchema,
  UpdateBillInput,
  updateBillSchema,
} from './bills.schemas'
import { BillsService } from './bills.service'

@Controller('bills')
@UseGuards(FirebaseAuthGuard)
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  @Get()
  async getBills(
    @Req() request: Request,
    @Query(new ZodValidationPipe(listBillsQuerySchema))
    query: ListBillsQuery,
  ) {
    const bills = await this.billsService.listBills(request.user!, query)

    return { bills }
  }

  @Get(':id')
  async getBillById(
    @Req() request: Request,
    @Param(new ZodValidationPipe(billIdParamSchema))
    params: BillIdParam,
  ) {
    const bill = await this.billsService.getBillById(request.user!, params.id)

    return { bill }
  }

  @Post()
  async createBill(
    @Req() request: Request,
    @Body(new ZodValidationPipe(createBillSchema))
    body: CreateBillInput,
  ) {
    const bill = await this.billsService.createBill(request.user!, body)

    return { bill }
  }

  @Patch(':id')
  async updateBill(
    @Req() request: Request,
    @Param(new ZodValidationPipe(billIdParamSchema))
    params: BillIdParam,
    @Body(new ZodValidationPipe(updateBillSchema))
    body: UpdateBillInput,
  ) {
    const bill = await this.billsService.updateBill(
      request.user!,
      params.id,
      body,
    )

    return { bill }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBill(
    @Req() request: Request,
    @Param(new ZodValidationPipe(billIdParamSchema))
    params: BillIdParam,
  ) {
    await this.billsService.deleteBill(request.user!, params.id)
  }
}
