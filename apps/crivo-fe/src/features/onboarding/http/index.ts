import api from "@/config/api";
import type { SyncResponse, MockPaymentResponse } from "../types";

export async function syncWithCrivo(planId?: string): Promise<SyncResponse> {
  const { data } = await api.post<SyncResponse>("/auth/sync", {
    plan_id: planId || "00000000-0000-0000-0000-000000000001", // fallback: starter
  });
  return data;
}

export async function activateCompany(
  companyId: string,
): Promise<MockPaymentResponse> {
  const { data } = await api.post<MockPaymentResponse>(
    "/onboarding/mock-payment",
    { company_id: companyId },
  );
  return data;
}
