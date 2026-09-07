"use client";

import { useState } from "react";
import { Files, HardDrive, RefreshCw, Users } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { apiErrorMessage } from "@/features/UploadFiles/services/UploadFiles.services";
import { formatSize } from "@/features/UploadFiles/utils/format";
import type { StatsPeriod } from "@/features/Analytics/types/Analytics.types";
import { groupTypes } from "@/features/Analytics/utils/chart";
import { ApexChart } from "@/features/Analytics/ui/ApexChart";
import {
  ChartCard,
  ChartsErrorState,
  ChartsSkeleton,
  donutOptions,
  EmptyChart,
  Kpi,
  TimeSeriesChart,
} from "@/features/Analytics/ui/chart-parts";
import { useAdminHistory, useAdminStats } from "../hooks/useAdmin";
import type { AdminStats } from "../types/Admin.types";

/** System-wide analytics. Same layout as the user view, sourced from /stats/admin. */
export function AdminAnalytics() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { data, isPending, isError, error, isFetching, refetch } =
    useAdminStats();

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">
            Administrator
          </span>
          <h1 className="mt-3 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Analytics
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            How Gold Cloud is being used across every account.
          </p>
        </div>
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
        <ChartsSkeleton />
      ) : isError ? (
        <ChartsErrorState
          title="Could not load analytics"
          message={apiErrorMessage(error, "Please try again.")}
          onRetry={() => refetch()}
        />
      ) : data ? (
        <Charts stats={data} isDark={isDark} />
      ) : null}
    </section>
  );
}

function Charts({ stats, isDark }: { stats: AdminStats; isDark: boolean }) {
  const types = groupTypes(stats.topFileTypes);
  const emptyTypes = types.length === 0;

  return (
    <>
      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        <Kpi
          Icon={Users}
          label="Total users"
          value={stats.totalUsers.toLocaleString()}
        />
        <Kpi
          Icon={Files}
          label="Total files"
          value={stats.totalFiles.toLocaleString()}
        />
        <Kpi
          Icon={HardDrive}
          label="Storage usage"
          value={formatSize(stats.storageUsageBytes)}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <PeriodTimeChart title="Total uploaded files" kind="bar" isDark={isDark} />

        <ChartCard title="Storage usage" hint="Space used by file type">
          {emptyTypes ? (
            <EmptyChart message="No files have been uploaded yet." />
          ) : (
            <ApexChart
              type="donut"
              height={280}
              series={types.map((item) => item.bytes)}
              options={donutOptions(
                isDark,
                types.map((item) => item.mimetype),
                (value) => formatSize(Number(value))
              )}
            />
          )}
        </ChartCard>

        <ChartCard
          title="Most uploaded file types"
          hint="Count of files by type"
        >
          {emptyTypes ? (
            <EmptyChart message="No files have been uploaded yet." />
          ) : (
            <ApexChart
              type="donut"
              height={280}
              series={types.map((item) => item.count)}
              options={donutOptions(
                isDark,
                types.map((item) => item.mimetype)
              )}
            />
          )}
        </ChartCard>

        <PeriodTimeChart title="Upload history" kind="area" isDark={isDark} />
      </div>
    </>
  );
}

function PeriodTimeChart({
  title,
  kind,
  isDark,
}: {
  title: string;
  kind: "bar" | "area";
  isDark: boolean;
}) {
  const [period, setPeriod] = useState<StatsPeriod>("daily");
  const { data, isPending, isError, refetch } = useAdminHistory(period);

  return (
    <TimeSeriesChart
      title={title}
      kind={kind}
      isDark={isDark}
      period={period}
      onPeriodChange={setPeriod}
      points={data?.history}
      isPending={isPending}
      isError={isError}
      onRetry={() => refetch()}
    />
  );
}
