import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PlanType } from '@prisma/client';
import { PrismaService } from '../../../../libs/prisma/prisma.service';
import { StripeService } from '../../../stripe/stripe.service';

export interface OnboardCompanyInput {
  keycloakId: string;
  planType: PlanType;
  companyName: string;
}

export interface OnboardCompanyResult {
  company: { id: string; name: string };
  subscription: { id: string; status: string };
  checkoutUrl: string;
}

@Injectable()
export class OnboardCompanyUseCase {
  private readonly logger = new Logger(OnboardCompanyUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly config: ConfigService,
  ) {}

  async execute(input: OnboardCompanyInput): Promise<OnboardCompanyResult> {
    const user = await this.prisma.user.findUnique({
      where: { keycloakId: input.keycloakId },
      include: { company: true },
    });

    if (!user) {
      throw new NotFoundException(
        'User not found. Authenticate first so JIT provisioning creates your account.',
      );
    }

    if (user.companyId) {
      throw new ConflictException(
        'User is already associated with a company. Use POST /stripe/checkout to change plan.',
      );
    }

    // Validate plan exists and is active
    const plan = await this.prisma.plan.findUnique({
      where: { type: input.planType },
    });

    if (!plan) {
      throw new NotFoundException(`Plan type "${input.planType}" not found`);
    }

    if (!plan.isActive) {
      throw new BadRequestException(
        `Plan type "${input.planType}" is currently unavailable`,
      );
    }

    if (!plan.stripePriceId) {
      throw new BadRequestException(
        `Plan "${input.planType}" has no Stripe price configured`,
      );
    }

    // --- Atomic operation: Stripe Customer + Company + Subscription + User link ---
    let stripeCustomer: { id: string };

    try {
      stripeCustomer = await this.stripe.createCustomer({
        email: user.email,
        metadata: { keycloakId: input.keycloakId },
      });
    } catch (error) {
      this.logger.error('Failed to create Stripe customer', error);
      throw new BadRequestException(
        'Failed to create payment account. Please try again.',
      );
    }

    let company: { id: string; name: string };
    let subscription: { id: string; status: string };

    try {
      const result = await this.prisma.$transaction(async (tx) => {
        const newCompany = await tx.company.create({
          data: {
            name: input.companyName,
            stripeCustomerId: stripeCustomer.id,
          },
        });

        const newSubscription = await tx.subscription.create({
          data: {
            companyId: newCompany.id,
            planId: plan.id,
            status: 'INCOMPLETE',
          },
        });

        await tx.user.update({
          where: { id: user.id },
          data: {
            companyId: newCompany.id,
            role: 'OWNER',
            pendingPlanType: input.planType,
          },
        });

        return { company: newCompany, subscription: newSubscription };
      });

      company = result.company;
      subscription = result.subscription;
    } catch (error) {
      // Rollback: delete Stripe customer if Prisma transaction failed
      this.logger.error(
        'Prisma transaction failed, cleaning up Stripe customer',
        error,
      );
      try {
        await this.stripe.deleteCustomer(stripeCustomer.id);
      } catch (cleanupError) {
        this.logger.error('Failed to cleanup Stripe customer', cleanupError);
      }
      throw error;
    }

    // Create Stripe Checkout Session
    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

    let checkoutUrl: string;

    try {
      const session = await this.stripe.createCheckoutSession({
        customerId: stripeCustomer.id,
        priceId: plan.stripePriceId,
        successUrl: `${frontendUrl}/dashboard?checkout=success`,
        cancelUrl: `${frontendUrl}/plans?checkout=canceled`,
        metadata: {
          companyId: company.id,
          planType: input.planType,
        },
      });

      checkoutUrl = session.url as string;
    } catch (error) {
      this.logger.error('Failed to create Stripe checkout session', error);
      throw new BadRequestException(
        'Failed to create checkout session. Please try again.',
      );
    }

    this.logger.log(
      `Onboarding completed for user ${user.id} → company ${company.id} (plan: ${input.planType})`,
    );

    return {
      company: { id: company.id, name: company.name },
      subscription: { id: subscription.id, status: subscription.status },
      checkoutUrl,
    };
  }
}
