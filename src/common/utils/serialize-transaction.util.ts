import { Prisma } from '@prisma/client'

export function serializeTransaction<T>(transaction: T): T {
  return JSON.parse(
    JSON.stringify(transaction, (_key, value: unknown) => {
      if (value instanceof Prisma.Decimal) {
        return value.toString()
      }

      return value
    }),
  ) as T
}
