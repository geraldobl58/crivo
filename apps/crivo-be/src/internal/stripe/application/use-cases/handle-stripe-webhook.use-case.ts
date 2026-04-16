import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import type Stripe from 'stripe';
import { PrismaService } from '../../../../libs/prisma/prisma.service';
import { StripeService } from '../../stripe.service';
import { MailService } from '../../../../libs/mail/mail.service';
import { SubscriptionStatus, InvoiceStatus, PlanType } from '@prisma/client';

export interface HandleStripeWebhookInput {
  rawBody: Buffer;
  signature: string;
}

@Injectable()
export class HandleStripeWebhookUseCase {
  private readonly logger = new Logger(HandleStripeWebhookUseCase.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly stripe: StripeService,
    private readonly mail: MailService,
  ) {}

  async execute(input: HandleStripeWebhookInput): Promise<void> {
    let event: ReturnType<StripeService['constructWebhookEvent']>;

    try {
      event = this.stripe.constructWebhookEvent(input.rawBody, input.signature);
    } catch {
      throw new BadRequestException('Invalid Stripe webhook signature');
    }

    this.logger.log(`Stripe event received: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await this.handleCheckoutSessionCompleted(event.data.object as any);
        break;
      case 'customer.subscription.updated':
        await this.handleSubscriptionUpdated(event.data.object as any);
        break;
      case 'customer.subscription.deleted':
        await this.handleSubscriptionDeleted(event.data.object as any);
        break;
      case 'invoice.payment_succeeded':
        await this.handleInvoicePaymentSucceeded(event.data.object as any);
        break;
      case 'invoice.payment_failed':
        await this.handleInvoicePaymentFailed(event.data.object as any);
        break;
      default:
        this.logger.debug(`Unhandled Stripe event type: ${event.type}`);
    }
  }

  private async handleCheckoutSessionCompleted(session: any): Promise<void> {
    const companyId = session.metadata?.companyId;
    const planType = session.metadata?.planType as PlanType | undefined;

    if (!companyId || !planType) {
      this.logger.warn(
        'checkout.session.completed: missing companyId or planType metadata',
      );
      return;
    }

    const stripeSubscriptionId =
      typeof session.subscription === 'string'
        ? session.subscription
        : session.subscription?.id;

    if (!stripeSubscriptionId) {
      this.logger.warn(
        'checkout.session.completed: no subscription ID in session',
      );
      return;
    }

    const plan = await this.prisma.plan.findUnique({
      where: { type: planType },
    });

    if (!plan) {
      this.logger.error(
        `checkout.session.completed: plan "${planType}" not found`,
      );
      return;
    }

    // Fetch subscription details from Stripe for period dates
    const stripeSub = (await this.stripe.retrieveSubscription(
      stripeSubscriptionId,
    )) as any;

    // Since Stripe API 2025-03-31+, period dates live on subscription items
    const item = stripeSub.items?.data?.[0];
    const periodStart =
      item?.current_period_start ?? stripeSub.current_period_start;
    const periodEnd = item?.current_period_end ?? stripeSub.current_period_end;

    await this.prisma.subscription.upsert({
      where: { companyId },
      create: {
        companyId,
        planId: plan.id,
        stripeSubscriptionId,
        status: this.mapStripeStatus(stripeSub.status),
        ...(periodStart
          ? { currentPeriodStart: new Date(periodStart * 1000) }
          : {}),
        ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}),
      },
      update: {
        planId: plan.id,
        stripeSubscriptionId,
        status: this.mapStripeStatus(stripeSub.status),
        ...(periodStart
          ? { currentPeriodStart: new Date(periodStart * 1000) }
          : {}),
        ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        canceledAt: null,
      },
    });

    // Clear pendingPlanType for all users in this company
    await this.prisma.user.updateMany({
      where: { companyId, pendingPlanType: { not: null } },
      data: { pendingPlanType: null },
    });

    this.logger.log(
      `Subscription activated for company ${companyId} on plan ${planType}`,
    );
  }

  private async handleSubscriptionUpdated(stripeSub: any): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSub.id },
    });

    if (!subscription) {
      this.logger.warn(
        `subscription.updated: no local subscription for ${stripeSub.id}`,
      );
      return;
    }

    // Since Stripe API 2025-03-31+, period dates live on subscription items
    const item = stripeSub.items?.data?.[0];
    const periodStart =
      item?.current_period_start ?? stripeSub.current_period_start;
    const periodEnd = item?.current_period_end ?? stripeSub.current_period_end;

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: this.mapStripeStatus(stripeSub.status),
        ...(periodStart
          ? { currentPeriodStart: new Date(periodStart * 1000) }
          : {}),
        ...(periodEnd ? { currentPeriodEnd: new Date(periodEnd * 1000) } : {}),
        cancelAtPeriodEnd: stripeSub.cancel_at_period_end,
        canceledAt: stripeSub.canceled_at
          ? new Date(stripeSub.canceled_at * 1000)
          : null,
      },
    });

    this.logger.log(
      `Subscription ${subscription.id} updated to ${stripeSub.status}`,
    );
  }

  private async handleSubscriptionDeleted(stripeSub: any): Promise<void> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSub.id },
    });

    if (!subscription) {
      this.logger.warn(
        `subscription.deleted: no local subscription for ${stripeSub.id}`,
      );
      return;
    }

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELED,
        canceledAt: new Date(),
        cancelAtPeriodEnd: false,
      },
    });

    // Send cancellation email to company owner
    const owner = await this.prisma.user.findFirst({
      where: { companyId: subscription.companyId, role: 'OWNER' },
      select: { email: true, company: { select: { name: true } } },
    });

    if (owner) {
      await this.mail.sendSubscriptionCanceled({
        to: owner.email,
        companyName: owner.company?.name ?? 'Sua empresa',
      });
    }

    this.logger.log(`Subscription ${subscription.id} canceled`);
  }

  private async handleInvoicePaymentSucceeded(invoice: any): Promise<void> {
    if (!invoice.subscription) return;

    const stripeSubId =
      typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription.id;

    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSubId },
    });

    if (!subscription) return;

    await this.prisma.invoice.upsert({
      where: { stripeInvoiceId: invoice.id },
      create: {
        subscriptionId: subscription.id,
        stripeInvoiceId: invoice.id,
        stripePaymentIntentId:
          typeof invoice.payment_intent === 'string'
            ? invoice.payment_intent
            : (invoice.payment_intent?.id ?? null),
        status: InvoiceStatus.PAID,
        amountDue: invoice.amount_due,
        amountPaid: invoice.amount_paid,
        currency: invoice.currency,
      },
      update: {
        status: InvoiceStatus.PAID,
        amountPaid: invoice.amount_paid,
        stripePaymentIntentId:
          typeof invoice.payment_intent === 'string'
            ? invoice.payment_intent
            : (invoice.payment_intent?.id ?? null),
      },
    });

    this.logger.log(
      `Invoice ${invoice.id} paid for subscription ${subscription.id}`,
    );

    // Send payment confirmation email to company owner
    const owner = await this.prisma.user.findFirst({
      where: { companyId: subscription.companyId, role: 'OWNER' },
      select: { email: true, company: { select: { name: true } } },
    });

    if (owner) {
      await this.mail.sendPaymentSucceeded({
        to: owner.email,
        companyName: owner.company?.name ?? 'Sua empresa',
        amountPaid: invoice.amount_paid,
        currency: invoice.currency ?? 'brl',
        invoiceId: invoice.id,
      });
    }
  }

  private async handleInvoicePaymentFailed(invoice: any): Promise<void> {
    if (!invoice.subscription) return;

    const stripeSubId =
      typeof invoice.subscription === 'string'
        ? invoice.subscription
        : invoice.subscription.id;

    const subscription = await this.prisma.subscription.findUnique({
      where: { stripeSubscriptionId: stripeSubId },
    });

    if (!subscription) return;

    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { status: SubscriptionStatus.PAST_DUE },
    });

    await this.prisma.invoice.upsert({
      where: { stripeInvoiceId: invoice.id },
      create: {
        subscriptionId: subscription.id,
        stripeInvoiceId: invoice.id,
        status: InvoiceStatus.OPEN,
        amountDue: invoice.amount_due,
        amountPaid: 0,
        currency: invoice.currency,
      },
      update: { status: InvoiceStatus.OPEN },
    });

    this.logger.warn(
      `Invoice payment failed for subscription ${subscription.id}`,
    );

    // Send payment failed email to company owner
    const owner = await this.prisma.user.findFirst({
      where: { companyId: subscription.companyId, role: 'OWNER' },
      select: { email: true, company: { select: { name: true } } },
    });

    if (owner) {
      await this.mail.sendPaymentFailed({
        to: owner.email,
        companyName: owner.company?.name ?? 'Sua empresa',
        amountDue: invoice.amount_due,
        currency: invoice.currency ?? 'brl',
      });
    }
  }

  private mapStripeStatus(stripeStatus: string): SubscriptionStatus {
    const map: Record<string, SubscriptionStatus> = {
      active: SubscriptionStatus.ACTIVE,
      trialing: SubscriptionStatus.TRIALING,
      past_due: SubscriptionStatus.PAST_DUE,
      canceled: SubscriptionStatus.CANCELED,
      unpaid: SubscriptionStatus.PAST_DUE,
      incomplete: SubscriptionStatus.INCOMPLETE,
      incomplete_expired: SubscriptionStatus.EXPIRED,
      paused: SubscriptionStatus.PAST_DUE,
    };

    return map[stripeStatus] ?? SubscriptionStatus.INCOMPLETE;
  }
}
