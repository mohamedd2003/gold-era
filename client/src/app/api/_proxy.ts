import { NextResponse } from "next/server";
import { getAuthToken } from "@/lib/authToken";
import { getSessionUser, isAdmin } from "@/lib/session";

/**
 * Helpers shared by the route handlers that sit in front of the Express API.
 * They exist so the browser can authenticate through the httpOnly cookie
 * instead of a token it is not allowed to read.
 */

/** Forwards an upstream JSON response untouched, status included. */
export async function jsonFromUpstream(upstream: Response) {
  const body = await upstream.text();
  return new NextResponse(body, {
    status: upstream.status,
    headers: { "Content-Type": "application/json" },
  });
}

export function unauthorized() {
  return NextResponse.json(
    { success: false, message: "You are not signed in" },
    { status: 401 }
  );
}

export function forbidden() {
  return NextResponse.json(
    { success: false, message: "Administrator access is required" },
    { status: 403 }
  );
}

export function unreachable() {
  return NextResponse.json(
    { success: false, message: "Unable to reach the server" },
    { status: 502 }
  );
}

/**
 * Resolves the caller's token but only for admins, so admin traffic is never
 * forwarded on behalf of a regular user. Express re-checks the role, this is
 * the front-end half of the same rule.
 */
export async function adminToken(): Promise<
  { ok: true; token: string } | { ok: false; response: NextResponse }
> {
  const token = await getAuthToken();
  if (!token) return { ok: false, response: unauthorized() };

  const user = await getSessionUser();
  if (!isAdmin(user)) return { ok: false, response: forbidden() };

  return { ok: true, token };
}
