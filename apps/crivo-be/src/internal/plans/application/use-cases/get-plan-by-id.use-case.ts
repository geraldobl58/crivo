import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type { PlanRepository } from '../../domain/repository/plan.repository';
import { PLAN_REPOSITORY } from '../../domain/repository/plan.repository';
import { PlanEntity } from '../../domain/entities/plan.entity';

@Injectable()
export class GetPlanByIdUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(id: string): Promise<PlanEntity> {
    const plan = await this.planRepository.findById(id);

    if (!plan) {
      throw new NotFoundException(`Plano com ID ${id} não encontrado`);
    }

    return plan;
  }
}
