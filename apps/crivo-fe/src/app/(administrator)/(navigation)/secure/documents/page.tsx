import { Box, Typography } from "@mui/material";

const DocumentsPage = () => {
  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}>
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        <Box>
          <Typography variant="h5" fontWeight={700} gutterBottom>
            Documentos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Aqui você pode gerenciar os documentos relacionados às suas
            finanças.
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentsPage;
