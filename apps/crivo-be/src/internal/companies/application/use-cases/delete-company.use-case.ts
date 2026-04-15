import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { COMPANY_REPOSITORY } from '../../domain/repository/company.repository';
import type { CompanyRepository } from '../../domain/repository/company.repository';

@Injectable()
export class DeleteCompanyUseCase {
  constructor(
    @Inject(COMPANY_REPOSITORY)
    private readonly companyRepository: CompanyRepository,
  ) {}

  async execute(id: string, companyId?: string): Promise<void> {
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

    await this.companyRepository.delete(id);
  }
}
