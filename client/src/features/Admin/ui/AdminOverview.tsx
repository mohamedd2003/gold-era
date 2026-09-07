"use client";

import Link from "next/link";
import {
  ArrowRight,
  ExternalLink,
  Files,
  HardDrive,
  Inbox,
  RefreshCw,
  Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { apiErrorMessage, fileUrl } from "@/features/UploadFiles/services/UploadFiles.services";
import { formatDateTime, formatSize } from "@/features/UploadFiles/utils/format";
import { FileTypeIcon } from "@/features/UploadFiles/ui/FileTypeIcon";
import { groupTypes, typeLabel } from "@/features/Analytics/utils/chart";
import { ChartsErrorState } from "@/features/Analytics/ui/chart-parts";
import { useAdminStats } from "../hooks/useAdmin";
import type { AdminStats, RecentUpload } from "../types/Admin.types";

export function AdminOverview({ name }: { name: string }) {
  const { data, isPending, isError, error, isFetching, refetch } =
    useAdminStats();

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
            Administrator
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Welcome back, {name}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            A system-wide view of every account and file in Gold Cloud.
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw className={cn("size-3.5", isFetching && "animate-spin")} />
          Refresh
        </button>
      </div>

      {isPending ? (
        <OverviewSkeleton />
      ) : isError ? (
        <ChartsErrorState
          title="Could not load the admin dashboard"
          message={apiErrorMessage(error, "Please try again.")}
          onRetry={() => refetch()}
        />
      ) : data ? (
        <Content stats={data} />
      ) : null}
    </section>
  );
}

function Content({ stats }: { stats: AdminStats }) {
  return (
    <>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <StatCard
          Icon={Users}
          label="Total users"
          value={stats.totalUsers.toLocaleString()}
          href="/dashboard/users"
          action="Manage users"
        />
        <StatCard
          Icon={Files}
          label="Total files"
          value={stats.totalFiles.toLocaleString()}
          href="/dashboard/files"
          action="Manage files"
        />
        <StatCard
          Icon={HardDrive}
          label="Storage usage"
          value={formatSize(stats.storageUsageBytes)}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <TopFileTypes stats={stats} />
        <RecentUploads uploads={stats.recentUploads} />
      </div>
    </>
  );
}

function StatCard({
  Icon,
  label,
  value,
  href,
  action,
}: {
  Icon: typeof Users;
  label: string;
  value: string;
  href?: string;
  action?: string;
}) {
  return (
    <article className="flex flex-col justify-between rounded-2xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
          <Icon className="size-5" />
        </span>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
      {href && action && (
        <Link
          href={href}
          className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline"
        >
          {action}
          <ArrowRight className="size-3.5" />
        </Link>
      )}
    </article>
  );
}

function TopFileTypes({ stats }: { stats: AdminStats }) {
  const types = groupTypes(stats.topFileTypes).slice(0, 5);
  const max = types[0]?.count ?? 0;

  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <h2 className="text-sm font-semibold text-foreground">
        Most uploaded file types
      </h2>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Across every account
      </p>

      {types.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">
          No files have been uploaded yet.
        </p>
      ) : (
        <ul className="mt-5 space-y-4">
          {types.map((type) => (
            <li key={type.mimetype}>
              <div className="flex items-baseline justify-between gap-3 text-sm">
                <span className="truncate font-medium text-foreground">
                  {typeLabel(type.mimetype)}
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {type.count} · {formatSize(type.bytes)}
                </span>
              </div>
              <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full bg-primary transition-[width] duration-500"
                  style={{
                    width: `${max === 0 ? 0 : Math.max(4, (type.count / max) * 100)}%`,
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function RecentUploads({ uploads }: { uploads: RecentUpload[] }) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">
            Recent uploads
          </h2>
          <p className="mt-0.5 text-xs text-muted-foreground">
            The latest files from any user
          </p>
        </div>
        <Link
          href="/dashboard/files"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-primary transition-colors hover:underline"
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {uploads.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-border bg-secondary/30 px-6 py-8 text-center">
          <Inbox className="size-5 text-muted-foreground" />
          <p className="mt-2 text-sm text-muted-foreground">No uploads yet.</p>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border/70">
          {uploads.map((upload) => (
            <li key={upload.id} className="flex items-center gap-3 py-2.5">
              <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-secondary text-primary">
                <FileTypeIcon
                  mimetype={upload.mimetype}
                  name={upload.originalName}
                  className="size-4"
                />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                  {upload.originalName}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {upload.user.name} · {formatSize(upload.size)} ·{" "}
                  {formatDateTime(upload.createdAt)}
                </p>
              </div>
              <a
                href={fileUrl(upload.id)}
                target="_blank"
                rel="noreferrer"
                aria-label={`Open ${upload.originalName} in a new tab`}
                className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-secondary hover:text-primary"
              >
                <ExternalLink className="size-4" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}

function OverviewSkeleton() {
  return (
    <>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((card) => (
          <div
            key={card}
            className="h-[132px] animate-pulse rounded-2xl border border-border bg-card"
          />
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <div className="h-[320px] animate-pulse rounded-2xl border border-border bg-card" />
        <div className="h-[320px] animate-pulse rounded-2xl border border-border bg-card" />
      </div>
    </>
  );
}
