import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { COMPANY_REPOSITORY } from '../../domain/repository/company.repository';
import type { CompanyRepository } from '../../domain/repository/company.repository';
import type { CompanyEntity } from '../../domain/entities/company.entity';

@Injectable()
export class GetCompanyByIdUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(id: string, companyId?: string): Promise<CompanyEntity> {
    const company = await this.companyRepository.findById(id);

    if (!company) {
      throw new NotFoundException(`Empresa com ID ${id} não encontrada`);
    }

    if (
      companyId &&
      company.id !== companyId &&
      company.parentCompanyId !== companyId
    ) {
      throw new ForbiddenException(
        'Acesso negado: empresa não pertence à sua organização',
      );
    }

    return company;
  }
}
