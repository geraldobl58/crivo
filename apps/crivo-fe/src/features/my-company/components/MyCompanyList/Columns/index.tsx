import { GridColDef } from "@mui/x-data-grid";

import { CompanyResponse } from "@/features/my-company/types";
import { IconButton } from "@mui/material";
import { Edit, Eye, Trash } from "lucide-react";

interface ColumnActions {
  onEdit: (row: CompanyResponse) => void;
  onDelete: (row: CompanyResponse) => void;
  onView: (row: CompanyResponse) => void;
}

export function buildColumns(
  actions: ColumnActions,
): GridColDef<CompanyResponse>[] {
  return [
    {
      field: "name",
      headerName: "Nome",
      flex: 1,
    },
    {
      field: "actions",
      headerName: "Ações",
      flex: 1,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton size="small" onClick={() => actions.onEdit(params.row)}>
            <Edit size={16} className="text-warning" />
          </IconButton>
          <IconButton size="small" onClick={() => actions.onDelete(params.row)}>
            <Trash size={16} className="text-error" />
          </IconButton>
        </>
      ),
    },
  ];
}
