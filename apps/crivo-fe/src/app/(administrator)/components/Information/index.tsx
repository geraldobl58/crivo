"use client";

import { Box, IconButton } from "@mui/material";
import { LogOut } from "lucide-react";
import { useSession } from "next-auth/react";

export const Information = () => {
  const { data: session } = useSession();

  return (
    <Box>
      <Box className="flex items-center justify-between p-4">
        <p className="text-sm">
          Olá, <strong>{session?.user?.name}</strong>
        </p>
        <IconButton
          onClick={() => {
            window.location.href = "/api/auth/force-logout";
          }}
        >
          <LogOut size={22} />
        </IconButton>
      </Box>
    </Box>
  );
};
