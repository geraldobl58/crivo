import { Module } from '@nestjs/common';

import { ListCompaniesUseCase } from './application/use-cases/list-companies.use-case';
import { GetCompanyDetailUseCase } from './application/use-cases/get-company-detail.use-case';
import { GetPlatformMetricsUseCase } from './application/use-cases/get-platform-metrics.use-case';
import { ImpersonateUserUseCase } from './application/use-cases/impersonate-user.use-case';

import { AdminController } from './infrastructure/http/admin.controller';
import { RolesGuard } from '../../libs/guards/roles.guard';

@Module({
  controllers: [AdminController],
  providers: [
    ListCompaniesUseCase,
    GetCompanyDetailUseCase,
    GetPlatformMetricsUseCase,
    ImpersonateUserUseCase,
    RolesGuard,
  ],
})
export class AdminModule {}
