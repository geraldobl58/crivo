"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

/**
 * Auto-triggers the Keycloak OIDC flow.
 * Middleware redirects unauthenticated users here; this page
 * immediately initiates the OAuth redirect so the UX is seamless.
 */
export default function SignInPage() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/secure/dashboard";
  const triggered = useRef(false);

  useEffect(() => {
    if (triggered.current) return;
    triggered.current = true;

    authClient.signIn.oauth2({
      providerId: "keycloak",
      callbackURL: callbackUrl,
      errorCallbackURL: "/auth/error",
    });
  }, [callbackUrl]);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 2,
      }}
    >
      <CircularProgress />
      <Typography variant="body2" color="text.secondary">
        Redirecionando para autenticação…
      </Typography>
    </Box>
  );
}
