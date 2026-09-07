"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Download,
  ExternalLink,
  Inbox,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "@/features/UploadFiles/hooks/useDebouncedValue";
import { useDeleteFile, useFiles } from "@/features/UploadFiles/hooks/useUploadFiles";
import {
  apiErrorMessage,
  fileUrl,
} from "@/features/UploadFiles/services/UploadFiles.services";
import type { StoredFile } from "@/features/UploadFiles/types/UploadFiles.types";
import type { ListFilesParams } from "@/features/UploadFiles/validation/UploadFiles.validation";
import {
  formatDateTime,
  formatFileType,
  formatSize,
} from "@/features/UploadFiles/utils/format";
import { FileTypeIcon } from "@/features/UploadFiles/ui/FileTypeIcon";
import { FileDetailsPanel } from "@/features/UploadFiles/ui/FileDetailsPanel";
import { SORT_OPTIONS, TYPE_FILTERS } from "@/features/UploadFiles/utils/folders";
import { adminKeys } from "../hooks/useAdmin";
import { ConfirmDialog } from "./ConfirmDialog";

const PAGE_SIZE = 12;

/**
 * Admin file browser. The same `/files` endpoint powers the user dashboard —
 * the server widens the result set to every account when the caller is an
 * admin, so no separate API is needed here.
 */
export function AdminFiles() {
  const queryClient = useQueryClient();
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 350);
  const [type, setType] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [paging, setPaging] = useState({ key: "||createdAt:desc", page: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [pendingDelete, setPendingDelete] = useState<StoredFile | null>(null);

  const [sortBy, order] = sort.split(":") as [
    NonNullable<ListFilesParams["sortBy"]>,
    NonNullable<ListFilesParams["order"]>,
  ];
  const filterKey = `${search}|${type}|${sort}`;
  const page = paging.key === filterKey ? paging.page : 1;

  const listQuery = useFiles({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    type: type || undefined,
    sortBy,
    order,
  });
  const removeFile = useDeleteFile();

  const files = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;
  const total = meta?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const isLoading =
    listQuery.isPending ||
    searchInput.trim() !== search ||
    listQuery.isPlaceholderData;

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Files management
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Every file uploaded to Gold Cloud, across all accounts.
          </p>
        </div>
        <button
          type="button"
          onClick={() => listQuery.refetch()}
          disabled={listQuery.isFetching}
          className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw
            className={cn("size-3.5", listQuery.isFetching && "animate-spin")}
          />
          Refresh
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search all files…"
            className="h-10 w-full rounded-xl border border-border bg-card pr-3 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </label>
        <select
          value={type}
          onChange={(event) => setType(event.target.value)}
          aria-label="Filter by type"
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:w-40"
        >
          {TYPE_FILTERS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Sort files"
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:w-40"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : listQuery.isError ? (
        <ErrorState
          message={apiErrorMessage(listQuery.error, "Please try again.")}
          onRetry={() => listQuery.refetch()}
        />
      ) : files.length === 0 ? (
        <EmptyState hasQuery={Boolean(search || type)} />
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[46rem] text-left text-sm">
              <thead className="border-b border-border bg-secondary/50">
                <tr className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Size</th>
                  <th className="px-4 py-3">Uploaded</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {files.map((file) => (
                  <FileRow
                    key={file.id}
                    file={file}
                    onOpenDetails={() => setSelectedId(file.id)}
                    onDelete={() => setPendingDelete(file)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && meta && total > 0 && (
        <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing {from}–{to} of {total} files
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!meta.hasPrev}
              onClick={() =>
                setPaging({ key: filterKey, page: Math.max(1, page - 1) })
              }
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </button>
            <span className="text-xs text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              type="button"
              disabled={!meta.hasNext}
              onClick={() => setPaging({ key: filterKey, page: page + 1 })}
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {selectedId != null && (
        <FileDetailsPanel
          fileId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}

      {pendingDelete && (
        <ConfirmDialog
          title="Delete this file?"
          description={`“${pendingDelete.originalName}” will be permanently removed from ${
            pendingDelete.owner?.name ?? "its owner"
          }'s account.`}
          confirmLabel="Delete file"
          isPending={removeFile.isPending}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() =>
            removeFile.mutate(pendingDelete.id, {
              onSuccess: () => {
                setPendingDelete(null);
                // The overview counters and storage totals just changed.
                queryClient.invalidateQueries({ queryKey: adminKeys.all });
              },
            })
          }
        />
      )}
    </section>
  );
}

function FileRow({
  file,
  onOpenDetails,
  onDelete,
}: {
  file: StoredFile;
  onOpenDetails: () => void;
  onDelete: () => void;
}) {
  return (
    <tr className="transition-colors hover:bg-secondary/40">
      <td className="px-4 py-3">
        <button
          type="button"
          onClick={onOpenDetails}
          className="flex w-full items-center gap-3 text-left"
        >
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
            <FileTypeIcon
              mimetype={file.mimetype}
              name={file.originalName}
              className="size-4"
            />
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {file.originalName}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {formatFileType(file.mimetype, file.originalName)}
            </p>
          </div>
        </button>
      </td>

      <td className="px-4 py-3">
        {file.owner ? (
          <div className="min-w-0">
            <p className="truncate text-sm text-foreground">
              {file.owner.name}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {file.owner.email}
            </p>
          </div>
        ) : (
          <span className="text-xs text-muted-foreground">
            User #{file.userId}
          </span>
        )}
      </td>

      <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">
        {formatSize(file.size)}
      </td>

      <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">
        {formatDateTime(file.createdAt)}
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center justify-end gap-1">
          <a
            href={fileUrl(file.id)}
            target="_blank"
            rel="noreferrer"
            aria-label={`Open ${file.originalName} in a new tab`}
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
            onClick={onDelete}
            aria-label={`Delete ${file.originalName}`}
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="h-11 animate-pulse border-b border-border bg-secondary/50" />
      <div className="divide-y divide-border/70">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3.5">
            <div className="size-9 shrink-0 animate-pulse rounded-xl bg-secondary" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-48 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-28 animate-pulse rounded bg-secondary/80" />
            </div>
            <div className="hidden flex-1 space-y-2 sm:block">
              <div className="h-3.5 w-32 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-44 animate-pulse rounded bg-secondary/80" />
            </div>
            <div className="h-3 w-14 animate-pulse rounded bg-secondary/80" />
            <div className="flex gap-1">
              <div className="size-8 animate-pulse rounded-lg bg-secondary/80" />
              <div className="size-8 animate-pulse rounded-lg bg-secondary/80" />
              <div className="size-8 animate-pulse rounded-lg bg-secondary/80" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-12 text-center">
      <Inbox className="size-6 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium text-foreground">
        {hasQuery ? "No files match these filters" : "No files yet"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {hasQuery
          ? "Try a different name or type."
          : "Files uploaded by any user will show up here."}
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
    <div className="mt-5 flex flex-col items-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <CircleAlert className="size-6 text-destructive" />
      <p className="mt-3 text-sm font-medium text-foreground">
        Could not load files
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
