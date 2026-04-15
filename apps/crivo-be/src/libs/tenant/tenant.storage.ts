import { AsyncLocalStorage } from 'node:async_hooks';
import type { TenantContext } from './tenant.context';

export const tenantStorage = new AsyncLocalStorage<TenantContext>();
