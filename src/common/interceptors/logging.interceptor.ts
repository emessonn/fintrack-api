import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { randomUUID } from 'crypto'
import { Request } from 'express'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request>()
    const start = Date.now()
    const requestId =
      request.headers['x-request-id']?.toString() || randomUUID()

    request.requestId = requestId

    return next.handle().pipe(
      tap(() => {
        const responseTimeMs = Date.now() - start

        this.logger.log(
          JSON.stringify({
            requestId,
            method: request.method,
            route: request.originalUrl,
            userId: request.user?.uid,
            statusCode: context.switchToHttp().getResponse().statusCode,
            responseTimeMs,
          }),
        )
      }),
    )
  }
}
