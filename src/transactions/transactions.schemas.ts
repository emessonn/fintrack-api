import { TransactionType } from '@prisma/client'
import { z } from 'zod'

const amountSchema = z
  .union([z.number(), z.string()])
  .transform((value) => String(value).trim())
  .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), {
    message: 'amount must be a valid decimal value with up to 2 decimal places',
  })

export const createTransactionSchema = z
  .object({
    description: z
      .string()
      .trim()
      .min(1, 'description is required')
      .max(255, 'description must be at most 255 characters'),
    amount: amountSchema,
    type: z.enum(TransactionType),
    category: z
      .string()
      .trim()
      .min(1, 'category is required')
      .max(100, 'category must be at most 100 characters'),
  })
  .strict()

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>

export const listTransactionsQuerySchema = z
  .object({
    period: z.enum(['week', 'month', 'year']).optional(),
    category: z.string().trim().min(1).max(100).optional(),
    startDate: z.coerce.date().optional(),
    endDate: z.coerce.date().optional(),
  })
  .strip()
  .superRefine((data, ctx) => {
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'startDate must be before or equal to endDate',
        path: ['startDate'],
      })
    }
  })

export type ListTransactionsQuery = z.infer<typeof listTransactionsQuerySchema>
