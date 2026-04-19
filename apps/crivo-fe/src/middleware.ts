import { betterFetch } from "@better-fetch/fetch";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;

  const { data: session } = await betterFetch<Record<string, unknown>>(
    "/api/auth/get-session",
    {
      baseURL: nextUrl.origin,
      headers: { cookie: req.headers.get("cookie") ?? "" },
    },
  );

  if (!session) {
    const signInUrl = new URL("/auth/signin", nextUrl.origin);
    signInUrl.searchParams.set(
      "callbackUrl",
      nextUrl.pathname + nextUrl.search,
    );
    return NextResponse.redirect(signInUrl);
  }

  const accessToken = session?.accessToken as string | undefined;

  // Se o refresh do token Keycloak falhou (accessToken vazio), força novo login
  if (accessToken === "") {
    const signInUrl = new URL("/auth/signin", nextUrl.origin);
    signInUrl.searchParams.set(
      "callbackUrl",
      nextUrl.pathname + nextUrl.search,
    );
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/secure/:path*"],
};
