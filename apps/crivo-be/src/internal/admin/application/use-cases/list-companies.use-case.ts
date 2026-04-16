import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../libs/prisma/prisma.service';

export interface ListCompaniesInput {
  name?: string;
  status?: string;
  planType?: string;
  page?: number;
  limit?: number;
}

@Injectable()
export class ListCompaniesUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute(input: ListCompaniesInput) {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (input.name) {
      where.name = { contains: input.name, mode: 'insensitive' };
    }

    if (input.status || input.planType) {
      where.subscription = {};
      if (input.status) {
        (where.subscription as Record<string, unknown>).status = input.status;
      }
      if (input.planType) {
        (where.subscription as Record<string, unknown>).plan = {
          type: input.planType,
        };
      }
    }

    const [items, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: { select: { users: true, childCompanies: true } },
          subscription: {
            include: { plan: { select: { type: true, name: true } } },
          },
        },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      items: items.map((c) => ({
        id: c.id,
        name: c.name,
        taxId: c.taxId,
        stripeCustomerId: c.stripeCustomerId,
        parentCompanyId: c.parentCompanyId,
        usersCount: c._count.users,
        childCompaniesCount: c._count.childCompanies,
        subscription: c.subscription
          ? {
              id: c.subscription.id,
              status: c.subscription.status,
              planType: c.subscription.plan.type,
              planName: c.subscription.plan.name,
              currentPeriodEnd: c.subscription.currentPeriodEnd,
              cancelAtPeriodEnd: c.subscription.cancelAtPeriodEnd,
            }
          : null,
        createdAt: c.createdAt,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
