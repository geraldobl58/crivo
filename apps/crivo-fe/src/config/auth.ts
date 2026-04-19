import NextAuth from "next-auth";
import Keycloak from "next-auth/providers/keycloak";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Keycloak({
      clientId: process.env.AUTH_KEYCLOAK_ID!, // "crivo-web"
      clientSecret: process.env.AUTH_KEYCLOAK_SECRET!, // "" (public client)
      issuer: process.env.AUTH_KEYCLOAK_ISSUER!, // "http://localhost:8080/realms/crivo"
    }),
  ],
  pages: {
    error: "/auth/error",
  },
  callbacks: {
    async jwt({ token, account }) {
      // Primeiro login — salva tokens do Keycloak
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          expiresAt: account.expires_at,
          keycloakId: account.providerAccountId,
        };
      }

      // Token ainda válido
      if (Date.now() < (token.expiresAt as number) * 1000) {
        return token;
      }

      // Token expirado — refresh
      try {
        const response = await fetch(
          `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
              client_id: process.env.AUTH_KEYCLOAK_ID!,
              grant_type: "refresh_token",
              refresh_token: token.refreshToken as string,
            }),
          },
        );

        const tokens = await response.json();
        if (!response.ok) throw tokens;

        return {
          ...token,
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token ?? token.refreshToken,
          expiresAt: Math.floor(Date.now() / 1000) + tokens.expires_in,
        };
      } catch {
        return { ...token, error: "RefreshTokenError" };
      }
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string;
      session.keycloakId = token.keycloakId as string;
      session.error = token.error as string | undefined;
      session.user = {
        ...session.user,
        name: token.name as string | undefined,
        email: token.email as string | undefined,
      };
      return session;
    },
  },
});
