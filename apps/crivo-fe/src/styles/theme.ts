import { createTheme, alpha } from "@mui/material/styles";
import { Montserrat } from "next/font/google";

const montserrat = Montserrat({ subsets: ["latin"] });

declare module "@mui/material/styles" {
  interface PaletteColor {
    lightest?: string;
    lighter?: string;
    darker?: string;
    darkest?: string;
  }
  interface SimplePaletteColorOptions {
    lightest?: string;
    lighter?: string;
    darker?: string;
    darkest?: string;
  }
  interface Palette {
    neutral: Palette["primary"];
  }
  interface PaletteOptions {
    neutral?: PaletteOptions["primary"];
  }
}

declare module "@mui/material/Button" {
  interface ButtonPropsColorOverrides {
    neutral: true;
  }
}

const theme = createTheme({
  // ─── Palette ────────────────────────────────────────────────────────────────
  palette: {
    mode: "light",
    primary: {
      lightest: "#EEF4FF",
      lighter: "#C7D7FD",
      light: "#6172F3",
      main: "#444CE7",
      dark: "#3538CD",
      darker: "#2D31A6",
      darkest: "#1F235B",
      contrastText: "#FFFFFF",
    },
    secondary: {
      lightest: "#F9F5FF",
      lighter: "#E9D7FE",
      light: "#B692F6",
      main: "#7F56D9",
      dark: "#6941C6",
      darker: "#53389E",
      darkest: "#2C1C5F",
      contrastText: "#FFFFFF",
    },
    error: {
      lightest: "#FFF1F3",
      lighter: "#FFE4E8",
      light: "#FDA29B",
      main: "#F04438",
      dark: "#D92D20",
      darker: "#B42318",
      darkest: "#55160C",
      contrastText: "#FFFFFF",
    },
    warning: {
      lightest: "#FFFAEB",
      lighter: "#FEF0C7",
      light: "#FEC84B",
      main: "#F79009",
      dark: "#DC6803",
      darker: "#B54708",
      darkest: "#4E1D09",
      contrastText: "#FFFFFF",
    },
    success: {
      lightest: "#F0FDF9",
      lighter: "#CCFBEF",
      light: "#34D399",
      main: "#12B76A",
      dark: "#039855",
      darker: "#027A48",
      darkest: "#054F31",
      contrastText: "#FFFFFF",
    },
    neutral: {
      lightest: "#F8FAFC",
      lighter: "#EEF2FF",
      light: "#94A3B8",
      main: "#64748B",
      dark: "#475569",
      darker: "#334155",
      darkest: "#0F172A",
      contrastText: "#FFFFFF",
    },
    grey: {
      50: "#F9FAFB",
      100: "#F3F4F6",
      200: "#E5E7EB",
      300: "#D1D5DB",
      400: "#9CA3AF",
      500: "#6B7280",
      600: "#4B5563",
      700: "#374151",
      800: "#1F2937",
      900: "#111827",
    },
    text: {
      primary: "#101828",
      secondary: "#475467",
      disabled: "#98A2B3",
    },
    background: {
      default: "#F9FAFB",
      paper: "#FFFFFF",
    },
    divider: "#E4E7EC",
  },

  // ─── Typography ─────────────────────────────────────────────────────────────
  typography: {
    fontFamily: montserrat.style.fontFamily,
    fontWeightLight: 300,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,
    h1: {
      fontSize: "3rem", // 48px
      fontWeight: 700,
      lineHeight: 1.2,
      letterSpacing: "-0.02em",
    },
    h2: {
      fontSize: "2.25rem", // 36px
      fontWeight: 700,
      lineHeight: 1.25,
      letterSpacing: "-0.015em",
    },
    h3: {
      fontSize: "1.875rem", // 30px
      fontWeight: 600,
      lineHeight: 1.3,
      letterSpacing: "-0.01em",
    },
    h4: {
      fontSize: "1.5rem", // 24px
      fontWeight: 600,
      lineHeight: 1.35,
    },
    h5: {
      fontSize: "1.25rem", // 20px
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h6: {
      fontSize: "1.125rem", // 18px
      fontWeight: 600,
      lineHeight: 1.5,
    },
    subtitle1: {
      fontSize: "1rem", // 16px
      fontWeight: 500,
      lineHeight: 1.5,
    },
    subtitle2: {
      fontSize: "0.875rem", // 14px
      fontWeight: 500,
      lineHeight: 1.57,
    },
    body1: {
      fontSize: "1rem", // 16px
      fontWeight: 400,
      lineHeight: 1.5,
    },
    body2: {
      fontSize: "0.875rem", // 14px
      fontWeight: 400,
      lineHeight: 1.57,
    },
    caption: {
      fontSize: "0.75rem", // 12px
      fontWeight: 400,
      lineHeight: 1.66,
    },
    overline: {
      fontSize: "0.75rem", // 12px
      fontWeight: 600,
      lineHeight: 2.66,
      letterSpacing: "0.08em",
      textTransform: "uppercase",
    },
    button: {
      fontSize: "0.875rem", // 14px
      fontWeight: 600,
      lineHeight: 1.75,
      letterSpacing: "0.02em",
      textTransform: "none",
    },
  },

  // ─── Shape ──────────────────────────────────────────────────────────────────
  shape: {
    borderRadius: 8,
  },

  // ─── Shadows ────────────────────────────────────────────────────────────────
  shadows: [
    "none",
    "0px 1px 2px rgba(16, 24, 40, 0.05)",
    "0px 1px 3px rgba(16, 24, 40, 0.1), 0px 1px 2px rgba(16, 24, 40, 0.06)",
    "0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)",
    "0px 6px 12px -2px rgba(16, 24, 40, 0.1), 0px 4px 6px -2px rgba(16, 24, 40, 0.05)",
    "0px 8px 16px -4px rgba(16, 24, 40, 0.1), 0px 4px 6px -2px rgba(16, 24, 40, 0.05)",
    "0px 12px 20px -4px rgba(16, 24, 40, 0.1), 0px 4px 6px -2px rgba(16, 24, 40, 0.05)",
    "0px 16px 24px -4px rgba(16, 24, 40, 0.1), 0px 4px 6px -2px rgba(16, 24, 40, 0.05)",
    "0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)",
    "0px 24px 48px -12px rgba(16, 24, 40, 0.18)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
    "0px 32px 64px -12px rgba(16, 24, 40, 0.2)",
  ],

  // ─── Component Overrides ────────────────────────────────────────────────────
  components: {
    // Button
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: "10px 18px",
          fontSize: "0.875rem",
          fontWeight: 600,
        },
        sizeSmall: {
          padding: "8px 14px",
          fontSize: "0.8125rem",
        },
        sizeLarge: {
          padding: "12px 22px",
          fontSize: "1rem",
        },
        outlined: ({ theme }) => ({
          borderColor: theme.palette.divider,
          "&:hover": {
            backgroundColor: theme.palette.grey[50],
            borderColor: theme.palette.grey[300],
          },
        }),
      },
    },

    // IconButton
    MuiIconButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          "&:hover": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
          },
        }),
      },
    },

    // Card
    MuiCard: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: 12,
          backgroundImage: "none",
        }),
      },
    },

    // CardContent
    MuiCardContent: {
      styleOverrides: {
        root: {
          padding: "24px",
          "&:last-child": {
            paddingBottom: "24px",
          },
        },
      },
    },

    // Paper
    MuiPaper: {
      defaultProps: {
        elevation: 0,
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundImage: "none",
          border: `1px solid ${theme.palette.divider}`,
        }),
        elevation0: {
          boxShadow: "none",
        },
      },
    },

    // OutlinedInput
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          "& .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.divider,
          },
          "&:hover .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.grey[400],
          },
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: theme.palette.primary.main,
            borderWidth: 2,
          },
        }),
      },
    },

    // InputLabel
    MuiInputLabel: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: "0.875rem",
          fontWeight: 500,
          color: theme.palette.text.secondary,
        }),
      },
    },

    // Chip
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          fontWeight: 500,
          fontSize: "0.75rem",
        },
        colorPrimary: ({ theme }) => ({
          backgroundColor: theme.palette.primary.lightest,
          color: theme.palette.primary.dark,
          "& .MuiChip-deleteIcon": {
            color: theme.palette.primary.light,
          },
        }),
        colorSuccess: ({ theme }) => ({
          backgroundColor: theme.palette.success.lightest,
          color: theme.palette.success.dark,
        }),
        colorError: ({ theme }) => ({
          backgroundColor: theme.palette.error.lightest,
          color: theme.palette.error.dark,
        }),
        colorWarning: ({ theme }) => ({
          backgroundColor: theme.palette.warning.lightest,
          color: theme.palette.warning.dark,
        }),
      },
    },

    // Avatar
    MuiAvatar: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: "0.875rem",
          fontWeight: 600,
          backgroundColor: theme.palette.primary.lighter,
          color: theme.palette.primary.dark,
        }),
      },
    },

    // Tooltip
    MuiTooltip: {
      defaultProps: {
        arrow: true,
      },
      styleOverrides: {
        tooltip: ({ theme }) => ({
          backgroundColor: theme.palette.grey[900],
          fontSize: "0.75rem",
          fontWeight: 400,
          padding: "8px 12px",
          borderRadius: 6,
        }),
        arrow: ({ theme }) => ({
          color: theme.palette.grey[900],
        }),
      },
    },

    // Divider
    MuiDivider: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },

    // AppBar
    MuiAppBar: {
      defaultProps: {
        elevation: 0,
        color: "inherit",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper,
        }),
      },
    },

    // Drawer
    MuiDrawer: {
      styleOverrides: {
        paper: ({ theme }) => ({
          border: "none",
          boxShadow: theme.shadows[8],
        }),
      },
    },

    // List
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          "&.Mui-selected": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            "& .MuiListItemIcon-root": {
              color: theme.palette.primary.main,
            },
            "&:hover": {
              backgroundColor: alpha(theme.palette.primary.main, 0.12),
            },
          },
          "&:hover": {
            backgroundColor: theme.palette.grey[50],
          },
        }),
      },
    },

    // Table
    MuiTableHead: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.grey[50],
          "& .MuiTableCell-root": {
            color: theme.palette.text.secondary,
            fontWeight: 600,
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            borderBottom: `1px solid ${theme.palette.divider}`,
          },
        }),
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
          padding: "12px 16px",
          fontSize: "0.875rem",
        }),
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: ({ theme }) => ({
          "&:hover": {
            backgroundColor: theme.palette.grey[50],
          },
          "&:last-child .MuiTableCell-root": {
            borderBottom: "none",
          },
        }),
      },
    },

    // Dialog
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 12,
          border: "none",
          boxShadow:
            "0px 20px 24px -4px rgba(16, 24, 40, 0.08), 0px 8px 8px -4px rgba(16, 24, 40, 0.03)",
        },
      },
    },
    MuiDialogTitle: {
      styleOverrides: {
        root: {
          padding: "24px 24px 16px",
          fontSize: "1.125rem",
          fontWeight: 600,
        },
      },
    },
    MuiDialogContent: {
      styleOverrides: {
        root: {
          padding: "0 24px 20px",
        },
      },
    },
    MuiDialogActions: {
      styleOverrides: {
        root: ({ theme }) => ({
          padding: "16px 24px 24px",
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: 12,
        }),
      },
    },

    // Tabs
    MuiTabs: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderBottom: `1px solid ${theme.palette.divider}`,
        }),
        indicator: ({ theme }) => ({
          height: 2,
          borderRadius: "2px 2px 0 0",
          backgroundColor: theme.palette.primary.main,
        }),
      },
    },
    MuiTab: {
      styleOverrides: {
        root: ({ theme }) => ({
          textTransform: "none",
          fontWeight: 500,
          fontSize: "0.875rem",
          color: theme.palette.text.secondary,
          "&.Mui-selected": {
            color: theme.palette.primary.main,
            fontWeight: 600,
          },
        }),
      },
    },

    // Badge
    MuiBadge: {
      styleOverrides: {
        badge: {
          fontSize: "0.6875rem",
          fontWeight: 600,
          height: 18,
          minWidth: 18,
          padding: "0 4px",
        },
      },
    },

    // Alert
    MuiAlert: {
      defaultProps: {
        variant: "standard",
      },
      styleOverrides: {
        root: {
          borderRadius: 8,
          fontSize: "0.875rem",
          alignItems: "flex-start",
        },
        standardSuccess: ({ theme }) => ({
          backgroundColor: theme.palette.success.lightest,
          color: theme.palette.success.darker,
          "& .MuiAlert-icon": { color: theme.palette.success.main },
        }),
        standardError: ({ theme }) => ({
          backgroundColor: theme.palette.error.lightest,
          color: theme.palette.error.darker,
          "& .MuiAlert-icon": { color: theme.palette.error.main },
        }),
        standardWarning: ({ theme }) => ({
          backgroundColor: theme.palette.warning.lightest,
          color: theme.palette.warning.darker,
          "& .MuiAlert-icon": { color: theme.palette.warning.main },
        }),
        standardInfo: ({ theme }) => ({
          backgroundColor: theme.palette.primary.lightest,
          color: theme.palette.primary.darker,
          "& .MuiAlert-icon": { color: theme.palette.primary.main },
        }),
      },
    },

    // Breadcrumbs
    MuiBreadcrumbs: {
      styleOverrides: {
        root: ({ theme }) => ({
          fontSize: "0.875rem",
          color: theme.palette.text.secondary,
          "& .MuiBreadcrumbs-separator": {
            color: theme.palette.grey[300],
          },
        }),
      },
    },

    // LinearProgress
    MuiLinearProgress: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 4,
          backgroundColor: theme.palette.primary.lighter,
          height: 8,
        }),
        bar: {
          borderRadius: 4,
        },
      },
    },

    // Skeleton
    MuiSkeleton: {
      defaultProps: {
        animation: "wave",
      },
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.grey[100],
          "&::after": {
            background: `linear-gradient(90deg, transparent, ${alpha(theme.palette.grey[200], 0.8)}, transparent)`,
          },
        }),
      },
    },

    // Switch
    MuiSwitch: {
      styleOverrides: {
        root: {
          padding: 8,
        },
        thumb: {
          boxShadow: "none",
        },
        track: ({ theme }) => ({
          borderRadius: 12,
          backgroundColor: theme.palette.grey[300],
          opacity: 1,
          ".Mui-checked.Mui-checked + &": {
            opacity: 1,
            backgroundColor: theme.palette.primary.main,
          },
        }),
      },
    },

    // Select
    MuiSelect: {
      styleOverrides: {
        icon: ({ theme }) => ({
          color: theme.palette.text.secondary,
        }),
      },
    },

    // Menu
    MuiMenu: {
      styleOverrides: {
        paper: ({ theme }) => ({
          boxShadow:
            "0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)",
          borderRadius: 8,
          border: `1px solid ${theme.palette.divider}`,
        }),
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 6,
          margin: "2px 6px",
          padding: "8px 10px",
          fontSize: "0.875rem",
          "&.Mui-selected": {
            backgroundColor: alpha(theme.palette.primary.main, 0.08),
            color: theme.palette.primary.main,
            fontWeight: 500,
          },
          "&:hover": {
            backgroundColor: theme.palette.grey[50],
          },
        }),
      },
    },

    // Autocomplete
    MuiAutocomplete: {
      styleOverrides: {
        paper: ({ theme }) => ({
          boxShadow:
            "0px 4px 8px -2px rgba(16, 24, 40, 0.1), 0px 2px 4px -2px rgba(16, 24, 40, 0.06)",
          borderRadius: 8,
          border: `1px solid ${theme.palette.divider}`,
        }),
        option: ({ theme }) => ({
          borderRadius: 6,
          margin: "2px 6px",
          padding: "8px 10px",
          fontSize: "0.875rem",
          "&.Mui-focused": {
            backgroundColor: theme.palette.grey[50],
          },
          '&[aria-selected="true"]': {
            backgroundColor: `${alpha(theme.palette.primary.main, 0.08)} !important`,
            color: theme.palette.primary.main,
            fontWeight: 500,
          },
        }),
      },
    },

    // Pagination
    MuiPaginationItem: {
      styleOverrides: {
        root: ({ theme }) => ({
          borderRadius: 8,
          fontWeight: 500,
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
            },
          },
        }),
      },
    },

    // Snackbar
    MuiSnackbar: {
      defaultProps: {
        anchorOrigin: { vertical: "bottom", horizontal: "right" },
      },
    },
  },
});

export default theme;
