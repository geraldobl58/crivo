"use server";

import {
  createCompany,
  deleteCompany,
  getCompanies,
  getMe,
  updateCompany,
} from "../http";
import {
  CompanyQueryParams,
  CompanyResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "../schemas";
import { CompanyActionResponse, CompanyInfoResponse } from "../types";

export async function getCompanyAction(
  params?: CompanyQueryParams,
): Promise<CompanyInfoResponse> {
  try {
    const response = await getCompanies(params);
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
    const data = await createCompany(body);
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
    const data = await updateCompany(id, body);
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
    await deleteCompany(id);
    return { success: true, message: "Empresa removida com sucesso." };
  } catch (error) {
    console.error("Erro ao remover empresa:", error);
    return {
      success: false,
      message: "Erro ao remover empresa. Tente novamente.",
    };
  }
}

export async function getMeAction(): Promise<{
  success: boolean;
  data?: any;
  message?: string;
}> {
  try {
    const data = await getMe();
    return { success: true, data };
  } catch (error) {
    console.error("Erro ao buscar dados do usuário:", error);
    return { success: false, message: "Erro ao buscar dados do usuário." };
  }
}
