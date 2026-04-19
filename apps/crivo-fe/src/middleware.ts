import { auth } from "@/config/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;

  // If not authenticated and accessing /secure/*, redirect to Keycloak login
  if (!req.auth) {
    const signInUrl = new URL("/api/auth/signin", nextUrl.origin);
    signInUrl.searchParams.set(
      "callbackUrl",
      nextUrl.pathname + nextUrl.search,
    );
    return NextResponse.redirect(signInUrl);
  }

  // If token refresh failed, force re-login
  if (req.auth.error === "RefreshTokenError") {
    const signInUrl = new URL("/api/auth/signin", nextUrl.origin);
    signInUrl.searchParams.set(
      "callbackUrl",
      nextUrl.pathname + nextUrl.search,
    );
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/secure/:path*"],
};
