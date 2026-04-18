import api from "@/config/api";

import {
  CompanyListResponse,
  CompanyQueryParams,
  CompanyResponse,
  CreateCompanyRequest,
  UpdateCompanyRequest,
} from "../schemas";

export async function getCompanies(
  params: CompanyQueryParams = {},
): Promise<CompanyListResponse> {
  const axiosParams = {
    page: params.page ?? 1,
    limit: params.limit ?? 10,
    ...(params.search ? { search: params.search } : {}),
  };
  const { data } = await api.get<CompanyListResponse>("/companies", {
    params: axiosParams,
  });
  return data;
}

export async function createCompany(
  body: CreateCompanyRequest,
): Promise<{ id: string }> {
  const { data } = await api.post<{ id: string }>("/companies", body);
  return data;
}

export async function updateCompany(
  id: string,
  body: UpdateCompanyRequest,
): Promise<CompanyResponse> {
  const { data } = await api.put<CompanyResponse>(`/companies/${id}`, body);
  return data;
}

export async function deleteCompany(id: string): Promise<void> {
  await api.delete(`/companies/${id}`);
}
