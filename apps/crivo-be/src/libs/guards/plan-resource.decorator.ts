import { SetMetadata } from '@nestjs/common';

export type PlanResourceType = 'users' | 'company';

export const PLAN_RESOURCE_KEY = 'plan_resource';
export const PlanResource = (resource: PlanResourceType) =>
  SetMetadata(PLAN_RESOURCE_KEY, resource);
