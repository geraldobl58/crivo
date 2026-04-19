"use client";

import { useCallback, useState, useEffect, useRef } from "react";
import {
  getDashboardDataAction,
  createPortalSessionAction,
  getSubscriptionStatusAction,
} from "../actions";
import type { DashboardData } from "../types";

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const result = await getDashboardDataAction();
    if (result.success && result.data) {
      setData(result.data);
    } else {
      setError(result.message ?? "Erro ao carregar dados.");
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return { data, isLoading, error, refetch: loadData };
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

const POLL_INTERVAL = 3000;
const POLL_TIMEOUT = 60000;
const ACTIVE_STATUSES = new Set(["ACTIVE", "TRIALING"]);

export type CheckoutPollingState = "idle" | "polling" | "confirmed" | "timeout";

export function useCheckoutPolling(shouldPoll: boolean) {
  const [state, setState] = useState<CheckoutPollingState>("idle");
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startRef = useRef<number>(0);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!shouldPoll) return;

    setState("polling");
    startRef.current = Date.now();

    const poll = async () => {
      const result = await getSubscriptionStatusAction();
      if (
        result.success &&
        result.data &&
        ACTIVE_STATUSES.has(result.data.status)
      ) {
        cleanup();
        setState("confirmed");
        return;
      }
      if (Date.now() - startRef.current >= POLL_TIMEOUT) {
        cleanup();
        setState("timeout");
      }
    };

    // First check immediately
    poll();
    timerRef.current = setInterval(poll, POLL_INTERVAL);

    return cleanup;
  }, [shouldPoll, cleanup]);

  return state;
}
