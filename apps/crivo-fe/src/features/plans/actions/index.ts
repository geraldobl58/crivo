"use server";

import { serverFetch } from "@/config/server-api";
import type { PlanInfo, PlanListResponse, PlansPageData } from "../types";
import type { SubscriptionInfo } from "@/features/dashboard/types";

interface ActionResult<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function getPlansPageDataAction(): Promise<
  ActionResult<PlansPageData>
> {
  try {
    const [plansRes, subscription] = await Promise.all([
      serverFetch<PlanListResponse>("/plans", {
        params: { isActive: true, limit: 20 },
      }),
      serverFetch<SubscriptionInfo>("/subscriptions/me").catch(() => null),
    ]);

    return {
      success: true,
      data: {
        plans: plansRes.items,
        currentPlanType: subscription?.plan?.type ?? null,
        subscriptionStatus: subscription?.status ?? null,
      },
    };
  } catch (error) {
    console.error("[plans] failed to load data:", error);
    return {
      success: false,
      message: "Erro ao carregar planos.",
    };
  }
}

export async function getActivePlansAction(): Promise<
  ActionResult<PlanInfo[]>
> {
  try {
    const res = await serverFetch<PlanListResponse>("/plans", {
      params: { isActive: true, limit: 20 },
    });
    return { success: true, data: res.items };
  } catch (error) {
    console.error("[plans] failed to load plans:", error);
    return { success: false, message: "Erro ao carregar planos." };
  }
}

export async function createCheckoutAction(
  planType: string,
): Promise<ActionResult<{ url: string }>> {
  try {
    const data = await serverFetch<{ url: string }>("/stripe/checkout", {
      method: "POST",
      body: { planType },
    });
    return { success: true, data };
  } catch (error) {
    console.error("[plans] checkout failed:", error);
    return {
      success: false,
      message: "Erro ao iniciar checkout. Tente novamente.",
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
    console.error("[plans] portal session failed:", error);
    return {
      success: false,
      message: "Erro ao abrir portal de pagamentos.",
    };
  }
}
