import React from "react";

import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  type GridColDef,
  type GridDensity,
  type GridPaginationModel,
  type GridRowIdGetter,
  type GridRowParams,
  type GridSortModel,
  type GridValidRowModel,
  GridPagination,
} from "@mui/x-data-grid";
import { ptBR } from "@mui/x-data-grid/locales";

type DataTableProps<T extends GridValidRowModel> = {
  // --- Dados ---
  rows: T[];
  columns: GridColDef<T>[];
  rowCount?: number;
  getRowId?: GridRowIdGetter<T>;

  // --- Paginação ---
  paginationMode?: "server" | "client";
  paginationModel?: GridPaginationModel;
  onPaginationModelChange?: (model: GridPaginationModel) => void;
  pageSizeOptions?: number[];

  // --- Ordenação ---
  sortModel?: GridSortModel;
  onSortModelChange?: (model: GridSortModel) => void;
  disableColumnSorting?: boolean;

  // --- Seleção ---
  checkboxSelection?: boolean;
  onRowClick?: (params: GridRowParams<T>) => void;

  // --- Aparência ---
  loading?: boolean;
  density?: GridDensity;
  autoHeight?: boolean;
  getRowClassName?: (params: GridRowParams<T>) => string;

  // --- Rodapé ---
  hideFooter?: boolean;
  showTotalRows?: boolean;
  footerLeft?: React.ReactNode;

  // --- Mensagens ---
  noRowsText?: string;
};

const ptBRLocale = ptBR.components.MuiDataGrid.defaultProps.localeText;

function NoRowsOverlay({ text }: { text: string }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        p: 2,
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {text}
      </Typography>
    </Box>
  );
}

function CustomFooter({
  rowCount,
  showTotalRows,
  footerLeft,
}: {
  rowCount?: number;
  showTotalRows?: boolean;
  footerLeft?: React.ReactNode;
}) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        px: 2,
        borderTop: 1,
        borderColor: "divider",
      }}
    >
      <Box sx={{ flex: 1, display: "flex", alignItems: "center", gap: 2 }}>
        {showTotalRows && rowCount != null && (
          <Typography variant="body2" color="text.secondary">
            Total: {rowCount} registro{rowCount !== 1 ? "s" : ""}
          </Typography>
        )}
        {footerLeft}
      </Box>
      <GridPagination />
    </Box>
  );
}

export function DataTable<T extends GridValidRowModel>({
  rows,
  columns,
  rowCount,
  getRowId,
  paginationMode = "server",
  paginationModel,
  onPaginationModelChange,
  pageSizeOptions = [5, 10, 25],
  sortModel,
  onSortModelChange,
  disableColumnSorting = false,
  checkboxSelection = false,
  onRowClick,
  loading = false,
  density = "standard",
  autoHeight = false,
  getRowClassName,
  hideFooter = false,
  showTotalRows = true,
  footerLeft,
  noRowsText = "Nenhum registro encontrado.",
}: DataTableProps<T>) {
  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid<T>
        rows={rows}
        columns={columns}
        rowCount={rowCount}
        getRowId={getRowId}
        loading={loading}
        density={density}
        autoHeight={autoHeight}
        checkboxSelection={checkboxSelection}
        onRowClick={onRowClick}
        getRowClassName={getRowClassName}
        paginationMode={paginationMode}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={pageSizeOptions}
        sortModel={sortModel}
        onSortModelChange={onSortModelChange}
        disableColumnSorting={disableColumnSorting}
        disableRowSelectionOnClick
        disableColumnFilter
        disableColumnMenu
        hideFooter={hideFooter}
        localeText={ptBRLocale}
        slots={{
          noRowsOverlay: () => <NoRowsOverlay text={noRowsText} />,
          footer: hideFooter
            ? undefined
            : () => (
                <CustomFooter
                  rowCount={rowCount}
                  showTotalRows={showTotalRows}
                  footerLeft={footerLeft}
                />
              ),
        }}
      />
    </Box>
  );
}
