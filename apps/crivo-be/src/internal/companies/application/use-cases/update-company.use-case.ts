import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

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

  async execute(
    id: string,
    data: UpdateCompanyData,
    companyId?: string,
  ): Promise<CompanyEntity> {
    const existing = await this.companyRepository.findById(id);

    if (!existing) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }

    if (
      companyId &&
      existing.id !== companyId &&
      existing.parentCompanyId !== companyId
    ) {
      throw new ForbiddenException(
        'Acesso negado: empresa não pertence à sua organização',
      );
    }

    return this.companyRepository.update(id, data);
  }
}
