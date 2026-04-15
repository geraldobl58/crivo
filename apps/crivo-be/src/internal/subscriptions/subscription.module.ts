import { Module } from '@nestjs/common';

import { SUBSCRIPTION_REPOSITORY } from './domain/repository/subscription.repository';
import { PrismaSubscriptionRepository } from './infrastructure/prisma/prisma-subscription.repository';

import { GetMySubscriptionUseCase } from './application/use-cases/get-my-subscription.use-case';
import { GetInvoicesUseCase } from './application/use-cases/get-invoices.use-case';

import { SubscriptionController } from './infrastructure/http/subscription.controller';

@Module({
  controllers: [SubscriptionController],
  providers: [
    {
      provide: SUBSCRIPTION_REPOSITORY,
      useClass: PrismaSubscriptionRepository,
    },
    GetMySubscriptionUseCase,
    GetInvoicesUseCase,
  ],
  exports: [SUBSCRIPTION_REPOSITORY],
})
export class SubscriptionModule {}
