import z from "zod";

export const ROLE_OPTIONS = ["OWNER", "ADMIN", "USER", "SUPPORT"] as const;
export type UserRole = (typeof ROLE_OPTIONS)[number];

export const UserResponseSchema = z.object({
  id: z.string(),
  keycloakId: z.string(),
  email: z.string(),
  firstname: z.string().nullable().optional().default(null),
  lastname: z.string().nullable().optional().default(null),
  role: z.enum(ROLE_OPTIONS),
  companyId: z.string().nullable().optional().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type UserResponse = z.infer<typeof UserResponseSchema>;

export const UserListResponseSchema = z.object({
  items: z.array(UserResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type UserListResponse = z.infer<typeof UserListResponseSchema>;

export const CreateUserRequestSchema = z.object({
  email: z.string().email("Email inválido"),
  firstname: z.string().min(1, "Nome é obrigatório"),
  lastname: z.string().optional(),
  role: z.enum(ROLE_OPTIONS, {
    required_error: "Papel é obrigatório",
  }),
});

export type CreateUserRequest = z.infer<typeof CreateUserRequestSchema>;

export const UpdateUserRequestSchema = z.object({
  email: z.string().email("Email inválido").optional(),
  firstname: z.string().min(1, "Nome é obrigatório").optional(),
  lastname: z.string().optional(),
  role: z.enum(ROLE_OPTIONS).optional(),
});

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestSchema>;

export const UserQueryParamsSchema = z.object({
  firstname: z.string().optional(),
  email: z.string().optional(),
  role: z.enum(ROLE_OPTIONS).optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type UserQueryParams = z.infer<typeof UserQueryParamsSchema>;
