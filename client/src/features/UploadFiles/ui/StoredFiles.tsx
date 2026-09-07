"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Download,
  ExternalLink,
  Inbox,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import { useDeleteFile, useFiles } from "../hooks/useUploadFiles";
import { apiErrorMessage, fileUrl } from "../services/UploadFiles.services";
import type { StoredFile } from "../types/UploadFiles.types";
import type { ListFilesParams } from "../validation/UploadFiles.validation";
import { formatDate, formatFileType, formatSize } from "../utils/format";
import { SORT_OPTIONS, TYPE_FILTERS } from "../utils/folders";
import { FileDetailsPanel } from "./FileDetailsPanel";
import { FileTypeIcon } from "./FileTypeIcon";

const PAGE_SIZE = 12;

export function StoredFiles() {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 350);
  const [type, setType] = useState("");
  const [sort, setSort] = useState("createdAt:desc");
  const [paging, setPaging] = useState({ key: "|createdAt:desc", page: 1 });
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const [sortBy, order] = sort.split(":") as [
    NonNullable<ListFilesParams["sortBy"]>,
    NonNullable<ListFilesParams["order"]>,
  ];
  const filterKey = `${search}|${type}|${sort}`;
  const page = paging.key === filterKey ? paging.page : 1;

  function goToPage(next: number) {
    setPaging({ key: filterKey, page: Math.max(1, next) });
  }

  const listQuery = useFiles({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    type: type || undefined,
    sortBy,
    order,
  });

  const files = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;
  const total = meta?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const isSearching =
    listQuery.isPending ||
    searchInput.trim() !== search ||
    listQuery.isPlaceholderData;

  return (
    <div className="mt-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-semibold text-muted-foreground">
          My Files
        </h2>
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

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search files…"
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

      {isSearching ? (
        <FileGridSkeleton />
      ) : listQuery.isError ? (
        <ErrorState
          message={apiErrorMessage(listQuery.error, "Please try again.")}
          onRetry={() => listQuery.refetch()}
        />
      ) : files.length === 0 ? (
        <EmptyState hasQuery={Boolean(search || type)} />
      ) : (
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {files.map((file) => (
            <FileTile
              key={file.id}
              file={file}
              onOpen={() => setSelectedId(file.id)}
            />
          ))}
        </ul>
      )}

      {!isSearching && meta && total > 0 && (
        <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing {from}–{to} of {total}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!meta.hasPrev}
              onClick={() => goToPage(page - 1)}
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
              onClick={() => goToPage(page + 1)}
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
    </div>
  );
}

function FileTile({
  file,
  onOpen,
}: {
  file: StoredFile;
  onOpen: () => void;
}) {
  const remove = useDeleteFile();
  const isRemoving = remove.isPending;
  const kind = previewKind(file.mimetype);

  return (
    <li
      className={cn(
        "group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-colors hover:border-primary/40",
        isRemoving && "opacity-50"
      )}
    >
      <button
        type="button"
        onClick={onOpen}
        className="block w-full text-left"
      >
        <div className="relative aspect-4/3 overflow-hidden bg-secondary/60">
          {kind === "image" ? (
            <img
              src={fileUrl(file.id)}
              alt={file.originalName}
              className="size-full object-cover"
            />
          ) : kind === "video" ? (
            <video
              src={fileUrl(file.id)}
              muted
              preload="metadata"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex size-full items-center justify-center text-primary">
              <FileTypeIcon
                mimetype={file.mimetype}
                name={file.originalName}
                className="size-10"
              />
            </div>
          )}
        </div>

        <div className="px-3 py-2.5">
          <p className="truncate text-sm font-medium text-foreground">
            {file.originalName}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {formatFileType(file.mimetype, file.originalName)} ·{" "}
            {formatSize(file.size)}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            {formatDate(file.createdAt)}
          </p>
        </div>
      </button>

      <div className="flex items-center justify-end gap-1 border-t border-border/70 px-2 py-1.5">
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

function FileGridSkeleton() {
  return (
    <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <li
          key={index}
          className="overflow-hidden rounded-2xl border border-border bg-card"
        >
          <div className="aspect-4/3 animate-pulse bg-secondary" />
          <div className="space-y-2 px-3 py-2.5">
            <div className="h-4 w-4/5 animate-pulse rounded bg-secondary" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-secondary/80" />
            <div className="h-3 w-2/5 animate-pulse rounded bg-secondary/80" />
          </div>
          <div className="flex items-center justify-end gap-1 border-t border-border/70 px-2 py-1.5">
            <div className="size-8 animate-pulse rounded-lg bg-secondary/80" />
            <div className="size-8 animate-pulse rounded-lg bg-secondary/80" />
            <div className="size-8 animate-pulse rounded-lg bg-secondary/80" />
          </div>
        </li>
      ))}
    </ul>
  );
}

function previewKind(mimetype: string) {
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.startsWith("video/")) return "video";
  return "file";
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-10 text-center">
      <Inbox className="size-6 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium text-foreground">
        {hasQuery ? "No files match your search" : "No files yet"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {hasQuery
          ? "Try a different name or type."
          : "Anything you upload will show up here."}
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
    <div className="mt-5 flex flex-col items-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
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
