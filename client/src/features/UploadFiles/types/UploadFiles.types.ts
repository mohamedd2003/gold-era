import type { PaginationMeta } from "@/types";

/** A file already stored on the server (list projection). */
export interface StoredFile {
  id: number;
  originalName: string;
  filename: string;
  size: number;
  mimetype: string;
  userId: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredFilesPage {
  items: StoredFile[];
  meta?: PaginationMeta;
}

export type UploadStatus =
  | "queued"
  | "uploading"
  | "processing"
  | "success"
  | "error";

/** A file picked in the browser, tracked while it uploads. */
export interface UploadTask {
  /** Local-only id; the server id arrives once the upload succeeds. */
  id: string;
  name: string;
  size: number;
  type: string;
  progress: number;
  status: UploadStatus;
  error?: string;
}
