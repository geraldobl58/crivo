"use server";

import { serverFetch } from "@/config/server-api";
import type { SubscriptionInfo, CompanyInfo, DashboardData } from "../types";

interface ActionResult<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function getDashboardDataAction(): Promise<
  ActionResult<DashboardData>
> {
  try {
    const [subscription, companiesRes, usersRes] = await Promise.all([
      serverFetch<SubscriptionInfo>("/subscriptions/me").catch(() => null),
      serverFetch<{ items: CompanyInfo[]; total: number }>("/companies", {
        params: { page: 1, limit: 1 },
      }).catch(() => null),
      serverFetch<{ items: unknown[]; total: number }>("/users", {
        params: { page: 1, limit: 1 },
      }).catch(() => null),
    ]);

    const company = companiesRes?.items?.[0] ?? null;
    const usage = {
      users: usersRes?.total ?? 0,
      companies: companiesRes?.total ?? 0,
    };

    return {
      success: true,
      data: { subscription, company, usage },
    };
  } catch (error) {
    console.error("[dashboard] failed to load data:", error);
    return {
      success: false,
      message: "Erro ao carregar dados do dashboard.",
    };
  }
}

export async function createPortalSessionAction(): Promise<
  ActionResult<{ url: string }>
> {
  try {
    const data = await serverFetch<{ url: string }>("/stripe/portal", {
      method: "POST",
    });
    return { success: true, data };
  } catch (error) {
    console.error("[dashboard] portal session failed:", error);
    return {
      success: false,
      message: "Erro ao abrir portal de pagamentos.",
    };
  }
}

export async function getSubscriptionStatusAction(): Promise<
  ActionResult<{ status: string }>
> {
  try {
    const subscription =
      await serverFetch<SubscriptionInfo>("/subscriptions/me");
    return { success: true, data: { status: subscription.status } };
  } catch {
    return { success: false, message: "Erro ao verificar assinatura." };
  }
}
