export interface PlanInfo {
  id: string;
  type: string;
  name: string;
  description: string | null;
  priceMonthly: number;
  stripePriceId: string | null;
  trialDays: number;
  maxUsers: number;
  maxCompany: number;
  maxTransactions: number;
  maxContacts: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlanListResponse {
  items: PlanInfo[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PlansPageData {
  plans: PlanInfo[];
  currentPlanType: string | null;
  subscriptionStatus: string | null;
}
