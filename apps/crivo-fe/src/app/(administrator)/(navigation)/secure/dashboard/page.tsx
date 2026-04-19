"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Alert from "@mui/material/Alert";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Skeleton from "@mui/material/Skeleton";
import LinearProgress from "@mui/material/LinearProgress";
import Divider from "@mui/material/Divider";

import {
  Building2,
  CreditCard,
  Users,
  FileText,
  Contact,
  ArrowRight,
  Crown,
  CalendarDays,
  LayoutDashboard,
  Loader2,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { Container } from "@/app/(administrator)/components/Container";
import { TitleBar } from "@/app/(administrator)/components/TitleBar";
import {
  useDashboard,
  usePortalSession,
  useCheckoutPolling,
} from "@/features/dashboard/hooks";
import type { CheckoutPollingState } from "@/features/dashboard/hooks";
import type { SubscriptionPlanInfo } from "@/features/dashboard/types";

// --- Helpers ---

const STATUS_MAP: Record<
  string,
  { label: string; color: "success" | "warning" | "error" | "info" | "default" }
> = {
  ACTIVE: { label: "Ativa", color: "success" },
  TRIALING: { label: "Trial", color: "info" },
  PAST_DUE: { label: "Pagamento pendente", color: "warning" },
  CANCELED: { label: "Cancelada", color: "error" },
  EXPIRED: { label: "Expirada", color: "error" },
  INCOMPLETE: { label: "Incompleta", color: "warning" },
  PENDING_PAYMENT: { label: "Aguardando pagamento", color: "warning" },
};

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(new Date(dateStr));
}

function limitLabel(value: number): string {
  return value === -1 ? "Ilimitado" : String(value);
}

// --- Checkout Feedback ---

function CheckoutFeedback({
  pollingState,
  onDismiss,
}: {
  pollingState: CheckoutPollingState;
  onDismiss: () => void;
}) {
  if (pollingState === "idle") return null;

  if (pollingState === "confirmed") {
    return (
      <Alert
        severity="success"
        variant="filled"
        icon={<CheckCircle2 size={20} />}
        onClose={onDismiss}
        sx={{ mt: 2 }}
      >
        Pagamento confirmado! Sua assinatura está ativa.
      </Alert>
    );
  }

  if (pollingState === "timeout") {
    return (
      <Alert
        severity="info"
        variant="filled"
        icon={<Clock size={20} />}
        onClose={onDismiss}
        sx={{ mt: 2 }}
      >
        Estamos processando seu pagamento. Isso pode levar alguns minutos.
        Atualize a página em breve.
      </Alert>
    );
  }

  // polling
  return (
    <Paper
      elevation={3}
      sx={{
        mt: 2,
        p: 3,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 2,
        bgcolor: "primary.50",
        border: 1,
        borderColor: "primary.200",
      }}
    >
      <Loader2 size={32} className="text-indigo-500 animate-spin" />
      <Typography variant="subtitle1" fontWeight={700} textAlign="center">
        Confirmando seu pagamento...
      </Typography>
      <Typography variant="body2" color="text.secondary" textAlign="center">
        Estamos aguardando a confirmação do Stripe. Isso geralmente leva poucos
        segundos.
      </Typography>
      <LinearProgress sx={{ width: "100%", borderRadius: 1 }} />
    </Paper>
  );
}

// --- Widgets ---

function SubscriptionCard({
  planName,
  planType,
  status,
  priceMonthly,
  currentPeriodEnd,
  cancelAtPeriodEnd,
  onManage,
  managingPortal,
}: {
  planName: string;
  planType: string;
  status: string;
  priceMonthly: number;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  onManage: () => void;
  managingPortal: boolean;
}) {
  const statusInfo = STATUS_MAP[status] ?? {
    label: status,
    color: "default" as const,
  };

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <Crown size={22} className="text-indigo-500" />
        <Typography variant="h6" fontWeight={700}>
          Assinatura
        </Typography>
      </Box>

      <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
        <Typography variant="h5" fontWeight={800}>
          {planName}
        </Typography>
        <Chip
          label={planType}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ fontWeight: 600 }}
        />
        <Chip
          label={statusInfo.label}
          size="small"
          color={statusInfo.color}
          sx={{ fontWeight: 600 }}
        />
      </Box>

      <Typography variant="h4" fontWeight={800} color="primary.main" mb={1}>
        {priceMonthly === 0 ? "Grátis" : formatCurrency(priceMonthly)}
        {priceMonthly > 0 && (
          <Typography component="span" variant="body2" color="text.secondary">
            /mês
          </Typography>
        )}
      </Typography>

      {currentPeriodEnd && (
        <Box display="flex" alignItems="center" gap={1} mb={1}>
          <CalendarDays size={16} className="text-gray-500" />
          <Typography variant="body2" color="text.secondary">
            {cancelAtPeriodEnd
              ? `Cancela em ${formatDate(currentPeriodEnd)}`
              : `Renova em ${formatDate(currentPeriodEnd)}`}
          </Typography>
        </Box>
      )}

      <Divider sx={{ my: 2 }} />

      {planType === "TRIAL" ? (
        <Button
          variant="contained"
          startIcon={<Crown size={16} />}
          href="/secure/plans"
        >
          Fazer Upgrade
        </Button>
      ) : (
        <Button
          variant="outlined"
          startIcon={
            managingPortal ? (
              <CircularProgress size={16} color="inherit" />
            ) : (
              <CreditCard size={16} />
            )
          }
          onClick={onManage}
          disabled={managingPortal}
        >
          {managingPortal ? "Abrindo..." : "Gerenciar Assinatura"}
        </Button>
      )}
    </Paper>
  );
}

