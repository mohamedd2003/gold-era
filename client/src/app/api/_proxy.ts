import { NextResponse } from "next/server";

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

export function unreachable() {
  return NextResponse.json(
    { success: false, message: "Unable to reach the server" },
    { status: 502 }
  );
}
