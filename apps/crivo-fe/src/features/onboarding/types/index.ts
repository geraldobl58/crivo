/** Resposta do POST /auth/sync */
export type SyncResponse = {
  user: {
    id: string;
    keycloak_id: string;
    email: string;
    role: string;
  };
  /** null quando o usuário ainda não criou sua empresa (novo fluxo pós-sync) */
  company: {
    id: string;
    name: string;
    plan_id: string;
    plan_name: string;
    status: string;
    trial_ends_at: string;
  } | null;
  is_new: boolean;
  message: string;
};

/** Resposta do POST /onboarding/mock-payment */
export type MockPaymentResponse = {
  company_id: string;
  status: string;
  payment_status: string;
  message: string;
};
