import { Injectable } from '@nestjs/common';

import { PrismaService } from '../../../../libs/prisma/prisma.service';
import {
  CompanyRepository,
  CompanyFilters,
  CreateCompanyData,
  UpdateCompanyData,
  PaginatedResult,
} from '../../domain/repository/company.repository';
import { CompanyEntity } from '../../domain/entities/company.entity';

@Injectable()
export class PrismaCompanyRepository implements CompanyRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: CreateCompanyData): Promise<CompanyEntity> {
    const company = await this.prisma.company.create({ data });
    return new CompanyEntity(company);
  }

  async findMany(
    filters: CompanyFilters,
  ): Promise<PaginatedResult<CompanyEntity>> {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
      ...(filters.name && {
        name: { contains: filters.name, mode: 'insensitive' as const },
      }),
    };

    const [items, total] = await Promise.all([
      this.prisma.company.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.company.count({ where }),
    ]);

    return {
      items: items.map((item) => new CompanyEntity(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findById(id: string): Promise<CompanyEntity | null> {
    const company = await this.prisma.company.findUnique({ where: { id } });
    return company ? new CompanyEntity(company) : null;
  }

  async findByTaxId(taxId: string): Promise<CompanyEntity | null> {
    const company = await this.prisma.company.findUnique({ where: { taxId } });
    return company ? new CompanyEntity(company) : null;
  }

  async update(id: string, data: UpdateCompanyData): Promise<CompanyEntity> {
    const company = await this.prisma.company.update({
      where: { id },
      data,
    });
    return new CompanyEntity(company);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.company.delete({ where: { id } });
  }
}
