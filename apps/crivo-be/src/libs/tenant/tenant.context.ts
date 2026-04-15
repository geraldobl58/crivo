import type { PlanType } from '@prisma/client';

export interface TenantContext {
  readonly companyId: string;
  readonly userId: string;
  readonly keycloakId: string;
  readonly planType: PlanType;
}

declare module 'express' {
  interface Request {
    tenantContext?: TenantContext;
  }
}
