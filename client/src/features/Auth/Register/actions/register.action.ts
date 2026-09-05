"use server";

import {
  registerSchema,
  type RegisterInput,
} from "../validation/register.validation";
import type { RegisterState, RegisterUser } from "../types/Register.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://gold-era-production-a530.up.railway.app/api/v1";

interface ApiSuccess {
  success: true;
  message: string;
  data: RegisterUser;
}

interface ApiError {
  success: false;
  message: string;
  details?: { field?: string; message: string }[];
}

/**
 * Server Action that registers a user against `POST /auth/register`.
 * Re-validates on the server (including the password rules) and returns a
 * plain state object the client form reacts to (sonner + redirect).
 */
export async function registerAction(
  values: RegisterInput
): Promise<RegisterState> {
  const parsed = registerSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid details.",
    };
  }

  let body: ApiSuccess | ApiError | null = null;
  let ok = false;

  try {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
    ok = res.ok;
    body = (await res.json().catch(() => null)) as
      | ApiSuccess
      | ApiError
      | null;
  } catch {
    return {
      status: "error",
      message: "Unable to reach the server. Please try again later.",
    };
  }

  if (!ok || !body || !body.success) {
    // Surface the exact server-side message (e.g. a failed password rule).
    const detailMsg =
      (body as ApiError | null)?.details?.[0]?.message ?? undefined;
    return {
      status: "error",
      message: detailMsg ?? body?.message ?? "Registration failed.",
    };
  }

  return {
    status: "success",
    message: body.message,
    email: parsed.data.email,
  };
}
