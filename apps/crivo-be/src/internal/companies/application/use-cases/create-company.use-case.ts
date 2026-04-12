import { ConflictException, Inject, Injectable } from '@nestjs/common';

import { COMPANY_REPOSITORY } from '../../domain/repository/company.repository';
import type {
  CompanyRepository,
  CreateCompanyData,
} from '../../domain/repository/company.repository';
import type { CompanyEntity } from '../../domain/entities/company.entity';

@Injectable()
export class CreateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(data: CreateCompanyData): Promise<CompanyEntity> {
    const existing = await this.companyRepository.findByTaxId(data.taxId);

    if (existing) {
      throw new ConflictException(
        `Já existe uma empresa com o CNPJ ${data.taxId}`,
      );
    }

    return this.companyRepository.create(data);
  }
}
