import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../../libs/prisma/prisma.service';

@Injectable()
export class GetCompanyDetailUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(companyId: string) {
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
      include: {
        users: {
          select: {
            id: true,
            email: true,
            firstname: true,
            lastname: true,
            role: true,
            keycloakId: true,
            createdAt: true,
          },
          orderBy: { createdAt: 'asc' },
        },
        subscription: {
          include: {
            plan: true,
            invoices: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          },
        },
        childCompanies: {
          select: { id: true, name: true, taxId: true, createdAt: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!company) {
      throw new NotFoundException(`Company ${companyId} not found`);
    }

    return {
      id: company.id,
      name: company.name,
      taxId: company.taxId,
      stripeCustomerId: company.stripeCustomerId,
      parentCompanyId: company.parentCompanyId,
      createdAt: company.createdAt,
      updatedAt: company.updatedAt,
      users: company.users,
      childCompanies: company.childCompanies,
      subscription: company.subscription
        ? {
            id: company.subscription.id,
            status: company.subscription.status,
            stripeSubscriptionId: company.subscription.stripeSubscriptionId,
            currentPeriodStart: company.subscription.currentPeriodStart,
            currentPeriodEnd: company.subscription.currentPeriodEnd,
            trialStart: company.subscription.trialStart,
            trialEnd: company.subscription.trialEnd,
            cancelAtPeriodEnd: company.subscription.cancelAtPeriodEnd,
            canceledAt: company.subscription.canceledAt,
            createdAt: company.subscription.createdAt,
            plan: {
              id: company.subscription.plan.id,
              type: company.subscription.plan.type,
              name: company.subscription.plan.name,
              priceMonthly: company.subscription.plan.priceMonthly,
              maxUsers: company.subscription.plan.maxUsers,
              maxCompany: company.subscription.plan.maxCompany,
            },
            invoices: company.subscription.invoices.map((inv) => ({
              id: inv.id,
              stripeInvoiceId: inv.stripeInvoiceId,
              status: inv.status,
              amountDue: inv.amountDue,
              amountPaid: inv.amountPaid,
              currency: inv.currency,
              invoiceUrl: inv.invoiceUrl,
              paidAt: inv.paidAt,
              createdAt: inv.createdAt,
            })),
          }
        : null,
    };
  }
}
