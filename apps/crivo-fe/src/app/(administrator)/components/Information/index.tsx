"use client";

import { Box, IconButton } from "@mui/material";
import { LogOut } from "lucide-react";

export const Information = () => {
  return (
    <Box>
      <Box className="flex items-center justify-between p-4">
        <p className="text-sm">
          <strong>Crivo</strong>
        </p>
        <IconButton
          onClick={() => {
            window.location.href = "/";
          }}
        >
          <LogOut size={22} />
        </IconButton>
      </Box>
    </Box>
  );
};
