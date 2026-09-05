import type { File } from "../generated/prisma/client";

/**
 * Public-facing file shape. Hides the internal on-disk `path` so the API
 * never leaks server storage locations to clients.
 */
export interface PublicFile {
  id: number;
  originalName: string;
  filename: string;
  size: number;
  mimetype: string;
  extractedContent: string | null;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Lighter list projection: excludes the potentially large `extractedContent`.
 */
export interface PublicFileListItem {
  id: number;
  originalName: string;
  filename: string;
  size: number;
  mimetype: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}

export function toPublicFile(file: File): PublicFile {
  return {
    id: file.id,
    originalName: file.originalName,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    extractedContent: file.extractedContent,
    userId: file.userId,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  };
}

export function toPublicFileListItem(file: {
  id: number;
  originalName: string;
  filename: string;
  size: number;
  mimetype: string;
  userId: number;
  createdAt: Date;
  updatedAt: Date;
}): PublicFileListItem {
  return {
    id: file.id,
    originalName: file.originalName,
    filename: file.filename,
    size: file.size,
    mimetype: file.mimetype,
    userId: file.userId,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  };
}
