import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'
import { ZodError } from 'zod'

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name)

  constructor(private readonly nodeEnv: string) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp()
    const request = ctx.getRequest<Request>()
    const response = ctx.getResponse<Response>()
    const requestId = request.requestId

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | object = 'Internal server error'

    if (exception instanceof ZodError) {
      status = HttpStatus.BAD_REQUEST
      message = {
        message: 'Validation error',
        details: exception.issues.map(
          (issue) => `${issue.path.join('.') || 'field'}: ${issue.message}`,
        ),
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus()
      message = exception.getResponse()
    }

    const payload = {
      statusCode: status,
      message,
      path: request.url,
      requestId,
      timestamp: new Date().toISOString(),
    }

    const errorForLog = {
      ...payload,
      method: request.method,
      userId: request.user?.uid,
      stack:
        this.nodeEnv === 'production'
          ? undefined
          : exception instanceof Error
            ? exception.stack
            : undefined,
    }

    this.logger.error(JSON.stringify(errorForLog))
    response.status(status).json(payload)
  }
}
