import MuiProvider from "@/providers/MuiProvider";
import { Wrapper } from "./components/Wrapper";
import { QueryProvider } from "@/providers/QueryProvider";
import { SessionProvider } from "next-auth/react";

export default function AdministratorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryProvider>
      <SessionProvider>
        <MuiProvider>
          <Wrapper>{children}</Wrapper>
        </MuiProvider>
      </SessionProvider>
    </QueryProvider>
  );
}
