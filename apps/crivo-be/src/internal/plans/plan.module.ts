import { Module } from '@nestjs/common';

import { PLAN_REPOSITORY } from './domain/repository/plan.repository';
import { PrismaPlanRepository } from './infrastructure/prisma/prisma-plan.repository';

import { GetPlansUseCase } from './application/use-cases/get-plans.use-case';
import { GetPlanByIdUseCase } from './application/use-cases/get-plan-by-id.use-case';
import { CreatePlanUseCase } from './application/use-cases/create-plan.use-case';
import { UpdatePlanUseCase } from './application/use-cases/update-plan.use-case';

import { PlanController } from './infrastructure/http/plan.controller';
import { RolesGuard } from '../../libs/guards/roles.guard';

@Module({
  controllers: [PlanController],
  providers: [
    {
      provide: PLAN_REPOSITORY,
      useClass: PrismaPlanRepository,
    },
    GetPlansUseCase,
    GetPlanByIdUseCase,
    CreatePlanUseCase,
    UpdatePlanUseCase,
    RolesGuard,
  ],
  exports: [PLAN_REPOSITORY],
})
export class PlanModule {}
