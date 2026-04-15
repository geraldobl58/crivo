import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { TenantContext } from './tenant.context';

export const Tenant = createParamDecorator(
  (
    data: keyof TenantContext | undefined,
    ctx: ExecutionContext,
  ): TenantContext | string => {
    const request = ctx.switchToHttp().getRequest();
    const tenantContext = request.tenantContext as TenantContext | undefined;

    if (!tenantContext) {
      throw new UnauthorizedException(
        'Tenant context not available. Ensure TenantInterceptor is applied.',
      );
    }

    return data ? tenantContext[data] : tenantContext;
  },
);
