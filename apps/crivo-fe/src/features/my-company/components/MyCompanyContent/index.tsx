import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Alert,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  TextField,
  Tooltip,
} from "@mui/material";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Container } from "@/app/(administrator)/components/Container";
import { TitleBar } from "@/app/(administrator)/components/TitleBar";
import { DataTable } from "@/app/(administrator)/components/DataTable";
import { ModalDialog } from "@/components/ModalDialog";

import { MyCompanySearch } from "../MyCompanySearch";
import { buildColumns } from "../MyCompanyList/Columns";
import { MyCompanyCreate } from "../MyCompanyCreate";

import { useCompanies, usePlanLimit } from "../../hooks";
import { deleteCompanyAction, updateCompanyAction } from "../../actions";
import {
  CompanyQueryParams,
  UpdateCompanyRequest,
  UpdateCompanyRequestSchema,
} from "../../schemas";
import { CompanyResponse } from "../../types";

export const MyCompanyContent = () => {
  const [open, setOpen] = useState(false);
  const { update: updateSession } = useSession();

  // Edit state
  const [editTarget, setEditTarget] = useState<CompanyResponse | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<CompanyResponse | null>(
    null,
  );
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteSubmitting, setDeleteSubmitting] = useState(false);

  const router = useRouter();
  const pathname = usePathname();

  const {
    rows,
    total,
    isLoading,
    isFetching,
    queryParams,
    handleFilters,
    handlePageChange,
    handleLimitChange,
    refetch,
  } = useCompanies();

  const { isAtLimit, limitMessage } = usePlanLimit(total);

  // Edit form
  const {
    handleSubmit: handleEditSubmit,
    control: editControl,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<UpdateCompanyRequest>({
    resolver: zodResolver(UpdateCompanyRequestSchema),
    defaultValues: { name: "", tax_id: "" },
  });

  // Sync edit form when target changes
  useEffect(() => {
    if (editTarget) {
      resetEdit({ name: editTarget.name, tax_id: editTarget.tax_id ?? "" });
      setEditError(null);
    }
  }, [editTarget, resetEdit]);

  // Sync filters/pagination to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (queryParams.page && queryParams.page > 1)
      params.set("page", String(queryParams.page));
    if (queryParams.limit && queryParams.limit !== 10)
      params.set("limit", String(queryParams.limit));
    if (queryParams.search) params.set("search", queryParams.search);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [queryParams, router, pathname]);

  const handleSearch = (filters: Partial<CompanyQueryParams>) => {
    handleFilters(filters);
  };

  // Edit submit
  const onEditSubmit = async (data: UpdateCompanyRequest) => {
    if (!editTarget) return;
    setEditError(null);
    setEditSubmitting(true);
    try {
      const result = await updateCompanyAction(editTarget.id, data);
      if (!result.success) {
        setEditError(result.message ?? "Erro ao atualizar empresa.");
        return;
      }
      setEditTarget(null);
      refetch();
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete confirm
  const onDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleteError(null);
    setDeleteSubmitting(true);
    try {
      const result = await deleteCompanyAction(deleteTarget.id);
      if (!result.success) {
        setDeleteError(result.message ?? "Erro ao remover empresa.");
        return;
      }
      setDeleteTarget(null);
      refetch();
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const columns = buildColumns({
    onEdit: (row) => setEditTarget(row),
    onDelete: (row) => {
      setDeleteTarget(row);
      setDeleteError(null);
    },
    onView: (row) => router.push(`${pathname}/${row.id}`),
  });

  return (
    <Container>
      {/* Create modal */}
      <ModalDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Novo Registro"
        content={
          <MyCompanyCreate
            onSuccess={() => {
              setOpen(false);
              refetch();
              updateSession();
            }}
          />
        }
      />

      {/* Edit dialog */}
      <Dialog
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        fullWidth
        maxWidth="sm"
      >
        <form onSubmit={handleEditSubmit(onEditSubmit)}>
          <DialogTitle>Editar Empresa</DialogTitle>
          <DialogContent
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              pt: "16px !important",
            }}
          >
            {editError && <Alert severity="error">{editError}</Alert>}
            <Controller
              name="name"
              control={editControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome da Empresa"
                  fullWidth
                  error={!!editErrors.name}
                  helperText={editErrors.name?.message}
                />
              )}
            />
            <Controller
              name="tax_id"
              control={editControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="CNPJ (somente números)"
                  fullWidth
                  slotProps={{ htmlInput: { maxLength: 14 } }}
                  error={!!editErrors.tax_id}
                  helperText={
                    editErrors.tax_id?.message ?? "Ex: 12345678000199"
                  }
                />
              )}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setEditTarget(null)}
              disabled={editSubmitting}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={editSubmitting}
              startIcon={
                editSubmitting ? (
                  <CircularProgress size={14} color="inherit" />
                ) : null
              }
            >
              {editSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Remover Empresa</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {deleteError}
            </Alert>
          )}
          <DialogContentText>
            Tem certeza que deseja remover <strong>{deleteTarget?.name}</strong>
            ? Esta ação não pode ser desfeita.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteTarget(null)}
            disabled={deleteSubmitting}
          >
            Cancelar
          </Button>
          <Button
            onClick={onDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteSubmitting}
            startIcon={
              deleteSubmitting ? (
                <CircularProgress size={14} color="inherit" />
              ) : null
            }
          >
            {deleteSubmitting ? "Removendo..." : "Remover"}
          </Button>
        </DialogActions>
      </Dialog>

      <TitleBar
        title="Minha Empresa"
        description="Gerencie as informações e configurações da sua empresa, incluindo dados cadastrais, usuários e preferências."
        content={
          <Tooltip
            title={isAtLimit ? (limitMessage ?? "") : ""}
            arrow
            disableHoverListener={!isAtLimit}
          >
            <span>
              <Button
                variant="contained"
                onClick={() => setOpen(true)}
                disabled={isAtLimit}
              >
                Novo Registro
              </Button>
            </span>
          </Tooltip>
        }
      />
      <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
        <MyCompanySearch onSearch={handleSearch} isLoading={isLoading} />
        <DataTable
          columns={columns}
          rows={rows}
          rowCount={total}
          loading={isLoading || isFetching}
          paginationMode="server"
          paginationModel={{
            page: (queryParams.page ?? 1) - 1,
            pageSize: queryParams.limit ?? 10,
          }}
          onPaginationModelChange={(model) => {
            if (model.pageSize !== (queryParams.limit ?? 10)) {
              handleLimitChange(model.pageSize);
            } else {
              handlePageChange(model.page + 1);
            }
          }}
          pageSizeOptions={[5, 10, 25]}
        />
      </Paper>
    </Container>
  );
};
