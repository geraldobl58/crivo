"use client";

import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Alert, Box, Button, CircularProgress, TextField } from "@mui/material";
import {
  CreateCompanyRequest,
  CreateCompanyRequestSchema,
} from "../../schemas";
import { createCompanyAction } from "../../actions";

interface MyCompanyCreateProps {
  onSuccess?: () => void;
}

export const MyCompanyCreate = ({ onSuccess }: MyCompanyCreateProps) => {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<CreateCompanyRequest>({
    resolver: zodResolver(CreateCompanyRequestSchema),
    defaultValues: {
      name: "",
      taxId: "",
    },
  });

  const onSubmit = async (data: CreateCompanyRequest) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await createCompanyAction(data);
      if (!result.success) {
        setServerError(result.message ?? "Erro ao criar empresa.");
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
        name="name"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="Nome da Empresa"
            fullWidth
            error={!!errors.name}
            helperText={errors.name?.message ?? ""}
          />
        )}
      />

      <Controller
        name="taxId"
        control={control}
        render={({ field }) => (
          <TextField
            {...field}
            label="CNPJ (somente números)"
            fullWidth
            slotProps={{ htmlInput: { maxLength: 14 } }}
            error={!!errors.taxId}
            helperText={errors.taxId?.message ?? "Ex: 12345678000199"}
          />
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
          {isSubmitting ? "Criando..." : "Criar Empresa"}
        </Button>
      </Box>
    </form>
  );
};
