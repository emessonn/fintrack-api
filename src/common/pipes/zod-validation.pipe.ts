import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common'
import { ZodSchema } from 'zod'

@Injectable()
export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value)

    if (!result.success) {
      const details = result.error.issues
        .map((issue) => `${issue.path.join('.') || 'field'}: ${issue.message}`)
        .join('; ')

      throw new BadRequestException({
        message: 'Validation error',
        details,
      })
    }

    return result.data
  }
}
