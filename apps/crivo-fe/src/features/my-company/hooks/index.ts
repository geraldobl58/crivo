"use client";

import { useCallback, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { CompanyQueryParams } from "../schemas";
import { getCompanyAction } from "../actions";

const COMPANIES_QUERY_KEY = "companies";

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
