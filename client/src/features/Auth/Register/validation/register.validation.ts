import { z } from "zod";

/**
 * Individual password rules — used both by the zod schema (submit-time
 * validation) and by the live requirements checklist in the UI so the
 * user can see exactly which rule is failing.
 */
export const passwordRules: { label: string; test: (v: string) => boolean }[] =
  [
    { label: "At least 8 characters", test: (v) => v.length >= 8 },
    { label: "One uppercase letter (A–Z)", test: (v) => /[A-Z]/.test(v) },
    {
      label: "One special character (!@#$…)",
      test: (v) => /[^A-Za-z0-9]/.test(v),
    },
  ];

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password must be at most 72 characters")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(
    /[^A-Za-z0-9]/,
    "Password must contain at least one special character"
  );

/**
 * Mirrors the server's `registerSchema`
 * (server/validations/auth.validation.ts).
 */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name is too long"),
  email: z
    .string()
    .trim()
    .min(1, "Email is required")
    .email("A valid email is required")
    .toLowerCase(),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
