"use server";

import {
  resendCodeSchema,
  verifyEmailSchema,
  type ResendCodeInput,
  type VerifyEmailInput,
} from "../validation/verifyEmail.validation";
import type { ResendState, VerifyEmailState } from "../types/verifyEmail.types";
import { API_URL } from "@/lib/axios";
import type { ApiError, ApiResponse } from "@/types";

async function postJson(
  path: string,
  payload: unknown
): Promise<{ ok: boolean; body: ApiResponse | null }> {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => null)) as ApiResponse | null;
  return { ok: res.ok, body };
}

/** POST /auth/verify-email */
export async function verifyEmailAction(
  values: VerifyEmailInput
): Promise<VerifyEmailState> {
  const parsed = verifyEmailSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid code.",
    };
  }

  try {
    const { ok, body } = await postJson("/auth/verify-email", parsed.data);
    if (!ok || !body || !body.success) {
      return {
        status: "error",
        message:
          (body as ApiError | null)?.details?.[0]?.message ??
          body?.message ??
          "Verification failed. Please try again.",
      };
    }
    return { status: "success", message: body.message };
  } catch {
    return {
      status: "error",
      message: "Unable to reach the server. Please try again later.",
    };
  }
}

/** POST /auth/resend-code */
export async function resendCodeAction(
  values: ResendCodeInput
): Promise<ResendState> {
  const parsed = resendCodeSchema.safeParse(values);
  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Invalid email.",
    };
  }

  try {
    const { ok, body } = await postJson("/auth/resend-code", parsed.data);
    if (!ok || !body || !body.success) {
      return {
        status: "error",
        message:
          (body as ApiError | null)?.details?.[0]?.message ??
          body?.message ??
          "Could not resend the code. Please try again.",
      };
    }
    return { status: "success", message: body.message };
  } catch {
    return {
      status: "error",
      message: "Unable to reach the server. Please try again later.",
    };
  }
}
