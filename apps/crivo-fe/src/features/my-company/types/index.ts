import { CompanyListResponse, CompanyResponse } from "../schemas/";

export type {
  CompanyResponse,
  CompanyListResponse,
  // CompanyActionResponse,
  // CompanyInfoResponse,
  // CompanyQueryParams,
};

export interface ClientsInfoResponse {
  success: boolean;
  message?: string;
  data?: CompanyListResponse;
}

export interface CompanyInfoResponse {
  success: boolean;
  message?: string;
  data?: CompanyListResponse;
}

export interface CompanyActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
