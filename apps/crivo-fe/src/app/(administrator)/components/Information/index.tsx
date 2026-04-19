"use client";

import { Avatar, Box, IconButton, Tooltip, Typography } from "@mui/material";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearPlanSelection } from "@/utils/plan-cookie";

export const Information = () => {
  const { data: session } = authClient.useSession();
  const userName = session?.user?.name || session?.user?.email || "";
  const initials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleLogout = () => {
    clearPlanSelection();

    const keycloakIssuer = process.env.NEXT_PUBLIC_KEYCLOAK_ISSUER;
    const postLogoutRedirectUri = encodeURIComponent(window.location.origin);
    const keycloakLogoutUrl = `${keycloakIssuer}/protocol/openid-connect/logout?post_logout_redirect_uri=${postLogoutRedirectUri}&client_id=crivo-web`;

    authClient.signOut().then(() => {
      window.location.href = keycloakLogoutUrl;
    });
  };

  return (
    <Box>
      <Box className="flex items-center justify-between p-4 gap-2">
        <Box className="flex items-center gap-2 min-w-0">
          <Avatar
            sx={{
              width: 32,
              height: 32,
              fontSize: 13,
              bgcolor: "primary.main",
              flexShrink: 0,
            }}
          >
            {initials}
          </Avatar>
          <Typography
            variant="body2"
            noWrap
            sx={{ fontWeight: 500, minWidth: 0 }}
          >
            {userName}
          </Typography>
        </Box>
        <Tooltip title="Sair" arrow>
          <IconButton onClick={handleLogout} size="small">
            <LogOut size={20} />
          </IconButton>
        </Tooltip>
      </Box>
    </Box>
  );
};
