import { GridColDef } from "@mui/x-data-grid";
import { IconButton, Chip } from "@mui/material";
import { Edit, Trash } from "lucide-react";

import type { UserResponse } from "@/features/users/types";

interface ColumnActions {
  onEdit: (row: UserResponse) => void;
  onDelete: (row: UserResponse) => void;
  currentUserKeycloakId?: string;
}

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  USER: "Usuário",
  SUPPORT: "Suporte",
};

const ROLE_COLORS: Record<
  string,
  "primary" | "secondary" | "default" | "warning"
> = {
  OWNER: "primary",
  ADMIN: "warning",
  USER: "default",
  SUPPORT: "secondary",
};

export function buildColumns(
  actions: ColumnActions,
): GridColDef<UserResponse>[] {
  return [
    {
      field: "firstname",
      headerName: "Nome",
      flex: 1,
      valueGetter: (_value, row) =>
        [row.firstname, row.lastname].filter(Boolean).join(" ") || "—",
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1.2,
    },
    {
      field: "role",
      headerName: "Papel",
      width: 140,
      renderCell: (params) => (
        <Chip
          label={ROLE_LABELS[params.value] ?? params.value}
          color={ROLE_COLORS[params.value] ?? "default"}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: "createdAt",
      headerName: "Criado em",
      width: 130,
      valueFormatter: (value: string) =>
        new Date(value).toLocaleDateString("pt-BR"),
    },
    {
      field: "actions",
      headerName: "Ações",
      width: 100,
      sortable: false,
      renderCell: (params) => {
        const isOwner = params.row.role === "OWNER";
        const isSelf =
          actions.currentUserKeycloakId &&
          params.row.keycloakId === actions.currentUserKeycloakId;
        const canDelete = !isOwner && !isSelf;

        return (
          <>
            <IconButton size="small" onClick={() => actions.onEdit(params.row)}>
              <Edit size={16} className="text-warning" />
            </IconButton>
            {canDelete && (
              <IconButton
                size="small"
                onClick={() => actions.onDelete(params.row)}
              >
                <Trash size={16} className="text-error" />
              </IconButton>
            )}
          </>
        );
      },
    },
  ];
}
