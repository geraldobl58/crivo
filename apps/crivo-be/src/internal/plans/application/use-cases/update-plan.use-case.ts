import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type {
  PlanRepository,
  UpdatePlanData,
} from '../../domain/repository/plan.repository';
import { PLAN_REPOSITORY } from '../../domain/repository/plan.repository';
import { PlanEntity } from '../../domain/entities/plan.entity';

@Injectable()
export class UpdatePlanUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(id: string, data: UpdatePlanData): Promise<PlanEntity> {
    const existing = await this.planRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Plano com ID ${id} não encontrado`);
    }

    return this.planRepository.update(id, data);
  }
}
