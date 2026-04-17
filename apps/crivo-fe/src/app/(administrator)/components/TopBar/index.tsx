"use client";

import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "../../routes";
import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { MenuIcon } from "lucide-react";

const DRAWER_WIDTH = 240;

type TopBarProps = {
  sidebarOpen: boolean;
  onMenuClick: () => void;
};

export const TopBar = ({ sidebarOpen, onMenuClick }: TopBarProps) => {
  const pathname = usePathname();
  const current = NAV_ITEMS.find((item) => pathname.startsWith(item.href));
  const pageTitle = current?.label ?? "Crivo";

  return (
    <AppBar
      position="fixed"
      elevation={0}
      sx={{
        zIndex: (theme) => theme.zIndex.drawer + 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        color: "text.primary",
        transition: (theme) =>
          theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        ...(sidebarOpen && {
          ml: `${DRAWER_WIDTH}px`,
          width: `calc(100% - ${DRAWER_WIDTH}px)`,
          transition: (theme) =>
            theme.transitions.create(["width", "margin"], {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
        }),
      }}
    >
      <Toolbar>
        <IconButton
          aria-label="Abrir menu"
          onClick={onMenuClick}
          edge="start"
          sx={{ mr: 2, ...(sidebarOpen && { display: "none" }) }}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="subtitle1" fontWeight={600} sx={{ flexGrow: 1 }}>
          {pageTitle}
        </Typography>
      </Toolbar>
    </AppBar>
  );
};
