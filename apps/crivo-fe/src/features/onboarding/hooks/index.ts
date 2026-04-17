"use client";

import { useCallback, useState } from "react";
import { syncAction, activateCompanyAction } from "../actions";
import type { SyncResponse } from "../types";

type OnboardingState = {
  isLoading: boolean;
  error: string | null;
  syncResult: SyncResponse | null;
};

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isLoading: false,
    error: null,
    syncResult: null,
  });

  const onboardNewUser = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));

    try {
      const selectedPlanId = sessionStorage.getItem("plan_id");

      // PASSO 1: Sync — cria Company + User (status: trialing)
      const syncResult = await syncAction(selectedPlanId ?? undefined);

      if (!syncResult.success || !syncResult.data) {
        throw new Error(syncResult.message || "Sync failed");
      }

      // PASSO 2: Mock Payment — ativa a empresa se ela já existir
      // Para novos usuários, company é null — eles criarão via POST /companies
      if (syncResult.data.is_new && syncResult.data.company?.id) {
        await activateCompanyAction(syncResult.data.company.id);
      }

      // PASSO 3: Limpar sessionStorage
      sessionStorage.removeItem("plan_id");
      sessionStorage.removeItem("plan_name");

      setState({
        isLoading: false,
        error: null,
        syncResult: syncResult.data,
      });

      return syncResult.data;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro inesperado";
      setState({ isLoading: false, error: message, syncResult: null });
      return null;
    }
  }, []);

  return {
    ...state,
    onboardNewUser,
  };
}
