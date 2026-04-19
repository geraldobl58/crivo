import z from "zod";

export const CompanyResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  taxId: z.string().nullable().optional().default(""),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type CompanyResponse = z.infer<typeof CompanyResponseSchema>;

export const CompanyListResponseSchema = z.object({
  items: z.array(CompanyResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
});

export type CompanyListResponse = z.infer<typeof CompanyListResponseSchema>;

/**
 * CreateCompanyRequest — apenas nome e CNPJ.
 * Plano, status e trial_ends_at são derivados automaticamente no backend
 * a partir do plano do usuário autenticado.
 */
export const CreateCompanyRequestSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  taxId: z
    .string()
    .min(11, "CNPJ/CPF inválido")
    .max(18, "CNPJ/CPF inválido")
    .regex(/^\d+$/, "Somente números"),
});

export type CreateCompanyRequest = z.infer<typeof CreateCompanyRequestSchema>;

/** UpdateCompanyRequest — mesmos campos que o create (nome + CNPJ). */
export const UpdateCompanyRequestSchema = CreateCompanyRequestSchema;
export type UpdateCompanyRequest = z.infer<typeof UpdateCompanyRequestSchema>;

export const CompanyQueryParamsSchema = z.object({
  search: z.string().optional(),
  page: z.number().optional(),
  limit: z.number().optional(),
});

export type CompanyQueryParams = z.infer<typeof CompanyQueryParamsSchema>;
