"use client";

import { useCallback, useRef, useState } from "react";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  apiErrorMessage,
  deleteFile,
  getFile,
  listFiles,
  uploadFile,
} from "../services/UploadFiles.services";
import type { UploadTask } from "../types/UploadFiles.types";
import {
  fileSchema,
  type ListFilesParams,
} from "../validation/UploadFiles.validation";

export const filesKeys = {
  all: ["files"] as const,
  list: (params: ListFilesParams) => ["files", "list", params] as const,
  detail: (id: number) => ["files", "detail", id] as const,
};

/** GET /api/files through React Query. */
export function useFiles(params: ListFilesParams = {}) {
  return useQuery({
    queryKey: filesKeys.list(params),
    queryFn: () => listFiles(params),
    placeholderData: keepPreviousData,
  });
}

/** GET /api/files/:id — used by the details panel. */
export function useFile(id: number | null) {
  return useQuery({
    queryKey: filesKeys.detail(id ?? 0),
    queryFn: () => getFile(id as number),
    enabled: id != null,
  });
}

export function useDeleteFile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteFile,
    onSuccess: () => {
      toast.success("File deleted.");
      queryClient.invalidateQueries({ queryKey: filesKeys.all });
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Could not delete the file.")),
  });
}

/**
 * Owns the upload queue: validates each pick with zod, uploads through axios
 * while tracking per-file progress, then refreshes the stored file list.
 */
export function useUploadFiles() {
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<UploadTask[]>([]);
  const controllers = useRef(new Map<string, AbortController>());

  const patch = useCallback((id: string, changes: Partial<UploadTask>) => {
    setTasks((current) =>
      current.map((task) => (task.id === id ? { ...task, ...changes } : task))
    );
  }, []);

  const addFiles = useCallback(
    async (incoming: FileList | File[] | null) => {
      const picked = incoming ? Array.from(incoming) : [];
      if (picked.length === 0) return;

      const created: UploadTask[] = [];
      const accepted: { id: string; file: File }[] = [];

      for (const file of picked) {
        const id = `${file.name}-${file.size}-${crypto.randomUUID()}`;
        const base = {
          id,
          name: file.name,
          size: file.size,
          type: file.type,
          progress: 0,
        };
        const parsed = fileSchema.safeParse(file);

        if (parsed.success) {
          created.push({ ...base, status: "queued" });
          accepted.push({ id, file });
        } else {
          created.push({
            ...base,
            status: "error",
            error: parsed.error.issues[0]?.message ?? "Invalid file.",
          });
        }
      }

      setTasks((current) => [...current, ...created]);

      const results = await Promise.all(
        accepted.map(async ({ id, file }) => {
          const controller = new AbortController();
          controllers.current.set(id, controller);
          patch(id, { status: "uploading" });

          try {
            await uploadFile(file, {
              signal: controller.signal,
              onProgress: (progress) =>
                // 100% only means the bytes left the browser; the server is
                // still storing and indexing the file at that point.
                patch(id, {
                  progress,
                  status: progress >= 100 ? "processing" : "uploading",
                }),
            });
            patch(id, { progress: 100, status: "success" });
            return true;
          } catch (error) {
            patch(id, {
              status: "error",
              error: apiErrorMessage(error, "Upload failed."),
            });
            return false;
          } finally {
            controllers.current.delete(id);
          }
        })
      );

      const uploaded = results.filter(Boolean).length;
      if (uploaded > 0) {
        toast.success(`${uploaded} file${uploaded > 1 ? "s" : ""} uploaded.`);
        queryClient.invalidateQueries({ queryKey: filesKeys.all });
      }
    },
    [patch, queryClient]
  );

  const removeTask = useCallback((id: string) => {
    controllers.current.get(id)?.abort();
    controllers.current.delete(id);
    setTasks((current) => current.filter((task) => task.id !== id));
  }, []);

  const clearTasks = useCallback(() => {
    for (const controller of controllers.current.values()) controller.abort();
    controllers.current.clear();
    setTasks([]);
  }, []);

  const reorderTasks = useCallback((fromId: string, toId: string) => {
    setTasks((current) => {
      const from = current.findIndex((task) => task.id === fromId);
      const to = current.findIndex((task) => task.id === toId);
      if (from === -1 || to === -1) return current;

      const next = [...current];
      next.splice(to, 0, ...next.splice(from, 1));
      return next;
    });
  }, []);

  const isUploading = tasks.some(
    (task) => task.status === "uploading" || task.status === "processing"
  );

  return {
    tasks,
    isUploading,
    addFiles,
    removeTask,
    clearTasks,
    reorderTasks,
  };
}
