import { createAuthClient } from "better-auth/react";
import { genericOAuthClient } from "better-auth/client/plugins";
import { customSessionClient } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  plugins: [
    genericOAuthClient(),
    // Infers customSession extra fields (accessToken, keycloakId) on the client
    customSessionClient<typeof auth>(),
  ],
});
