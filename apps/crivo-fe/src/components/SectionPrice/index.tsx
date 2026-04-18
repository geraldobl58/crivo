"use client";

import { useEffect, useState } from "react";

import Link from "next/link";

import { Card } from "../Card";
import { FeatureList } from "../FeatureList";

import { formatPrice } from "@/utils/formatted-price";

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

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/plans`)
      .then((res) => res.json())
      .then((json) => setPlans(json.items ?? []))
      .catch(() => {});
  }, []);

  return (
    <section className="w-full max-w-7xl mx-auto flex flex-col md:flex-row items-stretch justify-between gap-8 px-4 pb-20 pt-8">
      {plans.map((plan) => {
        const isHighlighted = plan.type === "PROFESSIONAL";
        const isEnterprise = plan.type === "ENTERPRISE";
        const displayName = plan.name;
        const price = formatPrice(plan.priceMonthly);
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

        const ctaLabel = isEnterprise
          ? "Falar com Vendas"
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
              <Link
                href="/secure/dashboard"
                className={`block w-full py-3 rounded-lg text-sm font-semibold text-center cursor-pointer transition-colors ${
                  isHighlighted
                    ? "bg-indigo-500 hover:bg-indigo-400 text-white"
                    : "border border-gray-700 hover:bg-gray-800 text-white"
                }`}
              >
                {ctaLabel}
              </Link>
            }
          />
        );
      })}
    </section>
  );
};
