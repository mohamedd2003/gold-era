"use client";

import { useEffect } from "react";
import {
  CircleAlert,
  Download,
  ExternalLink,
  Loader2,
  Trash2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeleteFile, useFile } from "../hooks/useUploadFiles";
import { apiErrorMessage, fileUrl } from "../services/UploadFiles.services";
import {
  formatDateTime,
  formatFileType,
  formatSize,
} from "../utils/format";
import { FileTypeIcon } from "./FileTypeIcon";

export function FileDetailsPanel({
  fileId,
  onClose,
}: {
  fileId: number;
  onClose: () => void;
}) {
  const { data: file, isPending, isError, error, refetch } = useFile(fileId);
  const remove = useDeleteFile();
  const isImage = file?.mimetype.startsWith("image/") ?? false;

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-40 flex justify-end">
      <button
        type="button"
        aria-label="Close file details"
        onClick={onClose}
        className="absolute inset-0 bg-foreground/30 backdrop-blur-[2px]"
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="file-details-title"
        className="relative z-10 flex h-full w-full max-w-md flex-col border-l border-border bg-background shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2
            id="file-details-title"
            className="text-sm font-semibold text-foreground"
          >
            File details
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
          {isPending ? (
            <div className="flex h-40 items-center justify-center">
              <Loader2 className="size-6 animate-spin text-primary" />
            </div>
          ) : isError ? (
            <div className="flex flex-col items-center py-10 text-center">
              <CircleAlert className="size-6 text-destructive" />
              <p className="mt-3 text-sm font-medium text-foreground">
                Could not load this file
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {apiErrorMessage(error, "Please try again.")}
              </p>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-4 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium"
              >
                Try again
              </button>
            </div>
          ) : file ? (
            <>
              <div className="flex items-start gap-3">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-secondary text-primary">
                  <FileTypeIcon
                    mimetype={file.mimetype}
                    name={file.originalName}
                    className="size-5"
                  />
                </span>
                <div className="min-w-0">
                  <p className="break-words text-base font-semibold text-foreground">
                    {file.originalName}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatFileType(file.mimetype, file.originalName)}
                  </p>
                </div>
              </div>

              {isImage && (
                <img
                  src={fileUrl(file.id)}
                  alt={file.originalName}
                  className="mt-5 max-h-56 w-full rounded-2xl border border-border bg-secondary/40 object-contain"
                />
              )}

              <dl className="mt-6 space-y-3">
                <MetaRow label="File type" value={file.mimetype || "Unknown"} />
                <MetaRow label="File size" value={formatSize(file.size)} />
                <MetaRow
                  label="Upload date"
                  value={formatDateTime(file.createdAt)}
                />
                <MetaRow
                  label="Last updated"
                  value={formatDateTime(file.updatedAt)}
                />
                <MetaRow label="Stored as" value={file.filename} />
                <MetaRow label="File ID" value={String(file.id)} />
              </dl>

              <div className="mt-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  Extracted content
                </p>
                {file.extractedContent ? (
                  <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-2xl border border-border bg-secondary/40 p-3 text-xs leading-relaxed text-foreground">
                    {file.extractedContent}
                  </pre>
                ) : (
                  <p className="mt-2 rounded-2xl border border-dashed border-border bg-secondary/20 px-3 py-4 text-xs text-muted-foreground">
                    No text could be extracted from this file.
                  </p>
                )}
              </div>
            </>
          ) : null}
        </div>

        {file && (
          <div className="flex gap-2 border-t border-border px-5 py-4">
            <a
              href={fileUrl(file.id)}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <ExternalLink className="size-3.5" />
              Open
            </a>
            <a
              href={fileUrl(file.id, "download")}
              className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary px-3 py-2 text-xs font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Download className="size-3.5" />
              Download
            </a>
            <button
              type="button"
              disabled={remove.isPending}
              onClick={() =>
                remove.mutate(file.id, { onSuccess: onClose })
              }
              className="inline-flex items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10 disabled:opacity-50"
            >
              {remove.isPending ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : (
                <Trash2 className="size-3.5" />
              )}
              Delete
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className={cn("grid grid-cols-[7.5rem_1fr] gap-3 text-sm")}>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="min-w-0 break-all font-medium text-foreground">{value}</dd>
    </div>
  );
}
