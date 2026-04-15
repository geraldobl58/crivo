import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TenantService } from './tenant.service';
import { withTenantFilter } from '../prisma/prisma-tenant.extension';

/**
 * Provides a Prisma client extended with automatic companyId filtering.
 * Uses AsyncLocalStorage via TenantService — no REQUEST scope needed.
 */
@Injectable()
export class TenantPrismaService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tenant: TenantService,
  ) {}

  get client() {
    return withTenantFilter(this.prisma, this.tenant.companyId);
  }
}
