import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type {
  SubscriptionRepository,
  InvoiceFilters,
  PaginatedResult,
} from '../../domain/repository/subscription.repository';
import { SUBSCRIPTION_REPOSITORY } from '../../domain/repository/subscription.repository';
import { InvoiceEntity } from '../../domain/entities/invoice.entity';

@Injectable()
export class GetInvoicesUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(
    companyId: string,
    filters: Omit<InvoiceFilters, 'subscriptionId'>,
  ): Promise<PaginatedResult<InvoiceEntity>> {
    const subscription =
      await this.subscriptionRepository.findByCompanyId(companyId);

    if (!subscription) {
      throw new NotFoundException(
        'Nenhuma assinatura encontrada para esta empresa',
      );
    }

    const page = Math.max(1, filters.page ?? 1);
    const limit = Math.min(100, Math.max(1, filters.limit ?? 10));

    return await this.subscriptionRepository.findInvoices({
      subscriptionId: subscription.id,
      page,
      limit,
    });
  }
}
