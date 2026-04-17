import { Box } from "@mui/material";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
};

export const Container = ({
  children,
  className,
  ...rest
}: ContainerProps & React.ComponentProps<typeof Box>) => {
  return (
    <Box
      className={className}
      sx={{ display: "flex", minHeight: "100vh", bgcolor: "grey.50" }}
      {...rest}
    >
      <Box component="main" sx={{ flexGrow: 1, p: 3, mt: 8 }}>
        {children}
      </Box>
    </Box>
  );
};
