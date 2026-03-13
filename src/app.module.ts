import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

import { AuthModule } from './auth/auth.module'
import { BillsModule } from './bills/bills.module'
import { CategoriesModule } from './categories/categories.module'
import { validateEnv } from './config/env'
import { HealthModule } from './health/health.module'
import { PrismaModule } from './prisma/prisma.module'
import { TransactionsModule } from './transactions/transactions.module'

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    PrismaModule,
    AuthModule,
    BillsModule,
    CategoriesModule,
    TransactionsModule,
    HealthModule,
  ],
})
export class AppModule {}
