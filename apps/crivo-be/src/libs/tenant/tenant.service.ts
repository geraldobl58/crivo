import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { PlanType } from '@prisma/client';
import type { TenantContext } from './tenant.context';
import { tenantStorage } from './tenant.storage';

/**
 * Provides tenant context from AsyncLocalStorage.
 * Works as a singleton — no longer needs REQUEST scope.
 */
@Injectable()
export class TenantService {
  private get context(): TenantContext {
    const ctx = tenantStorage.getStore();
    if (!ctx) {
      throw new UnauthorizedException(
        'Tenant context not initialized. Ensure TenantInterceptor is applied.',
      );
    }
    return ctx;
  }

  get companyId(): string {
    return this.context.companyId;
  }

  get planType(): PlanType {
    return this.context.planType;
  }

  get userId(): string {
    return this.context.userId;
  }

  get keycloakId(): string {
    return this.context.keycloakId;
  }

  getContext(): TenantContext {
    return this.context;
  }
}
