"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Alert,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  TextField,
} from "@mui/material";
import {
  CreateUserRequest,
  CreateUserRequestSchema,
  ROLE_OPTIONS,
} from "../../schemas";
import { createUserAction } from "../../actions";

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Proprietário",
  ADMIN: "Administrador",
  USER: "Usuário",
  SUPPORT: "Suporte",
};

interface UserCreateProps {
  onSuccess?: () => void;
}

export const UserCreate = ({ onSuccess }: UserCreateProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateUserRequest>({
    resolver: zodResolver(CreateUserRequestSchema),
    defaultValues: {
      email: "",
      firstname: "",
      lastname: "",
      role: "USER",
    },
  });

  const onSubmit = async (data: CreateUserRequest) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await createUserAction(data);
      if (!result.success) {
        setServerError(result.message ?? "Erro ao criar usuário.");
        return;
      }
      reset();
      onSuccess?.();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6!">
      {serverError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {serverError}
        </Alert>
      )}

      <Controller
        name="firstname"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nome"
            fullWidth
            error={!!errors.firstname}
            helperText={errors.firstname?.message ?? ""}
          />
        )}
      />

      <Controller
        name="lastname"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Sobrenome"
            fullWidth
            error={!!errors.lastname}
            helperText={errors.lastname?.message ?? ""}
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Email"
            type="email"
            fullWidth
            error={!!errors.email}
            helperText={errors.email?.message ?? ""}
          />
        )}
      />

      <Controller
        name="role"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            select
            label="Papel"
            fullWidth
            error={!!errors.role}
            helperText={errors.role?.message ?? ""}
          >
            {ROLE_OPTIONS.filter((r) => r !== "SUPPORT").map((role) => (
              <MenuItem key={role} value={role}>
                {ROLE_LABELS[role] ?? role}
              </MenuItem>
            ))}
          </TextField>
        )}
      />

      <Box>
        <Button
          fullWidth
          type="submit"
          variant="contained"
          color="primary"
          disabled={isSubmitting}
          startIcon={
            isSubmitting ? <CircularProgress size={16} color="inherit" /> : null
          }
        >
          {isSubmitting ? "Criando..." : "Criar Usuário"}
        </Button>
      </Box>
    </form>
  );
};
