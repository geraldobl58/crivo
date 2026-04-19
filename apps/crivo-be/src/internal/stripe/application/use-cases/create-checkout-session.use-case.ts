import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { PlanType } from '@prisma/client';
import { PrismaService } from '../../../../libs/prisma/prisma.service';
import { StripeService } from '../../stripe.service';

export interface CreateCheckoutSessionInput {
  keycloakId: string;
  companyId: string;
  planType: PlanType;
}

export interface CreateCheckoutSessionResult {
  url: string;
}

@Injectable()
export class CreateCheckoutSessionUseCase {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly config: ConfigService,
  ) {}

  async execute(
    input: CreateCheckoutSessionInput,
  ): Promise<CreateCheckoutSessionResult> {
    const { keycloakId, companyId, planType } = input;

    // Validate plan exists
    const plan = await this.prisma.plan.findUnique({
      where: { type: planType },
    });

    if (!plan) {
      throw new NotFoundException(`Plan "${planType}" not found`);
    }

    if (!plan.isActive) {
      throw new BadRequestException(
        `Plan "${planType}" is currently unavailable`,
      );
    }

    if (!plan.stripePriceId) {
      throw new BadRequestException(
        `Plan "${planType}" has no Stripe price configured`,
      );
    }

    // Load company with subscription
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: { subscription: true },
    });

    if (!company) {
      throw new NotFoundException(`Company not found`);
    }

    // Load user email for Stripe customer
    const user = await this.prisma.user.findUnique({
      where: { keycloakId },
      select: { email: true },
    });

    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    // Create or reuse Stripe customer
    let stripeCustomerId = company.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await this.stripe.createCustomer({
        email: user.email,
        metadata: { companyId },
      });

      stripeCustomerId = customer.id;

      await this.prisma.company.update({
        where: { id: companyId },
        data: { stripeCustomerId },
      });
    }

    const frontendUrl =
      this.config.get<string>('FRONTEND_URL') ?? 'http://localhost:3000';

    const session = await this.stripe.createCheckoutSession({
      customerId: stripeCustomerId as string,
      priceId: plan.stripePriceId,
      successUrl: `${frontendUrl}/secure/dashboard?checkout=success`,
      cancelUrl: `${frontendUrl}/secure/dashboard?checkout=canceled`,
      metadata: {
        companyId,
        planType,
      },
    });

    return { url: session.url as string };
  }
}
