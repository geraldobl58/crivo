import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../libs/prisma/prisma.service';
import type {
  PlanRepository,
  PlanFilters,
  CreatePlanData,
  UpdatePlanData,
  PaginatedResult,
} from '../../domain/repository/plan.repository';
import { PlanEntity } from '../../domain/entities/plan.entity';
import type { PlanType } from '@prisma/client';

@Injectable()
export class PrismaPlanRepository implements PlanRepository {
  constructor(private readonly prisma: PrismaService) {}

  private toEntity(record: Record<string, unknown>): PlanEntity {
    return new PlanEntity({
      id: record.id as string,
      type: record.type as PlanType,
      name: record.name as string,
      description: (record.description as string) ?? null,
      priceMonthly: record.priceMonthly as number,
      stripePriceId: (record.stripePriceId as string) ?? null,
      trialDays: record.trialDays as number,
      maxUsers: record.maxUsers as number,
      maxCompany: record.maxCompany as number,
      maxTransactions: record.maxTransactions as number,
      maxContacts: record.maxContacts as number,
      isActive: record.isActive as boolean,
      createdAt: record.createdAt as Date,
      updatedAt: record.updatedAt as Date,
    });
  }

  async create(data: CreatePlanData): Promise<PlanEntity> {
    const plan = await this.prisma.plan.create({
      data: {
        type: data.type,
        name: data.name,
        ...(data.description && { description: data.description }),
        priceMonthly: data.priceMonthly,
        ...(data.stripePriceId && { stripePriceId: data.stripePriceId }),
        ...(data.trialDays !== undefined && { trialDays: data.trialDays }),
        ...(data.maxUsers !== undefined && { maxUsers: data.maxUsers }),
        ...(data.maxCompany !== undefined && { maxCompany: data.maxCompany }),
        ...(data.maxTransactions !== undefined && {
          maxTransactions: data.maxTransactions,
        }),
        ...(data.maxContacts !== undefined && {
          maxContacts: data.maxContacts,
        }),
      },
    });
    return this.toEntity(plan);
  }

  async findMany(filters: PlanFilters): Promise<PaginatedResult<PlanEntity>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.isActive !== undefined && { isActive: filters.isActive }),
    };

    const [items, total] = await Promise.all([
      this.prisma.plan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { priceMonthly: 'asc' },
      }),
      this.prisma.plan.count({ where }),
    ]);

    return {
      items: items.map((item) => this.toEntity(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<PlanEntity | null> {
    const plan = await this.prisma.plan.findUnique({
      where: { id },
    });

    return plan ? this.toEntity(plan) : null;
  }

  async findByType(type: PlanType): Promise<PlanEntity | null> {
    const plan = await this.prisma.plan.findUnique({
      where: { type },
    });

    return plan ? this.toEntity(plan) : null;
  }

  async update(id: string, data: UpdatePlanData): Promise<PlanEntity> {
    const plan = await this.prisma.plan.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.description !== undefined && {
          description: data.description,
        }),
        ...(data.priceMonthly !== undefined && {
          priceMonthly: data.priceMonthly,
        }),
        ...(data.stripePriceId !== undefined && {
          stripePriceId: data.stripePriceId,
        }),
        ...(data.trialDays !== undefined && { trialDays: data.trialDays }),
        ...(data.maxUsers !== undefined && { maxUsers: data.maxUsers }),
        ...(data.maxCompany !== undefined && { maxCompany: data.maxCompany }),
        ...(data.maxTransactions !== undefined && {
          maxTransactions: data.maxTransactions,
        }),
        ...(data.maxContacts !== undefined && {
          maxContacts: data.maxContacts,
        }),
      },
    });
    return this.toEntity(plan);
  }
}
