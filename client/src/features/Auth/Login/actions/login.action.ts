"use server";

import { cookies } from "next/headers";
import { loginSchema, type LoginInput } from "../validation/login.valdation";
import type { LoginData, LoginState } from "../types/Login.types";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "https://gold-era-production-a530.up.railway.app/api/v1";

const TOKEN_COOKIE = "gold_era_token";
const ROLE_COOKIE = "gold_era_role";
const TOKEN_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

interface ApiSuccess {
  success: true;
  message: string;
  data: LoginData;
}

interface ApiError {
  success: false;
  message: string;
}

/**
 * Server Action that authenticates a user against `POST /auth/login`,
 * stores the JWT in an httpOnly cookie, and returns a plain state object
 * the client form can react to (sonner + redirect).
 */
export async function loginAction(values: LoginInput): Promise<LoginState> {
  // Re-validate on the server; never trust the client alone.
  const parsed = loginSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid credentials.",
    };
  }

  let body: ApiSuccess | ApiError | null = null;
  let ok = false;
  let httpStatus = 0;

  try {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
      cache: "no-store",
    });
    ok = res.ok;
    httpStatus = res.status;
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
    return {
      status: "error",
      message: body?.message ?? "Login failed. Please try again.",
      needsVerification: httpStatus === 403,
    };
  }

  const { token, user } = body.data;
  const cookieStore = await cookies();

  // Secret credential — httpOnly so it never reaches client JS.
  cookieStore.set(TOKEN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });

  // Role — readable by the client so the UI can render role-based views.
  cookieStore.set(ROLE_COOKIE, user.role, {
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: TOKEN_MAX_AGE,
    path: "/",
  });

  // A verified user is required to reach here (backend returns 403 otherwise),
  // but we double-check to be explicit about the routing contract.
  const redirectTo = user.isVerified ? "/dashboard" : "/verifyEmail";

  return {
    status: "success",
    message: `Welcome back, ${user.name}!`,
    role: user.role,
    redirectTo,
  };
}
