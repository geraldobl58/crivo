"use client";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Divider from "@mui/material/Divider";

import {
  Crown,
  Check,
  Users,
  Building2,
  FileText,
  Contact,
  CreditCard,
  Sparkles,
} from "lucide-react";

import { Container } from "@/app/(administrator)/components/Container";
import { TitleBar } from "@/app/(administrator)/components/TitleBar";
import {
  usePlansPage,
  useCheckout,
  usePortalSession,
} from "@/features/plans/hooks";
import type { PlanInfo } from "@/features/plans/types";

// --- Helpers ---

const PLAN_ORDER: Record<string, number> = {
  TRIAL: 0,
  BASIC: 1,
  PROFESSIONAL: 2,
  ENTERPRISE: 3,
};

function formatCurrency(cents: number): string {
  if (cents <= 0) return "Grátis";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

function limitLabel(value: number): string {
  return value === -1 ? "Ilimitado" : String(value);
}

function planRank(planType: string): number {
  return PLAN_ORDER[planType] ?? -1;
}

// --- Plan Card ---

function PlanCard({
  plan,
  isCurrent,
  isUpgrade,
  isDowngrade,
  onUpgrade,
  upgradeLoading,
}: {
  plan: PlanInfo;
  isCurrent: boolean;
  isUpgrade: boolean;
  isDowngrade: boolean;
  onUpgrade: (planType: string) => void;
  upgradeLoading: boolean;
}) {
  const isHighlighted = plan.type === "PROFESSIONAL";
  const isEnterprise = plan.type === "ENTERPRISE";

  const features = [
    {
      icon: <Users size={16} className="text-blue-500" />,
      label: `${limitLabel(plan.maxUsers)} usuário${plan.maxUsers !== 1 ? "s" : ""}`,
    },
    {
      icon: <Building2 size={16} className="text-green-500" />,
      label: `${limitLabel(plan.maxCompany)} empresa${plan.maxCompany !== 1 ? "s" : ""}`,
    },
    {
      icon: <FileText size={16} className="text-orange-500" />,
      label: `${limitLabel(plan.maxTransactions)} transações/mês`,
    },
    {
      icon: <Contact size={16} className="text-purple-500" />,
      label: `${limitLabel(plan.maxContacts)} contatos`,
    },
  ];

  return (
    <Paper
      elevation={isHighlighted ? 6 : 2}
      sx={{
        p: 3,
        display: "flex",
        flexDirection: "column",
        position: "relative",
        border: isHighlighted ? 2 : isCurrent ? 2 : 0,
        borderColor: isHighlighted
          ? "primary.main"
          : isCurrent
            ? "success.main"
            : undefined,
      }}
    >
      {/* Top badge */}
      {isHighlighted && !isCurrent && (
        <Chip
          icon={<Sparkles size={14} />}
          label="Mais Popular"
          color="primary"
          size="small"
          sx={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            fontWeight: 700,
          }}
        />
      )}
      {isCurrent && (
        <Chip
          icon={<Check size={14} />}
          label="Plano Atual"
          color="success"
          size="small"
          sx={{
            position: "absolute",
            top: -12,
            left: "50%",
            transform: "translateX(-50%)",
            fontWeight: 700,
          }}
        />
      )}

      {/* Header */}
      <Box display="flex" alignItems="center" gap={1} mb={1} mt={1}>
        <Crown size={20} className="text-indigo-500" />
        <Typography variant="h6" fontWeight={700}>
          {plan.name}
        </Typography>
      </Box>

      {plan.description && (
        <Typography variant="body2" color="text.secondary" mb={2}>
          {plan.description}
        </Typography>
      )}

      {/* Price */}
      <Typography variant="h4" fontWeight={800} color="primary.main" mb={0.5}>
        {formatCurrency(plan.priceMonthly)}
        {plan.priceMonthly > 0 && (
          <Typography component="span" variant="body2" color="text.secondary">
            /mês
          </Typography>
        )}
      </Typography>

      {plan.trialDays > 0 && (
        <Typography variant="caption" color="text.secondary" mb={1}>
          {plan.trialDays} dia{plan.trialDays > 1 ? "s" : ""} de teste grátis
        </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Features */}
      <Box display="flex" flexDirection="column" gap={1.5} mb={3} flexGrow={1}>
        {features.map((f) => (
          <Box key={f.label} display="flex" alignItems="center" gap={1}>
            {f.icon}
            <Typography variant="body2">{f.label}</Typography>
          </Box>
        ))}
      </Box>

      {/* CTA */}
      {isCurrent ? (
        <Button variant="outlined" color="success" disabled fullWidth>
          Plano Atual
        </Button>
      ) : isEnterprise ? (
        <Button
          variant="contained"
          fullWidth
          href="mailto:contato@crivo.com.br"
        >
          Falar com Vendas
        </Button>
      ) : isUpgrade ? (
        <Button
          variant="contained"
          fullWidth
          onClick={() => onUpgrade(plan.type)}
          disabled={upgradeLoading}
          startIcon={
            upgradeLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <Sparkles size={16} />
            )
          }
        >
          {upgradeLoading ? "Redirecionando..." : "Fazer Upgrade"}
        </Button>
      ) : isDowngrade ? (
        <Button variant="outlined" fullWidth disabled>
          Downgrade (via portal)
        </Button>
      ) : (
        <Button
          variant="outlined"
          fullWidth
          onClick={() => onUpgrade(plan.type)}
          disabled={upgradeLoading}
          startIcon={
            upgradeLoading ? (
              <CircularProgress size={16} color="inherit" />
            ) : null
          }
        >
          {upgradeLoading ? "Redirecionando..." : "Selecionar"}
        </Button>
      )}
    </Paper>
  );
}

