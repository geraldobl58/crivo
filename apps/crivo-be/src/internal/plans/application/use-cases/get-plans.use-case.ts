import { Inject, Injectable } from '@nestjs/common';

import type { PlanRepository } from '../../domain/repository/plan.repository';
import { PLAN_REPOSITORY } from '../../domain/repository/plan.repository';
import type {
  PlanFilters,
  PaginatedResult,
} from '../../domain/repository/plan.repository';
import { PlanEntity } from '../../domain/entities/plan.entity';

@Injectable()
export class GetPlansUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(filters: PlanFilters): Promise<PaginatedResult<PlanEntity>> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 10));

    return await this.planRepository.findMany({
      ...filters,
      page,
      limit,
    });
  }
}
