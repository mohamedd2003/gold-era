import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().trim().toLowerCase().email("A valid email is required").max(180),
  // bcrypt only uses the first 72 bytes; cap length accordingly.
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(72, "Password must be at most 72 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(
      /[^A-Za-z0-9]/,
      "Password must contain at least one special character"
    ),
});

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  password: z.string().min(1, "Password is required"),
});

export const verifyEmailSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  code: z
    .string()
    .trim()
    .regex(/^\d{6}$/, "Code must be a 6-digit number"),
});

export const resendCodeSchema = z.object({
  email: z.string().trim().toLowerCase().email("A valid email is required"),
});

export type RegisterDto = z.infer<typeof registerSchema>;
export type LoginDto = z.infer<typeof loginSchema>;
export type VerifyEmailDto = z.infer<typeof verifyEmailSchema>;
export type ResendCodeDto = z.infer<typeof resendCodeSchema>;