// --- Page ---

const PlansPage = () => {
  const { data, isLoading, error } = usePlansPage();
  const { startCheckout, loadingPlan, error: checkoutError } = useCheckout();
  const { openPortal, isLoading: portalLoading } = usePortalSession();

  const currentRank = data?.currentPlanType
    ? planRank(data.currentPlanType)
    : -1;

  const sortedPlans = [...(data?.plans ?? [])].sort(
    (a, b) => planRank(a.type) - planRank(b.type),
  );

  return (
    <Container>
      <TitleBar
        title="Planos"
        description="Compare os planos disponíveis e faça upgrade para desbloquear mais recursos."
        content={
          data?.currentPlanType &&
          data.currentPlanType !== "TRIAL" && (
            <Button
              variant="outlined"
              size="small"
              startIcon={
                portalLoading ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <CreditCard size={16} />
                )
              }
              onClick={openPortal}
              disabled={portalLoading}
            >
              {portalLoading ? "Abrindo..." : "Gerenciar Assinatura"}
            </Button>
          )
        }
      />

      {(error || checkoutError) && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || checkoutError}
        </Alert>
      )}

      {isLoading ? (
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          }}
          gap={3}
          mt={3}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={400} />
          ))}
        </Box>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "1fr 1fr",
            md: `repeat(${sortedPlans.length}, 1fr)`,
          }}
          gap={3}
          mt={3}
          alignItems="start"
        >
          {sortedPlans.map((plan) => {
            const rank = planRank(plan.type);
            const isCurrent = plan.type === data?.currentPlanType;
            const isUpgrade = currentRank >= 0 && rank > currentRank;
            const isDowngrade = currentRank >= 0 && rank < currentRank;

            return (
              <PlanCard
                key={plan.id}
                plan={plan}
                isCurrent={isCurrent}
                isUpgrade={isUpgrade}
                isDowngrade={isDowngrade}
                onUpgrade={startCheckout}
                upgradeLoading={loadingPlan === plan.type}
              />
            );
          })}
        </Box>
      )}
    </Container>
  );
};

export default PlansPage;
