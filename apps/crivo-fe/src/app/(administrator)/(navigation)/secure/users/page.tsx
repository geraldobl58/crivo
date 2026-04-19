"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "next-auth/react";

import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";

import { Container } from "@/app/(administrator)/components/Container";
import { TitleBar } from "@/app/(administrator)/components/TitleBar";
import { DataTable } from "@/app/(administrator)/components/DataTable";
import { ModalDialog } from "@/components/ModalDialog";

import { UserSearch } from "@/features/users/components/UserSearch";
import { buildColumns } from "@/features/users/components/Columns";
import { UserCreate } from "@/features/users/components/UserCreate";

import { useUsers } from "@/features/users/hooks";
import { deleteUserAction, updateUserAction } from "@/features/users/actions";
import {
  ROLE_OPTIONS,
  UserQueryParams,
  UpdateUserRequest,
  UpdateUserRequestSchema,
} from "@/features/users/schemas";
import type { UserResponse } from "@/features/users/types";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  USER: "Usuário",
  SUPPORT: "Suporte",
};

export default function UsersPage() {
  const [open, setOpen] = useState(false);
  const { data: session } = useSession();

  // Edit state
  const [editTarget, setEditTarget] = useState<UserResponse | null>(null);
  const [editError, setEditError] = useState<string | null>(null);
  const [editSubmitting, setEditSubmitting] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<UserResponse | null>(null);
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
  } = useUsers();

  // Edit form
  const {
    handleSubmit: handleEditSubmit,
    control: editControl,
    reset: resetEdit,
    formState: { errors: editErrors },
  } = useForm<UpdateUserRequest>({
    resolver: zodResolver(UpdateUserRequestSchema),
    defaultValues: { firstname: "", lastname: "", email: "", role: "USER" },
  });

  // Sync edit form when target changes
  useEffect(() => {
    if (editTarget) {
      resetEdit({
        firstname: editTarget.firstname ?? "",
        lastname: editTarget.lastname ?? "",
        email: editTarget.email,
        role: editTarget.role,
      });
    }
  }, [editTarget, resetEdit]);

  // Sync filters/pagination to URL
  useEffect(() => {
    const params = new URLSearchParams();
    if (queryParams.page && queryParams.page > 1)
      params.set("page", String(queryParams.page));
    if (queryParams.limit && queryParams.limit !== 10)
      params.set("limit", String(queryParams.limit));
    if (queryParams.firstname) params.set("firstname", queryParams.firstname);
    if (queryParams.email) params.set("email", queryParams.email);
    if (queryParams.role) params.set("role", queryParams.role);
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [queryParams, router, pathname]);

  const handleSearch = (filters: Partial<UserQueryParams>) => {
    handleFilters(filters);
  };

  // Edit submit
  const onEditSubmit = async (data: UpdateUserRequest) => {
    if (!editTarget) return;
    setEditError(null);
    setEditSubmitting(true);
    try {
      const result = await updateUserAction(editTarget.id, data);
      if (!result.success) {
        setEditError(result.message ?? "Erro ao atualizar usuário.");
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
      const result = await deleteUserAction(deleteTarget.id);
      if (!result.success) {
        setDeleteError(result.message ?? "Erro ao remover usuário.");
        return;
      }
      setDeleteTarget(null);
      refetch();
    } finally {
      setDeleteSubmitting(false);
    }
  };

  const displayName = (user: UserResponse) =>
    [user.firstname, user.lastname].filter(Boolean).join(" ") || user.email;

  const columns = buildColumns({
    onEdit: (row) => setEditTarget(row),
    onDelete: (row) => {
      setDeleteTarget(row);
      setDeleteError(null);
    },
    currentUserKeycloakId: session?.keycloakId,
  });

  return (
    <Container>
      {/* Create modal */}
      <ModalDialog
        open={open}
        onClose={() => setOpen(false)}
        title="Novo Usuário"
        content={
          <UserCreate
            onSuccess={() => {
              setOpen(false);
              refetch();
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
          <DialogTitle>Editar Usuário</DialogTitle>
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
              name="firstname"
              control={editControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Nome"
                  fullWidth
                  error={!!editErrors.firstname}
                  helperText={editErrors.firstname?.message}
                />
              )}
            />
            <Controller
              name="lastname"
              control={editControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Sobrenome"
                  fullWidth
                  error={!!editErrors.lastname}
                  helperText={editErrors.lastname?.message}
                />
              )}
            />
            <Controller
              name="email"
              control={editControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Email"
                  type="email"
                  fullWidth
                  error={!!editErrors.email}
                  helperText={editErrors.email?.message}
                />
              )}
            />
            <Controller
              name="role"
              control={editControl}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Papel"
                  fullWidth
                  error={!!editErrors.role}
                  helperText={editErrors.role?.message}
                >
                  {ROLE_OPTIONS.filter((r) => r !== "SUPPORT").map((role) => (
                    <MenuItem key={role} value={role}>
                      {ROLE_LABELS[role] ?? role}
                    </MenuItem>
                  ))}
                </TextField>
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
        <DialogTitle>Remover Usuário</DialogTitle>
        <DialogContent>
          {deleteError && (
            <Alert severity="error" sx={{ mb: 1 }}>
              {deleteError}
            </Alert>
          )}
          <DialogContentText>
            Tem certeza que deseja remover{" "}
            <strong>{deleteTarget ? displayName(deleteTarget) : ""}</strong>?
            Esta ação não pode ser desfeita.
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
        title="Usuários"
        description="Gerencie os usuários da sua empresa, defina papéis e permissões de acesso."
        content={
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
            startIcon={<UserPlus size={16} />}
          >
            Novo Usuário
          </Button>
        }
      />

      <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
        <UserSearch onSearch={handleSearch} isLoading={isLoading} />
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
}
