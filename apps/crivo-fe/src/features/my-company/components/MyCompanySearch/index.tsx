import { Controller, useForm } from "react-hook-form";
import { SearchIcon, X } from "lucide-react";

import { Box, Divider, IconButton, TextField } from "@mui/material";

import { CompanyQueryParams } from "../../schemas";

type MyCompanySearchProps = {
  onSearch: (filters: Partial<CompanyQueryParams>) => void;
  isLoading?: boolean;
};

export const MyCompanySearch = ({
  onSearch,
  isLoading,
}: MyCompanySearchProps) => {
  const { handleSubmit, control, reset } = useForm<CompanyQueryParams>({
    defaultValues: {
      search: "",
    },
  });

  const onSubmit = (data: CompanyQueryParams) => {
    onSearch({
      search: data.search || undefined,
    });
  };

  const handleClear = () => {
    reset({ search: "" });
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
          name="search"
          control={control}
          render={({ field }) => (
            <TextField
              {...field}
              size="small"
              fullWidth
              placeholder="Pesquisar por nome ou CNPJ"
              disabled={isLoading}
            />
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
