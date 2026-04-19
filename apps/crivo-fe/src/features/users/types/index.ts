import { UserListResponse, UserResponse } from "../schemas";

export type { UserResponse, UserListResponse };

export interface UserInfoResponse {
  success: boolean;
  message?: string;
  data?: UserListResponse;
}

export interface UserActionResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
}
