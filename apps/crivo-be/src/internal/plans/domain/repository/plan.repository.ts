import type { PlanType } from '@prisma/client';

import { PlanEntity } from '../entities/plan.entity';

export type CreatePlanData = {
  type: PlanType;
  name: string;
  description?: string;
  priceMonthly: number;
  stripePriceId?: string;
  trialDays?: number;
  maxUsers?: number;
  maxCompany?: number;
  maxTransactions?: number;
  maxContacts?: number;
};

export type UpdatePlanData = Partial<Omit<CreatePlanData, 'type'>>;

export type PlanFilters = {
  isActive?: boolean;
  page?: number;
  limit?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const PLAN_REPOSITORY = 'PlanRepository';

export interface PlanRepository {
  create(data: CreatePlanData): Promise<PlanEntity>;
  findMany(filters: PlanFilters): Promise<PaginatedResult<PlanEntity>>;
  findById(id: string): Promise<PlanEntity | null>;
  findByType(type: PlanType): Promise<PlanEntity | null>;
  update(id: string, data: UpdatePlanData): Promise<PlanEntity>;
}
