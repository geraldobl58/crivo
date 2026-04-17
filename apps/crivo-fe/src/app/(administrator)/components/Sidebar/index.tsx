"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { NAV_ITEMS } from "../../routes";
import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
} from "@mui/material";

import { ChevronLeftIcon, Zap } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Information } from "../Information";

const DRAWER_WIDTH = 240;

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export const Sidebar = ({ open, onClose }: SidebarProps) => {
  const pathname = usePathname();

  return (
    <Drawer
      variant="permanent"
      open={open}
      sx={{
        width: open ? DRAWER_WIDTH : 64,
        flexShrink: 0,
        whiteSpace: "nowrap",
        "& .MuiDrawer-paper": {
          width: open ? DRAWER_WIDTH : 64,
          overflowX: "hidden",
          transition: (theme: import("@mui/material").Theme) =>
            theme.transitions.create("width", {
              easing: theme.transitions.easing.sharp,
              duration: open
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
            }),
          boxSizing: "border-box",
          borderRight: "1px solid",
          borderColor: "divider",
        },
      }}
    >
      <Box className="flex flex-col justify-between h-full">
        <Box>
          <Toolbar
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: open ? "space-between" : "center",
              px: 2,
            }}
          >
            {open && (
              <Logo
                title="Crivo"
                color="text-indigo-500"
                icon={<Zap className="text-indigo-500" size={32} />}
              />
            )}
            <IconButton onClick={onClose} aria-label="Fechar menu">
              <ChevronLeftIcon />
            </IconButton>
          </Toolbar>

          <Divider />

          <List disablePadding sx={{ mt: 1 }}>
            {NAV_ITEMS.map(({ href, label, icon }) => {
              const isActive = pathname === href;
              return (
                <ListItem key={href} disablePadding sx={{ display: "block" }}>
                  <ListItemButton
                    component={Link}
                    href={href}
                    selected={isActive}
                    sx={{
                      minHeight: 48,
                      px: 2.5,
                      justifyContent: open ? "initial" : "center",
                      borderRadius: 1,
                      mx: 0.5,
                      mb: 0.5,
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 0,
                        mr: open ? 2 : "auto",
                        justifyContent: "center",
                        color: isActive ? "primary.main" : "text.secondary",
                      }}
                    >
                      {icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={label}
                      sx={{ opacity: open ? 1 : 0 }}
                      primaryTypographyProps={{
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 400,
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>

        <Box className="flex flex-col justify-between">
          <Information />
        </Box>
      </Box>
    </Drawer>
  );
};
