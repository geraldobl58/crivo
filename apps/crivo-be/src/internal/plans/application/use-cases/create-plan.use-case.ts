import { ConflictException, Inject, Injectable } from '@nestjs/common';

import type {
  PlanRepository,
  CreatePlanData,
} from '../../domain/repository/plan.repository';
import { PLAN_REPOSITORY } from '../../domain/repository/plan.repository';
import { PlanEntity } from '../../domain/entities/plan.entity';

@Injectable()
export class CreatePlanUseCase {
  constructor(
    @Inject(PLAN_REPOSITORY)
    private readonly planRepository: PlanRepository,
  ) {}

  async execute(data: CreatePlanData): Promise<PlanEntity> {
    const existing = await this.planRepository.findByType(data.type);

    if (existing) {
      throw new ConflictException(`Já existe um plano com o tipo ${data.type}`);
    }

    return this.planRepository.create(data);
  }
}
