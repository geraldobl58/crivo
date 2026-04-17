"use client";

import { useCallback, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CompanyQueryParams } from "../schemas";
import { getCompanyAction, getMeAction } from "../actions";

const COMPANIES_QUERY_KEY = "companies";
const ME_QUERY_KEY = "auth-me";

export function useCompanies(initialParams?: CompanyQueryParams) {
  const [queryParams, setQueryParams] = useState<CompanyQueryParams>(
    initialParams ?? { page: 1, limit: 10 },
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [COMPANIES_QUERY_KEY, queryParams],
    queryFn: async () => {
      const result = await getCompanyAction(queryParams);
      if (!result.success) {
        throw new Error(result.message || "Erro ao buscar empresas");
      }
      return result.data;
    },
    placeholderData: keepPreviousData,
  });

  const handlePageChange = useCallback((page: number) => {
    setQueryParams((prev) => ({ ...prev, page }));
  }, []);

  const handleLimitChange = useCallback((limit: number) => {
    setQueryParams((prev) => ({ ...prev, limit, page: 1 }));
  }, []);

  const handleFilters = useCallback((filters: Partial<CompanyQueryParams>) => {
    setQueryParams((prev) => ({
      page: 1,
      limit: prev.limit ?? 10,
      ...filters,
    }));
  }, []);

  return {
    rows: data?.data ?? [],
    total: data?.total ?? 0,
    isLoading,
    isFetching,
    isError,
    error: error as Error | null,
    refetch,
    queryParams,
    handlePageChange,
    handleLimitChange,
    handleFilters,
  };
}

/**
 * usePlanLimit — verifica se o usuário atingiu o limite de empresas do plano.
 *
 * Busca GET /auth/me (React Query, cache 5 min) e expõe:
 *   - isAtLimit: true se total_atual >= max_companies (e o plano não é ilimitado)
 *   - limitMessage: mensagem legível para exibir no tooltip / alert
 *   - maxCompanies: limite do plano (-1 = ilimitado)
 *   - isLoading: enquanto a chamada está em andamento
 */
export function usePlanLimit(currentTotal: number) {
  const { data, isLoading } = useQuery({
    queryKey: [ME_QUERY_KEY],
    queryFn: async () => {
      const result = await getMeAction();
      if (!result.success || !result.data) return null;
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutos de cache — plano muda raramente
  });

  const maxCompanies = data?.plan?.max_companies ?? null;
  const planName = data?.plan?.name ?? null;

  // -1 = ilimitado (enterprise); null = ainda carregando
  const isAtLimit =
    maxCompanies !== null && maxCompanies !== -1
      ? currentTotal >= maxCompanies
      : false;

  const limitMessage = isAtLimit
    ? `Seu plano ${planName ? `(${planName})` : ""} permite no máximo ${maxCompanies} empresa${maxCompanies === 1 ? "" : "s"}. Faça upgrade para adicionar mais.`
    : null;

  return { isAtLimit, limitMessage, maxCompanies, planName, isLoading };
}

