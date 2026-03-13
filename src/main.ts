import { Logger, ValidationPipe } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { NestFactory } from '@nestjs/core'

import { AppModule } from './app.module'
import { HttpExceptionFilter } from './common/filters/http-exception.filter'
import { LoggingInterceptor } from './common/interceptors/logging.interceptor'

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  })

  app.enableShutdownHooks()

  const configService = app.get(ConfigService)
  const frontendOrigin = configService.getOrThrow<string>('FRONTEND_ORIGIN')
  const nodeEnv = configService.getOrThrow<string>('NODE_ENV')

  app.setGlobalPrefix('api')
  app.enableCors({
    origin: frontendOrigin.split(',').map((origin) => origin.trim()),
    credentials: true,
  })

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  app.useGlobalFilters(new HttpExceptionFilter(nodeEnv))
  app.useGlobalInterceptors(new LoggingInterceptor())

  const port = configService.getOrThrow<number>('PORT')
  await app.listen(port)

  const logger = new Logger('Bootstrap')
  logger.log(`API running on port ${port}`)
}

void bootstrap()
