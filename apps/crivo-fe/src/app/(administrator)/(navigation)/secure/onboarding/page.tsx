"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Skeleton from "@mui/material/Skeleton";
import Divider from "@mui/material/Divider";
import Fade from "@mui/material/Fade";

import {
  Building2,
  CreditCard,
  Crown,
  Users,
  FileText,
  Contact,
  Check,
  Sparkles,
  ArrowLeft,
} from "lucide-react";

import { Container } from "@/app/(administrator)/components/Container";
import { TitleBar } from "@/app/(administrator)/components/TitleBar";
import { useSetupCompany } from "@/features/onboarding/hooks";
import { getCompanyAction } from "@/features/my-company/actions";
import { getActivePlansAction } from "@/features/plans/actions";
import type { PlanInfo } from "@/features/plans/types";
import {
  savePlanSelection,
  getPlanSelection,
  clearPlanSelection,
} from "@/utils/plan-cookie";

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

// --- Inline Plan Selector ---

function PlanSelector({
  plans,
  loading,
  error,
  onSelect,
}: {
  plans: PlanInfo[];
  loading: boolean;
  error: string | null;
  onSelect: (plan: PlanInfo) => void;
}) {
  const sorted = [...plans].sort(
    (a, b) => (PLAN_ORDER[a.type] ?? 99) - (PLAN_ORDER[b.type] ?? 99),
  );

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={0.5}>
        Escolha seu plano
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Selecione o plano ideal para começar a usar o Crivo.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "1fr 1fr",
            md: "repeat(4, 1fr)",
          }}
          gap={2}
        >
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} variant="rounded" height={280} />
          ))}
        </Box>
      ) : (
        <Box
          display="grid"
          gridTemplateColumns={{
            xs: "1fr",
            sm: "1fr 1fr",
            md: `repeat(${sorted.length}, 1fr)`,
          }}
          gap={2}
        >
          {sorted.map((plan) => {
            const isHighlighted = plan.type === "PROFESSIONAL";
            const isEnterprise = plan.type === "ENTERPRISE";

            return (
              <Paper
                key={plan.id}
                elevation={isHighlighted ? 4 : 1}
                sx={{
                  p: 2.5,
                  display: "flex",
                  flexDirection: "column",
                  cursor: isEnterprise ? "default" : "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                  border: isHighlighted ? 2 : 1,
                  borderColor: isHighlighted ? "primary.main" : "divider",
                  "&:hover": isEnterprise
                    ? {}
                    : { boxShadow: 6, borderColor: "primary.main" },
                }}
                onClick={() => !isEnterprise && onSelect(plan)}
              >
                {isHighlighted && (
                  <Chip
                    icon={<Sparkles size={12} />}
                    label="Mais Popular"
                    color="primary"
                    size="small"
                    sx={{
                      position: "absolute",
                      top: -10,
                      left: "50%",
                      transform: "translateX(-50%)",
                      fontWeight: 700,
                      fontSize: "0.7rem",
                    }}
                  />
                )}

                <Box display="flex" alignItems="center" gap={1} mb={1} mt={0.5}>
                  <Crown size={18} className="text-indigo-500" />
                  <Typography variant="subtitle1" fontWeight={700}>
                    {plan.name}
                  </Typography>
                </Box>

                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="primary.main"
                  mb={0.5}
                >
                  {formatCurrency(plan.priceMonthly)}
                  {plan.priceMonthly > 0 && (
                    <Typography
                      component="span"
                      variant="caption"
                      color="text.secondary"
                    >
                      /mês
                    </Typography>
                  )}
                </Typography>

                {plan.trialDays > 0 && (
                  <Typography variant="caption" color="text.secondary">
                    {plan.trialDays} dia{plan.trialDays > 1 ? "s" : ""} grátis
                  </Typography>
                )}

                <Divider sx={{ my: 1.5 }} />

                <Box
                  display="flex"
                  flexDirection="column"
                  gap={0.8}
                  mb={2}
                  flexGrow={1}
                >
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <Users size={14} className="text-blue-500" />
                    <Typography variant="caption">
                      {limitLabel(plan.maxUsers)} usuário
                      {plan.maxUsers !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <Building2 size={14} className="text-green-500" />
                    <Typography variant="caption">
                      {limitLabel(plan.maxCompany)} empresa
                      {plan.maxCompany !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <FileText size={14} className="text-orange-500" />
                    <Typography variant="caption">
                      {limitLabel(plan.maxTransactions)} transações
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <Contact size={14} className="text-purple-500" />
                    <Typography variant="caption">
                      {limitLabel(plan.maxContacts)} contatos
                    </Typography>
                  </Box>
                </Box>

                {isEnterprise ? (
                  <Button
                    variant="outlined"
                    size="small"
                    fullWidth
                    href="mailto:contato@crivo.com.br"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Falar com Vendas
                  </Button>
                ) : (
                  <Button
                    variant={isHighlighted ? "contained" : "outlined"}
                    size="small"
                    fullWidth
                    startIcon={<Check size={14} />}
                  >
                    Selecionar
                  </Button>
                )}
              </Paper>
            );
          })}
        </Box>
      )}
    </Box>
  );
}

