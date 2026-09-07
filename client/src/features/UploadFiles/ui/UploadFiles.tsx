"use client";

import { useId, useState } from "react";
import { DragDropProvider, type DragEndEvent } from "@dnd-kit/react";
import { useSortable } from "@dnd-kit/react/sortable";
import {
  CircleAlert,
  CircleCheck,
  CloudUpload,
  GripVertical,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUploadFiles } from "../hooks/useUploadFiles";
import type { UploadTask } from "../types/UploadFiles.types";
import { MAX_FILE_SIZE_MB } from "../validation/UploadFiles.validation";
import { formatSize } from "../utils/format";
import { FileTypeIcon } from "./FileTypeIcon";
import { StoredFiles } from "./StoredFiles";

export function UploadFiles() {
  const inputId = useId();
  const [isOver, setIsOver] = useState(false);
  const { tasks, isUploading, addFiles, removeTask, clearTasks, reorderTasks } =
    useUploadFiles();

  function handleDrop(event: React.DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setIsOver(false);
    addFiles(event.dataTransfer.files);
  }

  function handleReorder({ operation, canceled }: DragEndEvent) {
    const { source, target } = operation;
    if (canceled || !source || !target || source.id === target.id) return;
    reorderTasks(String(source.id), String(target.id));
  }

  return (
    <section className="mx-auto w-full max-w-5xl">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        Upload files
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Add files to your Gold Cloud workspace.
      </p>

      <div
        onDragOver={(event) => {
          event.preventDefault();
          setIsOver(true);
        }}
        onDragLeave={(event) => {
          if (event.currentTarget.contains(event.relatedTarget as Node)) return;
          setIsOver(false);
        }}
        onDrop={handleDrop}
        className={cn(
          "group relative mt-8 overflow-hidden rounded-3xl border-2 border-dashed border-border bg-secondary/40 transition-colors duration-300",
          isOver && "border-primary bg-primary/5"
        )}
      >
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -top-24 left-1/2 size-64 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl transition-opacity duration-500",
            isOver ? "opacity-100" : "opacity-0"
          )}
        />

        <label
          htmlFor={inputId}
          className="relative flex cursor-pointer flex-col items-center px-6 py-14 text-center sm:py-16"
        >
          <span
            className={cn(
              "inline-flex size-16 items-center justify-center rounded-2xl bg-card text-primary shadow-sm transition-transform duration-300",
              isOver ? "scale-110" : "group-hover:scale-105"
            )}
          >
            {isUploading ? (
              <Loader2 className="size-7 animate-spin" />
            ) : (
              <CloudUpload className="size-7" />
            )}
          </span>

          <span className="mt-6 text-base font-semibold text-foreground sm:text-lg">
            Drag &amp; drop your files here
          </span>
          <span className="mt-1.5 text-sm text-muted-foreground">
            or{" "}
            <span className="font-medium text-primary underline-offset-4 group-hover:underline">
              click to upload
            </span>
          </span>
          <span className="mt-5 text-xs text-muted-foreground/80">
            Documents, images, audio and video · up to {MAX_FILE_SIZE_MB} MB per
            file
          </span>
        </label>

        <input
          id={inputId}
          type="file"
          multiple
          className="sr-only"
          onChange={(event) => {
            addFiles(event.target.files);
            event.target.value = "";
          }}
        />
      </div>

      {tasks.length > 0 && (
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              This upload · {tasks.length}
            </p>
            <button
              type="button"
              onClick={clearTasks}
              className="text-xs font-medium text-muted-foreground transition-colors hover:text-destructive"
            >
              Clear all
            </button>
          </div>

          <DragDropProvider onDragEnd={handleReorder}>
            <ul className="mt-3 flex flex-col gap-2">
              {tasks.map((task, index) => (
                <UploadRow
                  key={task.id}
                  task={task}
                  index={index}
                  onRemove={() => removeTask(task.id)}
                />
              ))}
            </ul>
          </DragDropProvider>
        </div>
      )}

      <StoredFiles />
    </section>
  );
}

function UploadRow({
  task,
  index,
  onRemove,
}: {
  task: UploadTask;
  index: number;
  onRemove: () => void;
}) {
  const { ref, handleRef, isDragging } = useSortable({ id: task.id, index });
  const isDone = task.status === "success";
  const isFailed = task.status === "error";

  return (
    <li
      ref={ref}
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border bg-card px-3 py-3 shadow-sm transition-shadow sm:px-4",
        isDragging && "shadow-lg ring-2 ring-primary/40"
      )}
    >
      <button
        ref={handleRef}
        type="button"
        aria-label={`Reorder ${task.name}`}
        className="cursor-grab text-muted-foreground/70 transition-colors hover:text-foreground active:cursor-grabbing"
      >
        <GripVertical className="size-4" />
      </button>

      <span
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary",
          isFailed && "text-destructive"
        )}
      >
        <FileTypeIcon mimetype={task.type} name={task.name} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {task.name}
          </p>
          {isDone && (
            <CircleCheck className="size-4 shrink-0 text-primary" />
          )}
          {isFailed && (
            <CircleAlert className="size-4 shrink-0 text-destructive" />
          )}
        </div>

        <div className="mt-1 flex items-center gap-2 text-xs">
          <span className="text-muted-foreground">
            {formatSize(task.size)}
          </span>
          <span
            className={cn(
              "truncate",
              isFailed ? "text-destructive" : "text-muted-foreground"
            )}
          >
            · {statusLabel(task)}
          </span>
        </div>

        {!isDone && !isFailed && (
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-200"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onRemove}
        aria-label={
          task.status === "uploading"
            ? `Cancel ${task.name}`
            : `Remove ${task.name}`
        }
        className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-destructive"
      >
        <X className="size-4" />
      </button>
    </li>
  );
}

function statusLabel(task: UploadTask): string {
  switch (task.status) {
    case "queued":
      return "Waiting";
    case "uploading":
      return `Uploading ${task.progress}%`;
    case "processing":
      return "Processing on the server";
    case "success":
      return "Uploaded";
    case "error":
      return task.error ?? "Upload failed";
  }
}
