import { Controller, useForm } from "react-hook-form";
import { SearchIcon, X } from "lucide-react";

import { Box, Divider, IconButton, MenuItem, TextField } from "@mui/material";

import { ROLE_OPTIONS, UserQueryParams } from "../../schemas";

type UserSearchProps = {
  onSearch: (filters: Partial<UserQueryParams>) => void;
  isLoading?: boolean;
};

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  USER: "Usuário",
  SUPPORT: "Suporte",
};

export const UserSearch = ({ onSearch, isLoading }: UserSearchProps) => {
  const { handleSubmit, control, reset } = useForm<UserQueryParams>({
    defaultValues: {
      firstname: "",
      email: "",
      role: undefined,
    },
  });

  const onSubmit = (data: UserQueryParams) => {
    onSearch({
      firstname: data.firstname || undefined,
      email: data.email || undefined,
      role: data.role || undefined,
    });
  };

  const handleClear = () => {
    reset({ firstname: "", email: "", role: undefined });
    onSearch({});
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 1.5,
          alignItems: { md: "flex-end" },
          mb: 2,
        }}
      >
        <Controller
          name="firstname"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              size="small"
              fullWidth
              placeholder="Pesquisar por nome"
              disabled={isLoading}
            />
          )}
        />

        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              size="small"
              fullWidth
              placeholder="Pesquisar por email"
              disabled={isLoading}
            />
          )}
        />

        <Controller
          name="role"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              value={field.value ?? ""}
              select
              size="small"
              fullWidth
              label="Papel"
              disabled={isLoading}
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="">Todos</MenuItem>
              {ROLE_OPTIONS.map((role) => (
                <MenuItem key={role} value={role}>
                  {ROLE_LABELS[role] ?? role}
                </MenuItem>
              ))}
            </TextField>
          )}
        />

        <Box sx={{ display: "flex", gap: 1, flexShrink: 0 }}>
          <IconButton type="submit" color="primary" disabled={isLoading}>
            <SearchIcon size={16} />
          </IconButton>
          <IconButton
            type="button"
            color="error"
            onClick={handleClear}
            disabled={isLoading}
          >
            <X size={16} />
          </IconButton>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />
    </form>
  );
};
