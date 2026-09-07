import { z } from "zod";

export const MAX_FILE_SIZE_MB = 25;
export const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

/** Mirrors the extensions rejected by the Express upload middleware. */
export const BLOCKED_EXTENSIONS = [".exe", ".bat", ".cmd", ".sh", ".msi"];

/**
 * Client-side gate so the obvious rejections never leave the browser. The
 * server still enforces the same rules.
 */
export const fileSchema = z
  .instanceof(File)
  .refine((file) => file.size > 0, { message: "File is empty." })
  .refine((file) => file.size <= MAX_FILE_SIZE_BYTES, {
    message: `Larger than ${MAX_FILE_SIZE_MB} MB.`,
  })
  .refine(
    (file) =>
      !BLOCKED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext)),
    { message: "This file type is not allowed." }
  );

export const listFilesParamsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().trim().max(255).optional(),
  /** Matched against the mimetype, e.g. "image", "pdf". */
  type: z.string().trim().max(150).optional(),
  /** Admin-only owner filter; the server ignores it for regular users. */
  userId: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(["createdAt", "size", "originalName"]).default("createdAt"),
  order: z.enum(["asc", "desc"]).default("desc"),
});

export const fileIdSchema = z.coerce.number().int().positive();

export type ListFilesParams = z.input<typeof listFilesParamsSchema>;
export type ListFilesQuery = z.output<typeof listFilesParamsSchema>;
