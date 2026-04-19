"use server";

import { serverFetch } from "@/config/server-api";
import {
  UserQueryParams,
  UserListResponse,
  UserResponse,
  CreateUserRequest,
  UpdateUserRequest,
} from "../schemas";
import { UserActionResponse, UserInfoResponse } from "../types";

export async function getUsersAction(
  params?: UserQueryParams,
): Promise<UserInfoResponse> {
  try {
    const response = await serverFetch<UserListResponse>("/users", {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 10,
        ...(params?.firstname ? { firstname: params.firstname } : {}),
        ...(params?.email ? { email: params.email } : {}),
        ...(params?.role ? { role: params.role } : {}),
      },
    });
    return {
      success: true,
      message: "Usuários recuperados com sucesso.",
      data: response,
    };
  } catch (error) {
    console.error("Erro ao recuperar usuários:", error);
    return {
      success: false,
      message: "Erro ao recuperar usuários. Por favor, tente novamente.",
    };
  }
}

export async function createUserAction(
  body: CreateUserRequest,
): Promise<UserActionResponse<UserResponse>> {
  try {
    const data = await serverFetch<UserResponse>("/users", {
      method: "POST",
      body,
    });
    return { success: true, data, message: "Usuário criado com sucesso." };
  } catch (error) {
    console.error("Erro ao criar usuário:", error);
    const message =
      (error as { response?: { data?: { message?: string } } })?.response?.data
        ?.message ?? "Erro ao criar usuário. Tente novamente.";
    return { success: false, message };
  }
}

export async function updateUserAction(
  id: string,
  body: UpdateUserRequest,
): Promise<UserActionResponse<UserResponse>> {
  try {
    const data = await serverFetch<UserResponse>(`/users/${id}`, {
      method: "PATCH",
      body,
    });
    return {
      success: true,
      data,
      message: "Usuário atualizado com sucesso.",
    };
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return {
      success: false,
      message: "Erro ao atualizar usuário. Tente novamente.",
    };
  }
}

export async function deleteUserAction(
  id: string,
): Promise<UserActionResponse<void>> {
  try {
    await serverFetch<void>(`/users/${id}`, { method: "DELETE" });
    return { success: true, message: "Usuário removido com sucesso." };
  } catch (error) {
    console.error("Erro ao remover usuário:", error);
    return {
      success: false,
      message: "Erro ao remover usuário. Tente novamente.",
    };
  }
}
