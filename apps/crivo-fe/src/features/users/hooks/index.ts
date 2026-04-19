"use client";

import { useCallback, useState } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { UserQueryParams } from "../schemas";
import { getUsersAction } from "../actions";

const USERS_QUERY_KEY = "users";

export function useUsers(initialParams?: UserQueryParams) {
  const [queryParams, setQueryParams] = useState<UserQueryParams>(
    initialParams ?? { page: 1, limit: 10 },
  );

  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [USERS_QUERY_KEY, queryParams],
    queryFn: async () => {
      const result = await getUsersAction(queryParams);
      if (!result.success) {
        throw new Error(result.message || "Erro ao buscar usuários");
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

  const handleFilters = useCallback((filters: Partial<UserQueryParams>) => {
    setQueryParams((prev) => ({
      page: 1,
      limit: prev.limit ?? 10,
      ...filters,
    }));
  }, []);

  return {
    rows: data?.items ?? [],
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
