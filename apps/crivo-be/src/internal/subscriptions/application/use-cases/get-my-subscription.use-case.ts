import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import type { SubscriptionRepository } from '../../domain/repository/subscription.repository';
import { SUBSCRIPTION_REPOSITORY } from '../../domain/repository/subscription.repository';
import { SubscriptionEntity } from '../../domain/entities/subscription.entity';

@Injectable()
export class GetMySubscriptionUseCase {
  constructor(
    @Inject(SUBSCRIPTION_REPOSITORY)
    private readonly subscriptionRepository: SubscriptionRepository,
  ) {}

  async execute(companyId: string): Promise<SubscriptionEntity> {
    const subscription =
      await this.subscriptionRepository.findByCompanyId(companyId);

    if (!subscription) {
      throw new NotFoundException(
        'Nenhuma assinatura encontrada para esta empresa',
      );
    }

    return subscription;
  }
}
