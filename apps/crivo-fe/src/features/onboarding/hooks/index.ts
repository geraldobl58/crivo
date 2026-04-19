"use client";

import { useCallback, useState } from "react";
import { setupCompanyAction } from "../actions";
import type { SetupCompanyInput } from "../types";
import { clearPlanSelection } from "@/utils/plan-cookie";

type OnboardingState = {
  isLoading: boolean;
  error: string | null;
  checkoutUrl: string | null;
};

export function useSetupCompany() {
  const [state, setState] = useState<OnboardingState>({
    isLoading: false,
    error: null,
    checkoutUrl: null,
  });

  const setupCompany = useCallback(async (input: SetupCompanyInput) => {
    setState({ isLoading: true, error: null, checkoutUrl: null });

    try {
      const result = await setupCompanyAction(input);

      if (!result.success || !result.data) {
        throw new Error(result.message || "Falha ao configurar empresa");
      }

      clearPlanSelection();

      setState({
        isLoading: false,
        error: null,
        checkoutUrl: result.data.checkoutUrl,
      });

      return result.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado";
      setState({ isLoading: false, error: message, checkoutUrl: null });
      return null;
    }
  }, []);

  return {
    ...state,
    setupCompany,
  };
}
