import MuiProvider from "@/providers/MuiProvider";
import { Wrapper } from "./components/Wrapper";
import { QueryProvider } from "@/providers/QueryProvider";

export default function AdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <MuiProvider>
        <Wrapper>{children}</Wrapper>
      </MuiProvider>
    </QueryProvider>
  );
}