function CompanyCard({
  name,
  taxId,
  createdAt,
  trialEnd,
  status,
}: {
  name: string;
  taxId: string | null;
  createdAt: string;
  trialEnd: string | null;
  status: string;
}) {
  const [timeLeft, setTimeLeft] = useState("");

  useEffect(() => {
    if (!trialEnd || status !== "TRIALING") return;

    const update = () => {
      const now = Date.now();
      const end = new Date(trialEnd).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft("Expirado");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [trialEnd, status]);

  return (
    <Paper elevation={2} sx={{ p: 3 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={2}>
        <Building2 size={22} className="text-indigo-500" />
        <Typography variant="h6" fontWeight={700}>
          Empresa
        </Typography>
      </Box>

      <Typography variant="h5" fontWeight={700} mb={0.5}>
        {name}
      </Typography>

      {taxId && (
        <Typography variant="body2" color="text.secondary" mb={0.5}>
          CNPJ:{" "}
          {taxId.replace(
            /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
            "$1.$2.$3/$4-$5",
          )}
        </Typography>
      )}

      <Typography variant="body2" color="text.secondary">
        Criada em {formatDate(createdAt)}
      </Typography>

      {status === "TRIALING" && trialEnd && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box display="flex" alignItems="center" gap={1} mb={0.5}>
            <Clock size={16} className="text-orange-500" />
            <Typography
              variant="subtitle2"
              fontWeight={600}
              color="warning.main"
            >
              Trial expira em: {timeLeft}
            </Typography>
          </Box>
          <Typography variant="caption" color="text.secondary">
            Após o período de teste, será necessário escolher um plano pago para
            continuar usando o Crivo.
          </Typography>
        </>
      )}
    </Paper>
  );
}

function LimitWidget({
  icon,
  label,
  max,
  current,
}: {
  icon: React.ReactNode;
  label: string;
  max: number;
  current?: number;
}) {
  const isUnlimited = max === -1;
  const used = current ?? 0;
  const percentage = isUnlimited
    ? 0
    : max > 0
      ? Math.min((used / max) * 100, 100)
      : 0;

  return (
    <Paper elevation={1} sx={{ p: 2.5 }}>
      <Box display="flex" alignItems="center" gap={1.5} mb={1.5}>
        {icon}
        <Typography variant="subtitle2" fontWeight={600}>
          {label}
        </Typography>
      </Box>

      <Typography variant="h5" fontWeight={800} mb={0.5}>
        {isUnlimited ? "∞" : `${used} / ${max}`}
      </Typography>

      <Typography variant="caption" color="text.secondary">
        {isUnlimited
          ? "Ilimitado no seu plano"
          : `${used} de ${limitLabel(max)} utilizados`}
      </Typography>

      {!isUnlimited && (
        <LinearProgress
          variant="determinate"
          value={percentage}
          sx={{ mt: 1, borderRadius: 1 }}
        />
      )}
    </Paper>
  );
}

function PlanLimitsGrid({
  plan,
  usage,
}: {
  plan: SubscriptionPlanInfo;
  usage: { users: number; companies: number };
}) {
  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Limites do Plano
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr 1fr",
        }}
        gap={2}
      >
        <LimitWidget
          icon={<Users size={20} className="text-blue-500" />}
          label="Usuários"
          max={plan.maxUsers}
          current={usage.users}
        />
        <LimitWidget
          icon={<Building2 size={20} className="text-green-500" />}
          label="Empresas"
          max={plan.maxCompany}
          current={usage.companies}
        />
        <LimitWidget
          icon={<FileText size={20} className="text-orange-500" />}
          label="Transações"
          max={plan.maxTransactions}
        />
        <LimitWidget
          icon={<Contact size={20} className="text-purple-500" />}
          label="Contatos"
          max={plan.maxContacts}
        />
      </Box>
    </Box>
  );
}

