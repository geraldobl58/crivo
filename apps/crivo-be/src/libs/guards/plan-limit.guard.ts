import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { PrismaService } from '../prisma/prisma.service';
import {
  PLAN_RESOURCE_KEY,
  type PlanResourceType,
} from './plan-resource.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

/**
 * Guard that enforces subscription plan limits for resource creation.
 *
 * Execution order: Runs AFTER JwtAuthGuard (which sets request.user from the
 * validated JWT). Queries the DB directly using request.user.sub — does NOT
 * depend on TenantInterceptor (which runs later, as an interceptor).
 *
 * Use @PlanResource('users' | 'company') on the route handler to specify which
 * resource limit to enforce. Defaults to 'users' when no decorator is present.
 *
 * @example
 * @Post()
 * @UseGuards(PlanLimitGuard)
 * @PlanResource('users')
 * create(...) {}
 */
@Injectable()
export class PlanLimitGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const payload = request.user as JwtPayload | undefined;

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token: missing sub claim');
    }

    const user = await this.prisma.user.findUnique({
      where: { keycloakId: payload.sub },
      include: {
        company: {
          include: {
            subscription: { include: { plan: true } },
          },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not registered in the system');
    }

    const subscription = user.company?.subscription;
    const plan = subscription?.plan;

    if (!subscription || !plan) {
      throw new ForbiddenException(
        'No active subscription found for this company. Please subscribe to a plan.',
      );
    }

    const activeStatuses = ['ACTIVE', 'TRIALING'];
    if (!activeStatuses.includes(subscription.status)) {
      throw new ForbiddenException(
        `Subscription is not active (current status: ${subscription.status}). ` +
          'Please renew your subscription to continue.',
      );
    }

    const resource =
      this.reflector.getAllAndOverride<PlanResourceType>(PLAN_RESOURCE_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? 'users';

    if (resource === 'users') {
      const maxUsers = plan.maxUsers;

      // -1 means unlimited
      if (maxUsers === -1) return true;

      const currentCount = await this.prisma.user.count({
        where: { companyId: user.companyId! },
      });

      if (currentCount >= maxUsers) {
        throw new ForbiddenException(
          `User limit reached for your "${plan.name}" plan. ` +
            `Current: ${currentCount}/${maxUsers} users. ` +
            'Please upgrade your plan to add more users.',
        );
      }
    }

    if (resource === 'company') {
      const maxCompany = plan.maxCompany;
      if (maxCompany !== -1) {
        const childCount = await this.prisma.company.count({
          where: { parentCompanyId: user.companyId! },
        });

        // Total includes the parent company itself + its children
        const totalCount = 1 + childCount;

        if (totalCount >= maxCompany) {
          throw new ForbiddenException(
            `Company limit reached for your "${plan.name}" plan. ` +
              `Current: ${totalCount}/${maxCompany} companies. ` +
              'Please upgrade your plan to add more companies.',
          );
        }
      }
    }

    return true;
  }
}