// --- Page ---

export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useSession();
  const { isLoading, error, setupCompany } = useSetupCompany();
  const [, startTransition] = useTransition();

  const [selectedPlan, setSelectedPlan] = useState<PlanInfo | null>(null);
  const [planType, setPlanType] = useState<string | null>(null);
  const [companyName, setCompanyName] = useState("");
  const [checking, setChecking] = useState(true);

  // Plans for inline selector
  const [plans, setPlans] = useState<PlanInfo[]>([]);
  const [plansLoading, setPlansLoading] = useState(false);
  const [plansError, setPlansError] = useState<string | null>(null);

  // Check if user already has a company → redirect to dashboard
  useEffect(() => {
    async function checkExistingCompany() {
      try {
        const result = await getCompanyAction({ page: 1, limit: 1 });
        if (result.success && result.data && result.data.total > 0) {
          router.replace("/secure/dashboard");
          return;
        }
      } catch {
        // If check fails, continue to onboarding
      }
      startTransition(() => setChecking(false));
    }

    if (status === "authenticated") {
      checkExistingCompany();
    } else if (status === "unauthenticated") {
      startTransition(() => setChecking(false));
    }
  }, [status, router]);

  // Try to load plan from cookie/sessionStorage, otherwise fetch plans for inline selection
  const loadPlans = useCallback(async () => {
    setPlansLoading(true);
    setPlansError(null);
    const result = await getActivePlansAction();
    if (result.success && result.data) {
      setPlans(result.data);
    } else {
      setPlansError(result.message ?? "Erro ao carregar planos.");
    }
    setPlansLoading(false);
  }, []);

  useEffect(() => {
    if (!checking) {
      const { planType: storedPlan } = getPlanSelection();
      if (storedPlan) {
        startTransition(() => setPlanType(storedPlan));
        // Still load plans so we can display the selected plan's details
        loadPlans();
      } else {
        loadPlans();
      }
    }
  }, [checking, loadPlans]);

  const handlePlanSelect = (plan: PlanInfo) => {
    setSelectedPlan(plan);
    setPlanType(plan.type);
    savePlanSelection(plan.type, plan.id);
  };

  const handleBackToPlans = () => {
    setSelectedPlan(null);
    setPlanType(null);
    clearPlanSelection();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!planType || !companyName.trim()) return;

    const result = await setupCompany({
      planType,
      companyName: companyName.trim(),
    });

    if (result?.checkoutUrl) {
      window.location.href = result.checkoutUrl;
    } else if (result) {
      window.location.href = "/secure/dashboard";
    }
  };

  if (status === "loading" || checking) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={400}
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Step 1: Plan selection (inline)
  if (!planType) {
    return (
      <Container>
        <TitleBar
          title="Onboarding"
          description="Configure sua empresa para começar a usar o Crivo."
        />
        <Fade in timeout={400}>
          <Box mt={3}>
            <PlanSelector
              plans={plans}
              loading={plansLoading}
              error={plansError}
              onSelect={handlePlanSelect}
            />
          </Box>
        </Fade>
      </Container>
    );
  }

  // Step 2: Company form
  const displayPlan = selectedPlan ?? plans.find((p) => p.type === planType);

  return (
    <Container>
      <TitleBar
        title="Configurar Empresa"
        description="Último passo antes de acessar a plataforma."
      />

      <Fade in timeout={400}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "2fr 1fr" },
            gap: 3,
            mt: 3,
          }}
        >
          {/* Formulário */}
          <Paper elevation={2} sx={{ p: 4 }}>
            <Box display="flex" alignItems="center" gap={1.5} mb={3}>
              <Building2 size={24} />
              <Typography variant="h6" fontWeight={700}>
                Dados da Empresa
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                label="Nome da Empresa"
                placeholder="Ex: Minha Empresa LTDA"
                fullWidth
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                disabled={isLoading}
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                fullWidth
                disabled={isLoading || !companyName.trim()}
                startIcon={
                  isLoading ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : planType === "TRIAL" ? (
                    <Check size={20} />
                  ) : (
                    <CreditCard size={20} />
                  )
                }
              >
                {isLoading
                  ? "Configurando..."
                  : planType === "TRIAL"
                    ? "Começar Trial Grátis"
                    : "Continuar para Pagamento"}
              </Button>
            </form>
          </Paper>

          {/* Resumo do plano */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} gutterBottom>
              Plano Selecionado
            </Typography>

            {displayPlan ? (
              <Box>
                <Box display="flex" alignItems="center" gap={1} mb={1}>
                  <Crown size={18} className="text-indigo-500" />
                  <Typography variant="h6" fontWeight={700}>
                    {displayPlan.name}
                  </Typography>
                </Box>
                <Typography
                  variant="h5"
                  fontWeight={800}
                  color="primary.main"
                  mb={1}
                >
                  {formatCurrency(displayPlan.priceMonthly)}
                  {displayPlan.priceMonthly > 0 && (
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      /mês
                    </Typography>
                  )}
                </Typography>
                {displayPlan.description && (
                  <Typography variant="body2" color="text.secondary" mb={1}>
                    {displayPlan.description}
                  </Typography>
                )}
                <Divider sx={{ my: 1.5 }} />
                <Box display="flex" flexDirection="column" gap={0.8} mb={2}>
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <Users size={14} className="text-blue-500" />
                    <Typography variant="caption">
                      {limitLabel(displayPlan.maxUsers)} usuário
                      {displayPlan.maxUsers !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <Building2 size={14} className="text-green-500" />
                    <Typography variant="caption">
                      {limitLabel(displayPlan.maxCompany)} empresa
                      {displayPlan.maxCompany !== 1 ? "s" : ""}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <FileText size={14} className="text-orange-500" />
                    <Typography variant="caption">
                      {limitLabel(displayPlan.maxTransactions)} transações
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={0.8}>
                    <Contact size={14} className="text-purple-500" />
                    <Typography variant="caption">
                      {limitLabel(displayPlan.maxContacts)} contatos
                    </Typography>
                  </Box>
                </Box>
              </Box>
            ) : (
              <Chip
                label={planType}
                color="primary"
                variant="outlined"
                sx={{ mb: 2, fontWeight: 600 }}
              />
            )}

            <Button
              variant="text"
              size="small"
              startIcon={<ArrowLeft size={14} />}
              onClick={handleBackToPlans}
              disabled={isLoading}
              sx={{ mb: 1 }}
            >
              Trocar plano
            </Button>

            <Alert severity="info" variant="outlined">
              <Typography variant="caption">
                {displayPlan && displayPlan.priceMonthly === 0
                  ? "Sua empresa será criada e você terá acesso imediato à plataforma durante o período de teste."
                  : "Após preencher os dados, você será redirecionado para o Stripe para completar o pagamento."}
              </Typography>
            </Alert>
          </Paper>
        </Box>
      </Fade>
    </Container>
  );
}
