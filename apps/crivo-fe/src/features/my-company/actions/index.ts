"use server";

import { serverFetch } from "@/config/server-api";
import {
  CompanyQueryParams,
  CompanyListResponse,
  CompanyResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "../schemas";
import { CompanyActionResponse, CompanyInfoResponse } from "../types";

export async function getCompanyAction(
  params?: CompanyQueryParams,
): Promise<CompanyInfoResponse> {
  try {
    const response = await serverFetch<CompanyListResponse>("/companies", {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        ...(params?.search ? { search: params.search } : {}),
      },
    });
    return {
      success: true,
      message: "Empresas recuperadas com sucesso.",
      data: response,
    };
  } catch (error) {
    console.error("Erro ao recuperar empresas:", error);
    return {
      success: false,
      message: "Erro ao recuperar empresas. Por favor, tente novamente.",
    };
  }
}

export async function createCompanyAction(
  body: CreateCompanyRequest,
): Promise<CompanyActionResponse<{ id: string }>> {
  try {
    const data = await serverFetch<{ id: string }>("/companies", {
      method: "POST",
      body,
    });
    return { success: true, data, message: "Empresa criada com sucesso." };
  } catch (error) {
    console.error("Erro ao criar empresa:", error);
    return {
      success: false,
      message: "Erro ao criar empresa. Tente novamente.",
    };
  }
}

export async function updateCompanyAction(
  id: string,
  body: UpdateCompanyRequest,
): Promise<CompanyActionResponse<CompanyResponse>> {
  try {
    const data = await serverFetch<CompanyResponse>(`/companies/${id}`, {
      method: "PATCH",
      body,
    });
    return { success: true, data, message: "Empresa atualizada com sucesso." };
  } catch (error) {
    console.error("Erro ao atualizar empresa:", error);
    return {
      success: false,
      message: "Erro ao atualizar empresa. Tente novamente.",
    };
  }
}

export async function deleteCompanyAction(
  id: string,
): Promise<CompanyActionResponse<void>> {
  try {
    await serverFetch<void>(`/companies/${id}`, { method: "DELETE" });
    return { success: true, message: "Empresa removida com sucesso." };
  } catch (error) {
    console.error("Erro ao remover empresa:", error);
    return {
      success: false,
      message: "Erro ao remover empresa. Tente novamente.",
    };
  }
}
