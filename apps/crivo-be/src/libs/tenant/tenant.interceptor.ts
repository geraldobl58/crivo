import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import type { Request } from 'express';
import type { PlanType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { TenantContext } from './tenant.context';
import type { JwtPayload } from '../auth/jwt.strategy';
import { tenantStorage } from './tenant.storage';

export const ALLOW_EXPIRED_TRIAL = 'ALLOW_EXPIRED_TRIAL';
export const AllowExpiredTrial = () => SetMetadata(ALLOW_EXPIRED_TRIAL, true);

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

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

    const subscription = user.company.subscription;
    const planType: PlanType = subscription?.plan?.type ?? 'TRIAL';

    // Block expired trial users (unless endpoint opts out)
    const allowExpired = this.reflector.getAllAndOverride<boolean>(
      ALLOW_EXPIRED_TRIAL,
      [context.getHandler(), context.getClass()],
    );

    if (
      !allowExpired &&
      subscription?.status === 'TRIALING' &&
      subscription?.trialEnd &&
      new Date(subscription.trialEnd) < new Date()
    ) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Seu período de teste expirou. Faça upgrade para continuar.',
        error: 'TRIAL_EXPIRED',
      });
    }

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
