import { Inject, Injectable } from '@nestjs/common';

import { COMPANY_REPOSITORY } from '../../domain/repository/company.repository';
import type {
  CompanyFilters,
  CompanyRepository,
  PaginatedResult,
} from '../../domain/repository/company.repository';
import type { CompanyEntity } from '../../domain/entities/company.entity';

@Injectable()
export class GetCompaniesUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(
    filters: CompanyFilters,
  ): Promise<PaginatedResult<CompanyEntity>> {
    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 10));

    return await this.companyRepository.findMany({
      ...filters,
      page,
      limit,
    });
  }
}
