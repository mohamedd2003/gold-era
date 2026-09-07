import { cookies } from "next/headers";

export const TOKEN_COOKIE = "gold_era_token";
export const ROLE_COOKIE = "gold_era_role";

/**
 * Reads the JWT out of the httpOnly cookie. Only usable on the server
 * (Server Components, Server Actions and Route Handlers) — which is exactly
 * why the browser talks to `/api/*` route handlers instead of Express.
 */
export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(TOKEN_COOKIE)?.value ?? null;
}
