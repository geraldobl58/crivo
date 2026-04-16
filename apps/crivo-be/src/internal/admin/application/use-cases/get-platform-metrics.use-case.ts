import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../libs/prisma/prisma.service';

@Injectable()
export class GetPlatformMetricsUseCase {
  constructor(private readonly prisma: PrismaService) {}

  async execute() {
    const [
      totalCompanies,
      totalUsers,
      subscriptionsByStatus,
      subscriptionsByPlan,
      revenueResult,
      recentCompanies,
    ] = await Promise.all([
      this.prisma.company.count(),
      this.prisma.user.count(),
      this.prisma.subscription.groupBy({
        by: ['status'],
        _count: { id: true },
      }),
      this.prisma.subscription.groupBy({
        by: ['planId'],
        _count: { id: true },
      }),
      this.prisma.invoice.aggregate({
        _sum: { amountPaid: true },
        where: { status: 'PAID' },
      }),
      this.prisma.company.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          createdAt: true,
          subscription: {
            select: {
              status: true,
              plan: { select: { type: true, name: true } },
            },
          },
        },
      }),
    ]);

    // Resolve plan names for the groupBy results
    const planIds = subscriptionsByPlan.map((s) => s.planId);
    const plans = await this.prisma.plan.findMany({
      where: { id: { in: planIds } },
      select: { id: true, type: true, name: true },
    });

    const planMap = new Map(plans.map((p) => [p.id, p]));

    return {
      overview: {
        totalCompanies,
        totalUsers,
        totalRevenue: revenueResult._sum.amountPaid ?? 0,
      },
      subscriptionsByStatus: subscriptionsByStatus.map((s) => ({
        status: s.status,
        count: s._count.id,
      })),
      subscriptionsByPlan: subscriptionsByPlan.map((s) => ({
        planType: planMap.get(s.planId)?.type ?? 'UNKNOWN',
        planName: planMap.get(s.planId)?.name ?? 'Unknown',
        count: s._count.id,
      })),
      recentCompanies: recentCompanies.map((c) => ({
        id: c.id,
        name: c.name,
        createdAt: c.createdAt,
        planType: c.subscription?.plan.type ?? null,
        status: c.subscription?.status ?? null,
      })),
    };
  }
}
