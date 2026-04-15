import { CompanyEntity } from '../entities/company.entity';

export type CreateCompanyData = {
  name: string;
  taxId?: string;
  parentCompanyId?: string;
};

export type UpdateCompanyData = Partial<
  Omit<CreateCompanyData, 'parentCompanyId'>
>;

export type CompanyFilters = {
  companyId?: string;
  name?: string;
  page?: number;
  limit?: number;
};

export type PaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export const COMPANY_REPOSITORY = 'CompanyRepository';

export interface CompanyRepository {
  create(data: CreateCompanyData): Promise<CompanyEntity>;
  findMany(filters: CompanyFilters): Promise<PaginatedResult<CompanyEntity>>;
  findById(id: string): Promise<CompanyEntity | null>;
  findByTaxId(taxId: string): Promise<CompanyEntity | null>;
  update(id: string, data: UpdateCompanyData): Promise<CompanyEntity>;
  delete(id: string): Promise<void>;
}
