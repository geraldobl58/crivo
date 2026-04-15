import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { UserRole } from '@prisma/client';

import { PrismaService } from '../prisma/prisma.service';
import { ROLES_KEY } from './roles.decorator';
import type { JwtPayload } from '../auth/jwt.strategy';

/**
 * Guard that restricts route access based on the user's database role.
 *
 * Execution order: Runs AFTER JwtAuthGuard (which sets request.user from the
 * validated JWT). Reads the role directly from the database to ensure it
 * reflects the current state, not a potentially stale JWT claim.
 *
 * Must be used after @UseInterceptors(TenantInterceptor) is NOT required —
 * this guard is self-sufficient and queries the DB using request.user.sub.
 */
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // No roles required — allow all authenticated users
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const payload = request.user as JwtPayload | undefined;

    if (!payload?.sub) {
      throw new UnauthorizedException('Invalid token: missing sub claim');
    }

    const user = await this.prisma.user.findUnique({
      where: { keycloakId: payload.sub },
      select: { role: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not registered in the system');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException(
        `Access denied. Required roles: ${requiredRoles.join(', ')}. ` +
          `Your role: ${user.role}.`,
      );
    }

    return true;
  }
}
