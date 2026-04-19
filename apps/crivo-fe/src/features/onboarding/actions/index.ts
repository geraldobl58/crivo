"use server";

import { serverFetch } from "@/config/server-api";
import type { SetupCompanyInput, SetupCompanyResponse } from "../types";

type ActionResult<T> = {
  success: boolean;
  message?: string;
  data?: T;
};

export async function setupCompanyAction(
  input: SetupCompanyInput,
): Promise<ActionResult<SetupCompanyResponse>> {
  try {
    const data = await serverFetch<SetupCompanyResponse>(
      "/onboarding/setup-company",
      { method: "POST", body: input },
    );
    return { success: true, data };
  } catch (error: unknown) {
    const status = (error as { response?: { status?: number } })?.response
      ?.status;

    if (status === 409) {
      return {
        success: false,
        message: "Você já possui uma empresa cadastrada.",
      };
    }

    console.error("[onboarding] setup-company failed:", error);
    return {
      success: false,
      message: "Erro ao configurar empresa. Tente novamente.",
    };
  }
}
