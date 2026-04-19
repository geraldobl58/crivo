"use client";

import { useEffect, useState } from "react";

import { authClient } from "@/lib/auth-client";

import { Card } from "../Card";
import { FeatureList } from "../FeatureList";

import { formatPrice } from "@/utils/formatted-price";
import { savePlanSelection } from "@/utils/plan-cookie";

type Plan = {
  id: string;
  type: string;
  name: string;
  description: string;
  priceMonthly: number;
  trialDays: number;
  maxUsers: number;
  maxCompany: number;
  maxTransactions: number;
  maxContacts: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  features?: string[];
};

export const SectionPrice = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [signingIn, setSigningIn] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/plans`)
      .then((res) => res.json())
      .then((json) => setPlans(json.items ?? []))
      .catch(() => {});
  }, []);

  const handleSelectPlan = async (plan: Plan) => {
    if (plan.type === "ENTERPRISE") return;
    setSigningIn(plan.type);
    savePlanSelection(plan.type, plan.id);
    try {
      await authClient.signIn.oauth2({
        providerId: "keycloak",
        callbackURL: "/secure/onboarding",
        errorCallbackURL: "/auth/error",
      });
    } catch {
      setSigningIn(null);
    }
  };

  return (
    <section className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-stretch justify-between gap-8 px-4 pb-20 pt-8">
      {plans.map((plan) => {
        const isHighlighted = plan.type === "PROFESSIONAL";
        const isEnterprise = plan.type === "ENTERPRISE";
        const isTrial = plan.type === "TRIAL";
        const displayName = plan.name;
        const price = isTrial ? "Grátis" : formatPrice(plan.priceMonthly);
        const priceSuffix = plan.priceMonthly > 0 ? "/mês" : undefined;

        const transactionFeature =
          plan.maxTransactions === -1
            ? "Transações ilimitadas/mês"
            : `Até ${plan.maxTransactions} transação/mês`;

        const featureItems = plan.features?.length
          ? plan.features
          : plan.description
            ? [plan.description]
            : [];
        const allFeatures = [transactionFeature, ...featureItems].filter(
          Boolean,
        );

        const isThisLoading = signingIn === plan.type;
        const isAnyLoading = signingIn !== null;

        const ctaLabel = isThisLoading
          ? "Redirecionando..."
          : isEnterprise
            ? "Falar com Vendas"
            : isTrial
              ? "Começar Grátis"
              : isHighlighted
                ? `Assinar o ${displayName}`
                : `Começar com o ${displayName}`;

        return (
          <Card
            key={plan.id || plan.name}
            variant={isHighlighted ? "highlighted" : "default"}
            topBadge={isHighlighted ? "Mais Popular" : undefined}
            title={displayName}
            price={price}
            priceSuffix={priceSuffix}
            content={<FeatureList items={allFeatures} />}
            footer={
              <button
                onClick={() => handleSelectPlan(plan)}
                disabled={isAnyLoading}
                className={`block w-full py-3 rounded-lg text-sm font-semibold text-center transition-colors ${
                  isAnyLoading && !isThisLoading
                    ? "opacity-50 cursor-not-allowed"
                    : isThisLoading
                      ? "cursor-wait"
                      : "cursor-pointer"
                } ${
                  isHighlighted
                    ? "bg-indigo-500 hover:bg-indigo-400 text-white disabled:hover:bg-indigo-500"
                    : "border border-gray-700 hover:bg-gray-800 text-white disabled:hover:bg-transparent"
                }`}
              >
                {isThisLoading && (
                  <svg
                    className="inline-block w-4 h-4 mr-2 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                )}
                {ctaLabel}
              </button>
            }
          />
        );
      })}
    </section>
  );
};
