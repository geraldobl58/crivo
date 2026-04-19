"use client";

import { usePathname, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";

import { Crown, ShieldAlert } from "lucide-react";

import { getDashboardDataAction } from "@/features/dashboard/actions";

const ALLOWED_PATHS = ["/secure/dashboard", "/secure/plans"];

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const { data, isLoading } = useQuery({
    queryKey: ["subscription-guard"],
    queryFn: async () => {
      const result = await getDashboardDataAction();
      return result.success ? result.data : null;
    },
    staleTime: 30 * 1000,
  });

  // Allow access while loading
  if (isLoading) return <>{children}</>;

  // Allow if no subscription data (fallback to server-side guard)
  if (!data?.subscription) return <>{children}</>;

  const { status, trialEnd } = data.subscription;

  // Check if trial is expired
  const isTrialExpired =
    status === "TRIALING" && trialEnd && new Date(trialEnd) < new Date();

  // Check if subscription is in a blocked state
  const isBlocked =
    isTrialExpired || status === "EXPIRED" || status === "CANCELED";

  // Allow access to dashboard and plans even when blocked
  if (!isBlocked || ALLOWED_PATHS.some((p) => pathname.startsWith(p))) {
    return <>{children}</>;
  }

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      minHeight="calc(100vh - 64px)"
      p={3}
    >
      <Paper
        elevation={3}
        sx={{
          p: 5,
          maxWidth: 520,
          textAlign: "center",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 2,
        }}
      >
        <ShieldAlert size={48} className="text-orange-500" />

        <Typography variant="h5" fontWeight={700}>
          Acesso Bloqueado
        </Typography>

        <Alert severity="warning" sx={{ width: "100%" }}>
          {isTrialExpired
            ? "Seu período de teste expirou."
            : status === "CANCELED"
              ? "Sua assinatura foi cancelada."
              : "Sua assinatura expirou."}
        </Alert>

        <Typography variant="body1" color="text.secondary">
          Para continuar utilizando a plataforma, renove sua assinatura ou faça
          upgrade para um plano pago.
        </Typography>

        <Box display="flex" gap={2} mt={1}>
          <Button
            variant="outlined"
            onClick={() => router.push("/secure/dashboard")}
          >
            Ir ao Dashboard
          </Button>
          <Button
            variant="contained"
            startIcon={<Crown size={16} />}
            onClick={() => router.push("/secure/plans")}
          >
            Ver Planos
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
