import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { COMPANY_REPOSITORY } from '../../domain/repository/company.repository';
import type {
  CompanyRepository,
  UpdateCompanyData,
} from '../../domain/repository/company.repository';
import type { CompanyEntity } from '../../domain/entities/company.entity';

@Injectable()
export class UpdateCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(id: string, data: UpdateCompanyData): Promise<CompanyEntity> {
    const existing = await this.companyRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }

    return this.companyRepository.update(id, data);
  }
}
