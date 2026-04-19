import api from "@/config/api";
import { env } from "@/config/env";
import type { SetupCompanyInput, SetupCompanyResponse } from "../types";

export async function setupCompany(
  input: SetupCompanyInput,
  token?: string,
): Promise<SetupCompanyResponse> {
  // Server-side: call backend directly (bypass Kong gateway)
  if (token) {
    const res = await fetch(
      `${env.INTERNAL_API_URL}/onboarding/setup-company`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(input),
      },
    );

    if (!res.ok) {
      const error = await res.json().catch(() => ({}));
      const err = new Error(
        error.message || `Request failed with status ${res.status}`,
      );
      (err as any).response = { status: res.status, data: error };
      throw err;
    }

    return res.json();
  }

  // Client-side: go through Kong (Axios interceptor adds token)
  const { data } = await api.post<SetupCompanyResponse>(
    "/onboarding/setup-company",
    input,
  );
  return data;
}
