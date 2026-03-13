import { z } from 'zod'

const limitSchema = z
  .union([z.number(), z.string()])
  .transform((value) => String(value).trim())
  .refine((value) => /^\d+(\.\d{1,2})?$/.test(value), {
    message: 'limit must be a valid decimal value with up to 2 decimal places',
  })

export const createCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'name is required')
      .max(100, 'name must be at most 100 characters'),
    limit: limitSchema.optional(),
  })
  .strict()

export type CreateCategoryInput = z.infer<typeof createCategorySchema>

export const updateCategorySchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, 'name is required')
      .max(100, 'name must be at most 100 characters')
      .optional(),
    limit: limitSchema.nullable().optional(),
  })
  .strict()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  })

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>

export const categoryIdParamSchema = z
  .object({
    id: z.string().uuid('id must be a valid uuid'),
  })
  .strict()

export type CategoryIdParam = z.infer<typeof categoryIdParamSchema>

export const listCategoriesQuerySchema = z
  .object({
    search: z.string().trim().min(1).max(100).optional(),
  })
  .strip()

export type ListCategoriesQuery = z.infer<typeof listCategoriesQuerySchema>
