import { auth } from "./auth";
import { env } from "./env";

/**
 * Server-side fetch utility that bypasses Kong and calls the backend directly.
 * Automatically attaches the JWT token from the NextAuth session.
 */
export async function serverFetch<T>(
  path: string,
  options?: {
    method?: string;
    body?: unknown;
    params?: Record<string, string | number | undefined>;
  },
): Promise<T> {
  const session = await auth();

  if (!session?.accessToken) {
    throw new Error("Unauthorized: no session token");
  }

  const url = new URL(path, env.INTERNAL_API_URL);

  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  const res = await fetch(url.toString(), {
    method: options?.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    ...(options?.body ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    const err = new Error(
      error.message || `Request failed with status ${res.status}`,
    );
    (err as any).response = { status: res.status, data: error };
    throw err;
  }

  if (res.status === 204) return undefined as T;

  return res.json();
}
