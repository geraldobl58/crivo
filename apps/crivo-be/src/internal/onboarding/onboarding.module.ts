import { Module } from '@nestjs/common';
import { OnboardCompanyUseCase } from './application/use-cases/onboard-company.use-case';
import { OnboardingController } from './infrastructure/http/onboarding.controller';
import { StripeModule } from '../stripe/stripe.module';

@Module({
  imports: [StripeModule],
  controllers: [OnboardingController],
  providers: [OnboardCompanyUseCase],
})
export class OnboardingModule {}
