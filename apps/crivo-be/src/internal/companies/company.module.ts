import { Module } from '@nestjs/common';

import { COMPANY_REPOSITORY } from './domain/repository/company.repository';
import { PrismaCompanyRepository } from './infrastructure/prisma/prisma-company.repository';

import { CreateCompanyUseCase } from './application/use-cases/create-company.use-case';
import { GetCompaniesUseCase } from './application/use-cases/get-company.use-case';
import { GetCompanyByIdUseCase } from './application/use-cases/get-company-by-id.use-case';
import { UpdateCompanyUseCase } from './application/use-cases/update-company.use-case';
import { DeleteCompanyUseCase } from './application/use-cases/delete-company.use-case';

import { CompanyController } from './infrastructure/http/company.controller';

@Module({
  controllers: [CompanyController],
  providers: [
    {
      provide: COMPANY_REPOSITORY,
      useClass: PrismaCompanyRepository,
    },
    CreateCompanyUseCase,
    GetCompaniesUseCase,
    GetCompanyByIdUseCase,
    UpdateCompanyUseCase,
    DeleteCompanyUseCase,
  ],
  exports: [COMPANY_REPOSITORY],
})
export class CompanyModule {}
