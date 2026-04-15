import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import type { Request } from 'express';
import type { PlanType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { TenantContext } from './tenant.context';
import type { JwtPayload } from '../auth/jwt.strategy';
import { tenantStorage } from './tenant.storage';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<unknown>> {
    const request = context.switchToHttp().getRequest<Request>();

    const payload = request.user as JwtPayload | undefined;

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token: missing sub claim');
    }

    const keycloakId = payload.sub;

    const user = await this.prisma.user.findUnique({
      where: { keycloakId },
      include: {
        company: {
          include: {
            subscription: {
              include: { plan: true },
            },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not registered in the system');
    }

    if (!user.company) {
      throw new UnauthorizedException(
        'User is not associated with any company',
      );
    }

    const planType: PlanType = user.company.subscription?.plan?.type ?? 'TRIAL';

    const tenantContext: TenantContext = {
      companyId: user.companyId!,
      userId: user.id,
      keycloakId: user.keycloakId,
      planType,
    };

    // Store in request (for decorator-based access)
    request.tenantContext = tenantContext;

    // Store in AsyncLocalStorage (for global access in services/repositories)
    return new Observable((subscriber) => {
      tenantStorage.run(tenantContext, () => {
        next.handle().subscribe(subscriber);
      });
    });
  }
}
