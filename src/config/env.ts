import { z } from 'zod'

const baseEnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  FIREBASE_PROJECT_ID: z.string().min(1, 'FIREBASE_PROJECT_ID is required'),
  FIREBASE_CLIENT_EMAIL: z.email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().optional(),
  FIREBASE_CREDENTIALS_JSON: z.string().optional(),
  FRONTEND_ORIGIN: z.string().min(1, 'FRONTEND_ORIGIN is required'),
})

export const envSchema = baseEnvSchema.superRefine((env, ctx) => {
  const hasJsonCreds = Boolean(env.FIREBASE_CREDENTIALS_JSON)
  const hasPairCreds = Boolean(
    env.FIREBASE_CLIENT_EMAIL && env.FIREBASE_PRIVATE_KEY,
  )

  if (!hasJsonCreds && !hasPairCreds) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        'Firebase credentials are required. Provide FIREBASE_CREDENTIALS_JSON or both FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY.',
      path: ['FIREBASE_CREDENTIALS_JSON'],
    })
  }
})

export type Env = z.infer<typeof envSchema>

export function validateEnv(config: Record<string, unknown>): Env {
  const result = envSchema.safeParse(config)

  if (!result.success) {
    const details = result.error.issues
      .map((issue) => `${issue.path.join('.') || 'env'}: ${issue.message}`)
      .join('; ')
    throw new Error(`Environment validation failed: ${details}`)
  }

  return result.data
}
