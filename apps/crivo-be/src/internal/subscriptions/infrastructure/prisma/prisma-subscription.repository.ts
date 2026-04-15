import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../libs/prisma/prisma.service';
import type {
  SubscriptionRepository,
  InvoiceFilters,
  PaginatedResult,
} from '../../domain/repository/subscription.repository';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';
import type { SubscriptionPlanInfo } from '../../domain/entities/subscription.entity';
import { InvoiceEntity } from '../../domain/entities/invoice.entity';
import type {
  SubscriptionStatus,
  InvoiceStatus,
  PlanType,
} from '@prisma/client';

@Injectable()
export class PrismaSubscriptionRepository implements SubscriptionRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toSubscriptionEntity(
    record: Record<string, unknown>,
  ): SubscriptionEntity {
    const plan = record.plan as
      | {
          type: PlanType;
          name: string;
          priceMonthly: number;
          maxUsers: number;
          maxCompany: number;
          maxTransactions: number;
          maxContacts: number;
        }
      | null
      | undefined;

    const planInfo: SubscriptionPlanInfo | null = plan
      ? {
          type: plan.type,
          name: plan.name,
          priceMonthly: plan.priceMonthly,
          maxUsers: plan.maxUsers,
          maxCompany: plan.maxCompany,
          maxTransactions: plan.maxTransactions,
          maxContacts: plan.maxContacts,
        }
      : null;

    return new SubscriptionEntity({
      id: record.id as string,
      companyId: record.companyId as string,
      planId: record.planId as string,
      stripeSubscriptionId: (record.stripeSubscriptionId as string) ?? null,
      status: record.status as SubscriptionStatus,
      currentPeriodStart: (record.currentPeriodStart as Date) ?? null,
      currentPeriodEnd: (record.currentPeriodEnd as Date) ?? null,
      trialStart: (record.trialStart as Date) ?? null,
      trialEnd: (record.trialEnd as Date) ?? null,
      cancelAtPeriodEnd: record.cancelAtPeriodEnd as boolean,
      canceledAt: (record.canceledAt as Date) ?? null,
      plan: planInfo,
      createdAt: record.createdAt as Date,
      updatedAt: record.updatedAt as Date,
    });
  }

  private toInvoiceEntity(record: Record<string, unknown>): InvoiceEntity {
    return new InvoiceEntity({
      id: record.id as string,
      subscriptionId: record.subscriptionId as string,
      stripeInvoiceId: (record.stripeInvoiceId as string) ?? null,
      stripePaymentIntentId: (record.stripePaymentIntentId as string) ?? null,
      status: record.status as InvoiceStatus,
      amountDue: record.amountDue as number,
      amountPaid: record.amountPaid as number,
      currency: record.currency as string,
      invoiceUrl: (record.invoiceUrl as string) ?? null,
      invoicePdf: (record.invoicePdf as string) ?? null,
      periodStart: (record.periodStart as Date) ?? null,
      periodEnd: (record.periodEnd as Date) ?? null,
      paidAt: (record.paidAt as Date) ?? null,
      createdAt: record.createdAt as Date,
      updatedAt: record.updatedAt as Date,
    });
  }

  async findByCompanyId(companyId: string): Promise<SubscriptionEntity | null> {
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
      include: {
        plan: {
          select: {
            type: true,
            name: true,
            priceMonthly: true,
            maxUsers: true,
            maxCompany: true,
            maxTransactions: true,
            maxContacts: true,
          },
        },
      },
    });

    return subscription ? this.toSubscriptionEntity(subscription) : null;
  }

  async findInvoices(
    filters: InvoiceFilters,
  ): Promise<PaginatedResult<InvoiceEntity>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = { subscriptionId: filters.subscriptionId };

    const [items, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toInvoiceEntity(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
