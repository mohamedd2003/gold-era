import { z } from "zod";

/** Mirrors the server's `verifyEmailSchema`. */
export const verifyEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("A valid email is required")
    .toLowerCase(),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Code must be a 6-digit number"),
});

/** Mirrors the server's `resendCodeSchema`. */
export const resendCodeSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("A valid email is required")
    .toLowerCase(),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendCodeInput = z.infer<typeof resendCodeSchema>;
