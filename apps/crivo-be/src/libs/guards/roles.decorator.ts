import { SetMetadata } from '@nestjs/common';
import type { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Restricts access to the route to users with at least one of the specified roles.
 * Roles are resolved from the database via RolesGuard (using the JWT sub claim).
 *
 * @example
 * @Roles('ADMIN', 'OWNER')
 * @Post()
 * create(...) {}
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
