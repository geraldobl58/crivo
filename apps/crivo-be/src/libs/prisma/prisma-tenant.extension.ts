import { ForbiddenException, NotFoundException } from '@nestjs/common';
import type { PrismaClient } from '@prisma/client';

const TENANT_MODELS = ['User', 'Subscription', 'ChartOfAccount'] as const;

type TenantModelName = (typeof TENANT_MODELS)[number];

function isTenantModel(model: string | undefined): model is TenantModelName {
  return TENANT_MODELS.includes(model as TenantModelName);
}

function modelAccessor(model: string): string {
  return model.charAt(0).toLowerCase() + model.slice(1);
}

const READ_OPS = [
  'findFirst',
  'findFirstOrThrow',
  'findMany',
  'count',
  'aggregate',
  'groupBy',
] as const;

const BULK_WRITE_OPS = ['updateMany', 'deleteMany'] as const;
const UNIQUE_READ_OPS = ['findUnique', 'findUniqueOrThrow'] as const;
const UNIQUE_WRITE_OPS = ['update', 'delete'] as const;

export function withTenantFilter<T extends PrismaClient>(
  prisma: T,
  companyId: string,
) {
  return prisma.$extends({
    query: {
      $allModels: {
        async $allOperations({
          model,
          operation,
          args,
          query,
        }: {
          model?: string;
          operation: string;
          args: any;
          query: (args: any) => Promise<any>;
        }) {
          if (!isTenantModel(model)) {
            return query(args);
          }

          // Read operations with flexible where — inject companyId
          if (
            (READ_OPS as readonly string[]).includes(operation) ||
            (BULK_WRITE_OPS as readonly string[]).includes(operation)
          ) {
            args.where = { ...args.where, companyId };
            return query(args);
          }

          // findUnique — post-validate tenant ownership
          if ((UNIQUE_READ_OPS as readonly string[]).includes(operation)) {
            const result = await query(args);
            if (result && (result as any).companyId !== companyId) {
              if (operation === 'findUniqueOrThrow') {
                throw new NotFoundException('Record not found');
              }
              return null;
            }
            return result;
          }

          // update/delete with unique where — pre-check ownership
          if ((UNIQUE_WRITE_OPS as readonly string[]).includes(operation)) {
            const accessor = modelAccessor(model!);
            const existing = await (prisma as any)[accessor].findUnique({
              where: args.where,
              select: { companyId: true },
            });

            if (!existing || existing.companyId !== companyId) {
              throw new ForbiddenException(
                'Access denied: record does not belong to your organization',
              );
            }

            return query(args);
          }

          // Create — force companyId
          if (operation === 'create') {
            args.data = { ...args.data, companyId };
            return query(args);
          }

          if (operation === 'createMany') {
            const data = Array.isArray(args.data) ? args.data : [args.data];
            args.data = data.map((d: any) => ({ ...d, companyId }));
            return query(args);
          }

          // Upsert — force companyId on create side
          if (operation === 'upsert') {
            args.create = { ...args.create, companyId };
            return query(args);
          }

          return query(args);
        },
      },
    },
  });
}
