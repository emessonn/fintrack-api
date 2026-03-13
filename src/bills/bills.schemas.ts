import { BillRecurrence, BillStatus } from '@prisma/client'
import { z } from 'zod'

const amountSchema = z
  .union([z.number(), z.string()])
  .transform((value) => String(value).trim())
  .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), {
    message: 'amount must be a valid decimal value with up to 2 decimal places',
  })

const dateOnlyRegex = /^\d{4}-\d{2}-\d{2}$/

const dueDateSchema = z
  .string()
  .regex(dateOnlyRegex, 'dueDate must be in YYYY-MM-DD format')
  .transform((value) => new Date(`${value}T00:00:00.000Z`))

export const listBillsQuerySchema = z
  .object({
    status: z.nativeEnum(BillStatus).optional(),
    recurrence: z.nativeEnum(BillRecurrence).optional(),
    category: z.string().trim().min(1).max(120).optional(),
  })
  .strip()

export type ListBillsQuery = z.infer<typeof listBillsQuerySchema>

export const billIdParamSchema = z
  .object({
    id: z.string().uuid('id must be a valid uuid'),
  })
  .strict()

export type BillIdParam = z.infer<typeof billIdParamSchema>

export const createBillSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(1, 'description is required')
      .max(255, 'description must be at most 255 characters'),
    amount: amountSchema,
    dueDate: dueDateSchema,
    category: z
      .string()
      .trim()
      .min(1, 'category is required')
      .max(120, 'category must be at most 120 characters'),
    recurrence: z
      .nativeEnum(BillRecurrence)
      .optional()
      .default(BillRecurrence.none),
  })
  .strict()

export type CreateBillInput = z.infer<typeof createBillSchema>

export const updateBillSchema = z
  .object({
    description: z.string().trim().min(1).max(255).optional(),
    amount: amountSchema.optional(),
    dueDate: dueDateSchema.optional(),
    category: z.string().trim().min(1).max(120).optional(),
    status: z.nativeEnum(BillStatus).optional(),
    recurrence: z.nativeEnum(BillRecurrence).optional(),
    paidAt: z.coerce.date().nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export type UpdateBillInput = z.infer<typeof updateBillSchema>
