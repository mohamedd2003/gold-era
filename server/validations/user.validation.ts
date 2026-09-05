import { z } from "zod";
import { Role } from "../generated/prisma/client";

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.preprocess(emptyToUndefined, z.string().trim().max(180).optional()),
  role: z.preprocess(emptyToUndefined, z.enum(Role).optional()),
  isVerified: z.preprocess(
    emptyToUndefined,
    z
      .enum(["true", "false"])
      .transform((v) => v === "true")
      .optional()
  ),
  sortBy: z.enum(["createdAt", "name", "email"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2).max(120).optional(),
    role: z.enum(Role).optional(),
    isVerified: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
  });

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
export type UpdateUserDto = z.infer<typeof updateUserSchema>;
