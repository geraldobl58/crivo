import { Box, Typography } from "@mui/material";

type TitleBarProps = {
  title: string;
  description: string;
  content?: React.ReactNode;
};

export const TitleBar = ({ title, description, content }: TitleBarProps) => {
  return (
    <Box className="flex items-center justify-between flex-wrap gap-2">
      <Box>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {description}
        </Typography>
      </Box>
      <Box>{content && <Box sx={{ mt: 2 }}>{content}</Box>}</Box>
    </Box>
  );
};
