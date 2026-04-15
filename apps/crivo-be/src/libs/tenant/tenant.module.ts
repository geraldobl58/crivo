import { Global, Module } from '@nestjs/common';
import { TenantService } from './tenant.service';
import { TenantInterceptor } from './tenant.interceptor';
import { TenantPrismaService } from './tenant-prisma.service';

@Global()
@Module({
  providers: [TenantService, TenantInterceptor, TenantPrismaService],
  exports: [TenantService, TenantInterceptor, TenantPrismaService],
})
export class TenantModule {}
