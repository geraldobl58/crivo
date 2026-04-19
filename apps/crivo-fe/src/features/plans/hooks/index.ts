"use client";

import { useCallback, useState, useEffect } from "react";
import {
  getPlansPageDataAction,
  createCheckoutAction,
  createPortalSessionAction,
} from "../actions";
import type { PlansPageData } from "../types";

export function usePlansPage() {
  const [data, setData] = useState<PlansPageData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getPlansPageDataAction();
    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.message ?? "Erro ao carregar planos.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, refetch: loadData };
}

export function useCheckout() {
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async (planType: string) => {
    setLoadingPlan(planType);
    setError(null);
    try {
      const result = await createCheckoutAction(planType);
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      } else {
        setError(result.message ?? "Erro ao iniciar checkout.");
      }
    } finally {
      setLoadingPlan(null);
    }
  }, []);

  return { startCheckout, loadingPlan, error };
}

export function usePortalSession() {
  const [isLoading, setIsLoading] = useState(false);

  const openPortal = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await createPortalSessionAction();
      if (result.success && result.data?.url) {
        window.location.href = result.data.url;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { openPortal, isLoading };
}
