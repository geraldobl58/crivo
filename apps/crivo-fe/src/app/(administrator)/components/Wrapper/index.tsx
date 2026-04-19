"use client";

import { useState } from "react";

import Box from "@mui/material/Box";
import CssBaseline from "@mui/material/CssBaseline";

import { Sidebar } from "../Sidebar";
import { TopBar } from "../TopBar";
import { SubscriptionGuard } from "../SubscriptionGuard";

export const Wrapper = ({ children }: { children: React.ReactNode }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}>
      <CssBaseline />
      <TopBar
        sidebarOpen={sidebarOpen}
        onMenuClick={() => setSidebarOpen(true)}
      />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Box component="main" sx={{ flexGrow: 1 }}>
        <SubscriptionGuard>{children}</SubscriptionGuard>
      </Box>
    </Box>
  );
};
