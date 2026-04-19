import { betterAuth } from "better-auth";
import { genericOAuth, keycloak, customSession } from "better-auth/plugins";
import { Pool } from "pg";

// Shared pg pool – points to the same PostgreSQL instance as the backend
// but Better Auth tables are prefixed with "auth_" to avoid schema conflicts.
export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

type AccountRecord = {
  id: string;
  accountId: string;
  accessToken: string | null;
  refreshToken: string | null;
  accessTokenExpiresAt: Date | null;
};

export const auth = betterAuth({
  database: pool,

  // ─── Custom table names (prefix "auth_") to avoid collision with NestJS tables ───
  user: { modelName: "auth_user" },
  session: { modelName: "auth_session" },
  account: { modelName: "auth_account" },
  verification: { modelName: "auth_verification" },

  plugins: [
    // ─── Keycloak via genericOAuth ──────────────────────────────────────────────
    genericOAuth({
      config: [
        keycloak({
          clientId: process.env.AUTH_KEYCLOAK_ID!,
          clientSecret: process.env.AUTH_KEYCLOAK_SECRET!,
          issuer: process.env.AUTH_KEYCLOAK_ISSUER!,
          pkce: true,
          scopes: ["openid", "profile", "email", "offline_access"],
        }),
      ],
    }),

    // ─── Expose Keycloak access token & keycloakId inside the session ──────────
    customSession(async ({ user, session }, ctx) => {
      const account = await ctx.context.adapter.findOne<AccountRecord>({
        model: "account",
        where: [
          { field: "userId", value: session.userId },
          { field: "providerId", value: "keycloak" },
        ],
      });

      if (!account) {
        return { user, session, accessToken: "", keycloakId: "" };
      }

      let accessToken = account.accessToken ?? "";
      const isExpired =
        account.accessTokenExpiresAt &&
        new Date(account.accessTokenExpiresAt) < new Date();

      // Refresh Keycloak token when expired (mirrors previous NextAuth jwt callback)
      if (isExpired && account.refreshToken) {
        try {
          const response = await fetch(
            `${process.env.AUTH_KEYCLOAK_ISSUER}/protocol/openid-connect/token`,
            {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: new URLSearchParams({
                client_id: process.env.AUTH_KEYCLOAK_ID!,
                client_secret: process.env.AUTH_KEYCLOAK_SECRET!,
                grant_type: "refresh_token",
                refresh_token: account.refreshToken,
              }),
            },
          );

          if (response.ok) {
            const tokens = await response.json();
            await ctx.context.adapter.update({
              model: "account",
              where: [{ field: "id", value: account.id }],
              update: {
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token ?? account.refreshToken,
                accessTokenExpiresAt: new Date(
                  Date.now() + tokens.expires_in * 1000,
                ),
              },
            });
            accessToken = tokens.access_token;
          } else {
            // Refresh failed – force re-login on next protected request
            accessToken = "";
          }
        } catch {
          accessToken = "";
        }
      }

      return {
        user,
        session,
        accessToken,
        keycloakId: account.accountId,
      };
    }),
  ],
});
