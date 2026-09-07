import axios from "axios";
import { nextApi } from "@/lib/axios";
import type { ApiError, ApiSuccess } from "@/types";
import type {
  FileDetails,
  StoredFile,
  StoredFilesPage,
} from "../types/UploadFiles.types";
import {
  fileIdSchema,
  listFilesParamsSchema,
  type ListFilesParams,
} from "../validation/UploadFiles.validation";

/** GET /api/files */
export async function listFiles(
  params: ListFilesParams = {}
): Promise<StoredFilesPage> {
  const query = listFilesParamsSchema.parse(params);
  const { data } = await nextApi.get<ApiSuccess<StoredFile[]>>("/files", {
    params: query,
  });
  return { items: data.data, meta: data.meta };
}

/** POST /api/files — reports browser → server progress as it goes. */
export async function uploadFile(
  file: File,
  options: { onProgress?: (percent: number) => void; signal?: AbortSignal } = {}
): Promise<StoredFile> {
  const body = new FormData();
  body.append("file", file);

  const { data } = await nextApi.post<ApiSuccess<StoredFile>>("/files", body, {
    signal: options.signal,
    onUploadProgress: (event) => {
      const total = event.total ?? file.size;
      if (!options.onProgress || !total) return;
      options.onProgress(Math.min(100, Math.round((event.loaded / total) * 100)));
    },
  });

  return data.data;
}

/** GET /api/files/:id */
export async function getFile(id: number): Promise<FileDetails> {
  const { data } = await nextApi.get<ApiSuccess<FileDetails>>(
    `/files/${fileIdSchema.parse(id)}`
  );
  return data.data;
}

/** DELETE /api/files/:id */
export async function deleteFile(id: number): Promise<void> {
  await nextApi.delete(`/files/${fileIdSchema.parse(id)}`);
}

/** Same-origin URL, so the browser sends the httpOnly cookie for us. */
export function fileUrl(id: number, mode: "inline" | "download" = "inline") {
  return `/api/files/${id}/download${mode === "download" ? "?download=1" : ""}`;
}

/** Pulls the server's message out of an axios error, with sane fallbacks. */
export function apiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError<ApiError>(error)) {
    return (
      error.response?.data?.details?.[0]?.message ??
      error.response?.data?.message ??
      fallback
    );
  }
  return error instanceof Error ? error.message : fallback;
}
