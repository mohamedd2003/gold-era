import { z } from "zod";

/**
 * Mirrors the server's `loginSchema`
 * (server/validations/auth.validation.ts).
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("A valid email is required")
    .toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

export type LoginInput = z.infer<typeof loginSchema>;
