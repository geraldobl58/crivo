import { SubscriptionEntity } from '../entities/subscription.entity';
import { InvoiceEntity } from '../entities/invoice.entity';

export type InvoiceFilters = {
  subscriptionId: string;
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

export const SUBSCRIPTION_REPOSITORY = 'SubscriptionRepository';

export interface SubscriptionRepository {
  findByCompanyId(companyId: string): Promise<SubscriptionEntity | null>;
  findInvoices(
    filters: InvoiceFilters,
  ): Promise<PaginatedResult<InvoiceEntity>>;
}
