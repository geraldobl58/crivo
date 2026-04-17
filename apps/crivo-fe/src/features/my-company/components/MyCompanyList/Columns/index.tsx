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
      field: "tax_id",
      headerName: "Documento",
      flex: 1,
      renderCell: (params) => {
        const value = params.value as string;
        const formattedValue = value.replace(
          /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
          "$1.$2.$3/$4-$5",
        );
        return <span>{formattedValue}</span>;
      },
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
          <IconButton size="small" onClick={() => actions.onView(params.row)}>
            <Eye size={16} className="text-primary" />
          </IconButton>
        </>
      ),
    },
  ];
}

/** @deprecated use buildColumns(actions) */
export const columns = buildColumns({
  onEdit: () => {},
  onDelete: () => {},
  onView: () => {},
});
