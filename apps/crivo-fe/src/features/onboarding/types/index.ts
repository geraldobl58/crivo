/** Input para POST /onboarding/setup-company */
export type SetupCompanyInput = {
  planType: string;
  companyName: string;
};

/** Resposta do POST /onboarding/setup-company */
export type SetupCompanyResponse = {
  company: {
    id: string;
    name: string;
    stripeCustomerId?: string;
  };
  subscription: {
    id: string;
    status: string;
    planType?: string;
  };
  checkoutUrl: string | null;
};
