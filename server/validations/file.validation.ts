import { z } from "zod";

const emptyToUndefined = (value: unknown) =>
  value === "" || value === null ? undefined : value;

export const listFilesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  search: z.preprocess(emptyToUndefined, z.string().trim().max(255).optional()),
  // Matches against mimetype, e.g. "image", "pdf", "text".
  type: z.preprocess(emptyToUndefined, z.string().trim().max(150).optional()),
  // Admin-only filter; ignored for regular users, who are always scoped to self.
  userId: z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().positive().optional()
  ),
  sortBy: z.enum(["createdAt", "size", "originalName"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const fileIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export type ListFilesQuery = z.infer<typeof listFilesQuerySchema>;
