"use client";

import { useState } from "react";
import { HardDrive, RefreshCw, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { formatSize } from "@/features/UploadFiles/utils/format";
import { useUploadHistory, useUserStats } from "../hooks/useAnalytics";
import { statsErrorMessage } from "../services/Analytics.services";
import type { StatsPeriod, UserStats } from "../types/Analytics.types";
import { groupTypes } from "../utils/chart";
import { ApexChart } from "./ApexChart";
import {
  ChartCard,
  ChartsErrorState,
  ChartsSkeleton,
  donutOptions,
  EmptyChart,
  Kpi,
  TimeSeriesChart,
} from "./chart-parts";

export function AnalyticsDashboard() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const { data, isPending, isError, error, isFetching, refetch } =
    useUserStats();

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Analytics
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            How your Gold Cloud workspace has been used.
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
          message={statsErrorMessage(error, "Please try again.")}
          onRetry={() => refetch()}
        />
      ) : data ? (
        <Charts stats={data} isDark={isDark} />
      ) : null}
    </section>
  );
}

function Charts({ stats, isDark }: { stats: UserStats; isDark: boolean }) {
  const [period, setPeriod] = useState<StatsPeriod>("daily");
  const historyQuery = useUploadHistory(period);
  const types = groupTypes(stats.fileTypes);
  const emptyTypes = types.length === 0;

  return (
    <>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        <Kpi
          Icon={Upload}
          label="Total uploaded files"
          value={String(stats.totalFiles)}
        />
        <Kpi
          Icon={HardDrive}
          label="Storage usage"
          value={formatSize(stats.storageUsageBytes)}
        />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TimeSeriesChart
          title="Total uploaded files"
          kind="bar"
          isDark={isDark}
          period={period}
          onPeriodChange={setPeriod}
          points={historyQuery.data?.history}
          isPending={historyQuery.isPending}
          isError={historyQuery.isError}
          onRetry={() => historyQuery.refetch()}
        />

        <ChartCard title="Storage usage" hint="Space used by file type">
          {emptyTypes ? (
            <EmptyChart />
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

        <ChartCard title="File types" hint="Count of files by type">
          {emptyTypes ? (
            <EmptyChart />
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

        <TimeSeriesChart
          title="Upload history"
          kind="area"
          isDark={isDark}
          period={period}
          onPeriodChange={setPeriod}
          points={historyQuery.data?.history}
          isPending={historyQuery.isPending}
          isError={historyQuery.isError}
          onRetry={() => historyQuery.refetch()}
        />
      </div>
    </>
  );
}
