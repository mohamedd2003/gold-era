import { z } from "zod";

export const roleSchema = z.enum(["USER", "ADMIN"]);

export const listUsersParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(180).optional(),
  role: roleSchema.optional(),
  /** Sent as a string because it travels in the query string. */
  isVerified: z.enum(["true", "false"]).optional(),
  sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

/** Mirrors the server's `updateUserSchema`: at least one field is required. */
export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    role: roleSchema.optional(),
    isVerified: z.boolean().optional(),
  })
  .refine((data) => Object.values(data).some((value) => value !== undefined), {
    message: "Nothing to update.",
  });

export const userIdSchema = z.coerce.number().int().positive();

export type ListUsersParams = z.input<typeof listUsersParamsSchema>;
export type ListUsersQuery = z.output<typeof listUsersParamsSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
