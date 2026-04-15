import { Module } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { StripeController } from './infrastructure/http/stripe.controller';
import { CreateCheckoutSessionUseCase } from './application/use-cases/create-checkout-session.use-case';
import { HandleStripeWebhookUseCase } from './application/use-cases/handle-stripe-webhook.use-case';
import { TenantModule } from '../../libs/tenant/tenant.module';

@Module({
  imports: [TenantModule],
  controllers: [StripeController],
  providers: [
    StripeService,
    CreateCheckoutSessionUseCase,
    HandleStripeWebhookUseCase,
  ],
  exports: [StripeService],
})
export class StripeModule {}
