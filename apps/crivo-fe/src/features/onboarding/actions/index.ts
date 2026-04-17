"use server";

import { syncWithCrivo, activateCompany } from "../http";
import type { SyncResponse, MockPaymentResponse } from "../types";

type ActionResult<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function syncAction(
  planId?: string,
): Promise<ActionResult<SyncResponse>> {
  try {
    const data = await syncWithCrivo(planId);
    return { success: true, data };
  } catch (error) {
    console.error("[onboarding] sync failed:", error);
    return {
      success: false,
      message: "Erro ao sincronizar com o servidor. Tente novamente.",
    };
  }
}

export async function activateCompanyAction(
  companyId: string,
): Promise<ActionResult<MockPaymentResponse>> {
  try {
    const data = await activateCompany(companyId);
    return { success: true, data };
  } catch (error) {
    console.error("[onboarding] mock-payment failed:", error);
    return {
      success: false,
      message: "Erro ao ativar empresa. Tente novamente.",
    };
  }
}