function ShortcutsGrid() {
  const router = useRouter();

  const shortcuts = [
    {
      label: "Empresas",
      description: "Gerencie suas empresas",
      icon: <Building2 size={24} className="text-indigo-500" />,
      href: "/secure/my-company",
    },
    {
      label: "Usuários",
      description: "Convide e gerencie membros",
      icon: <Users size={24} className="text-blue-500" />,
      href: "/secure/users",
    },
    {
      label: "Documentos",
      description: "Acesse seus documentos",
      icon: <FileText size={24} className="text-green-500" />,
      href: "/secure/documents",
    },
    {
      label: "Contatos",
      description: "Gerencie seus contatos",
      icon: <Contact size={24} className="text-purple-500" />,
      href: "/secure/contacts",
    },
  ];

  return (
    <Box>
      <Typography variant="h6" fontWeight={700} mb={2}>
        Acesso Rápido
      </Typography>
      <Box
        display="grid"
        gridTemplateColumns={{
          xs: "1fr",
          sm: "1fr 1fr",
          md: "1fr 1fr 1fr 1fr",
        }}
        gap={2}
      >
        {shortcuts.map((s) => (
          <Paper
            key={s.href}
            elevation={1}
            sx={{
              p: 2.5,
              cursor: "pointer",
              transition: "box-shadow 0.2s",
              "&:hover": { boxShadow: 4 },
            }}
            onClick={() => router.push(s.href)}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              mb={1}
            >
              {s.icon}
              <ArrowRight size={16} className="text-gray-400" />
            </Box>
            <Typography variant="subtitle2" fontWeight={700}>
              {s.label}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {s.description}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
}

// --- Page ---

export default function DashboardPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isPostCheckout, setIsPostCheckout] = useState(false);

  const { data, isLoading, error, refetch } = useDashboard();
  const { openPortal, isLoading: managingPortal } = usePortalSession();

  // Detect checkout redirect
  useEffect(() => {
    if (searchParams.get("checkout") === "success") {
      setIsPostCheckout(true);
      router.replace("/secure/dashboard");
    }
  }, [searchParams, router]);

  const pollingState = useCheckoutPolling(isPostCheckout);

  // Refetch dashboard data when subscription is confirmed
  useEffect(() => {
    if (pollingState === "confirmed") {
      refetch();
    }
  }, [pollingState, refetch]);

  const subscription = data?.subscription;
  const company = data?.company;
  const plan = subscription?.plan;

  return (
    <Container>
      <TitleBar
        title="Dashboard"
        description={
          company
            ? `Bem-vindo ao painel da ${company.name}`
            : "Visão geral da sua conta"
        }
        content={
          company && (
            <Chip
              icon={<LayoutDashboard size={14} />}
              label={plan?.name ?? "—"}
              color="primary"
              variant="outlined"
              sx={{ fontWeight: 600 }}
            />
          )
        }
      />

      {/* Checkout feedback */}
      {isPostCheckout && (
        <CheckoutFeedback
          pollingState={pollingState}
          onDismiss={() => setIsPostCheckout(false)}
        />
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Expired trial banner */}
      {subscription?.status === "TRIALING" &&
        subscription?.trialEnd &&
        new Date(subscription.trialEnd) < new Date() && (
          <Alert
            severity="warning"
            sx={{ mt: 2 }}
            action={
              <Button
                color="warning"
                size="small"
                variant="contained"
                onClick={() => router.push("/#precos")}
              >
                Fazer Upgrade
              </Button>
            }
          >
            Seu período de teste expirou. Faça upgrade para continuar utilizando
            a plataforma.
          </Alert>
        )}

      {isLoading ? (
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
            gap={3}
          >
            <Skeleton variant="rounded" height={220} />
            <Skeleton variant="rounded" height={220} />
          </Box>
          <Box display="grid" gridTemplateColumns="repeat(4, 1fr)" gap={2}>
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} variant="rounded" height={120} />
            ))}
          </Box>
        </Box>
      ) : (
        <Box sx={{ mt: 3, display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Subscription + Company row */}
          <Box
            display="grid"
            gridTemplateColumns={{ xs: "1fr", md: "2fr 1fr" }}
            gap={3}
          >
            {subscription && plan ? (
              <SubscriptionCard
                planName={plan.name}
                planType={plan.type}
                status={subscription.status}
                priceMonthly={plan.priceMonthly}
                currentPeriodEnd={subscription.currentPeriodEnd}
                cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
                onManage={openPortal}
                managingPortal={managingPortal}
              />
            ) : (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Crown size={22} className="text-gray-400" />
                  <Typography variant="h6" fontWeight={700}>
                    Assinatura
                  </Typography>
                </Box>
                <Typography color="text.secondary" mb={2}>
                  Nenhuma assinatura ativa encontrada.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => router.push("/#precos")}
                >
                  Ver Planos
                </Button>
              </Paper>
            )}

            {company ? (
              <CompanyCard
                name={company.name}
                taxId={company.taxId}
                createdAt={company.createdAt}
                trialEnd={subscription?.trialEnd ?? null}
                status={subscription?.status ?? ""}
              />
            ) : (
              <Paper elevation={2} sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" gap={1.5} mb={2}>
                  <Building2 size={22} className="text-gray-400" />
                  <Typography variant="h6" fontWeight={700}>
                    Empresa
                  </Typography>
                </Box>
                <Typography color="text.secondary">
                  Configure sua empresa no onboarding.
                </Typography>
              </Paper>
            )}
          </Box>

          {/* Plan limits */}
          {plan && (
            <PlanLimitsGrid
              plan={plan}
              usage={data?.usage ?? { users: 0, companies: 0 }}
            />
          )}

          {/* Shortcuts */}
          <ShortcutsGrid />
        </Box>
      )}
    </Container>
  );
}
