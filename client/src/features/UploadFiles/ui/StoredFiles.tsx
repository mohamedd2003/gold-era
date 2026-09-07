"use client";

import {
  CircleAlert,
  Download,
  ExternalLink,
  Inbox,
  Loader2,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeleteFile, useFiles } from "../hooks/useUploadFiles";
import { apiErrorMessage, fileUrl } from "../services/UploadFiles.services";
import type { StoredFile } from "../types/UploadFiles.types";
import { formatDate, formatSize } from "../utils/format";
import { FileTypeIcon } from "./FileTypeIcon";

export function StoredFiles() {
  const { data, isPending, isError, error, isFetching, refetch } = useFiles({
    limit: 20,
  });
  const files = data?.items ?? [];

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Your files{data?.meta ? ` · ${data.meta.total}` : ""}
        </p>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          Refresh
        </button>
      </div>

      {isPending ? (
        <ul className="mt-3 flex flex-col gap-2">
          {[0, 1, 2].map((row) => (
            <li
              key={row}
              className="h-[68px] animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </ul>
      ) : isError ? (
        <ErrorState
          message={apiErrorMessage(error, "Please try again.")}
          onRetry={() => refetch()}
        />
      ) : files.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="mt-3 flex flex-col gap-2">
          {files.map((file) => (
            <StoredRow key={file.id} file={file} />
          ))}
        </ul>
      )}
    </div>
  );
}

function StoredRow({ file }: { file: StoredFile }) {
  const remove = useDeleteFile();
  const isRemoving = remove.isPending;

  return (
    <li
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 shadow-sm transition-colors hover:border-primary/40 sm:px-4",
        isRemoving && "opacity-50"
      )}
    >
      <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
        <FileTypeIcon mimetype={file.mimetype} name={file.originalName} />
      </span>

      <a
        href={fileUrl(file.id)}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1"
      >
        <p className="truncate text-sm font-medium text-foreground underline-offset-4 group-hover:underline">
          {file.originalName}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          {formatSize(file.size)} · {formatDate(file.createdAt)}
        </p>
      </a>

      <div className="flex shrink-0 items-center gap-1">
        <a
          href={fileUrl(file.id)}
          target="_blank"
          rel="noreferrer"
          aria-label={`Open ${file.originalName}`}
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
        >
          <ExternalLink className="size-4" />
        </a>
        <a
          href={fileUrl(file.id, "download")}
          aria-label={`Download ${file.originalName}`}
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
        >
          <Download className="size-4" />
        </a>
        <button
          type="button"
          onClick={() => remove.mutate(file.id)}
          disabled={isRemoving}
          aria-label={`Delete ${file.originalName}`}
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive disabled:opacity-50"
        >
          {isRemoving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="mt-3 flex flex-col items-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-10 text-center">
      <Inbox className="size-6 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium text-foreground">No files yet</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Anything you upload will show up here.
      </p>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="mt-3 flex flex-col items-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <CircleAlert className="size-6 text-destructive" />
      <p className="mt-3 text-sm font-medium text-foreground">
        Could not load your files
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm transition-colors hover:bg-secondary"
      >
        <RefreshCw className="size-3.5" />
        Try again
      </button>
    </div>
  );
}
