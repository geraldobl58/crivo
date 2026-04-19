export interface SubscriptionPlanInfo {
  type: string;
  name: string;
  priceMonthly: number;
  maxUsers: number;
  maxCompany: number;
  maxTransactions: number;
  maxContacts: number;
}

export interface SubscriptionInfo {
  id: string;
  companyId: string;
  planId: string;
  stripeSubscriptionId: string | null;
  status: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialStart: string | null;
  trialEnd: string | null;
  cancelAtPeriodEnd: boolean;
  canceledAt: string | null;
  plan: SubscriptionPlanInfo | null;
  createdAt: string;
  updatedAt: string;
}

export interface CompanyInfo {
  id: string;
  name: string;
  taxId: string | null;
  stripeCustomerId: string | null;
  subscription: {
    planName: string;
    planType: string;
    status: string;
    currentPeriodEnd: string | null;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardData {
  subscription: SubscriptionInfo | null;
  company: CompanyInfo | null;
  usage: UsageCounts;
}

export interface UsageCounts {
  users: number;
  companies: number;
}
