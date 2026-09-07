"use client";

import { useState, type ReactNode } from "react";
import type { ApexOptions } from "apexcharts";
import { CircleAlert, HardDrive, RefreshCw, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { formatSize } from "@/features/UploadFiles/utils/format";
import { useUploadHistory, useUserStats } from "../hooks/useAnalytics";
import { statsErrorMessage } from "../services/Analytics.services";
import type { StatsPeriod } from "../types/Analytics.types";
import { STATS_PERIODS } from "../types/Analytics.types";
import {
  baseOptions,
  chartTheme,
  fillHistory,
  formatHistoryLabel,
  groupTypes,
} from "../utils/chart";
import { ApexChart } from "./ApexChart";

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
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((card) => (
            <div
              key={card}
              className="h-[360px] animate-pulse rounded-2xl border border-border bg-card"
            />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          message={statsErrorMessage(error, "Please try again.")}
          onRetry={() => refetch()}
        />
      ) : data ? (
        <Charts stats={data} isDark={isDark} />
      ) : null}
    </section>
  );
}

function Charts({
  stats,
  isDark,
}: {
  stats: NonNullable<ReturnType<typeof useUserStats>["data"]>;
  isDark: boolean;
}) {
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
        <PeriodTimeChart
          title="Total uploaded files"
          kind="bar"
          isDark={isDark}
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

        <PeriodTimeChart
          title="Upload history"
          kind="area"
          isDark={isDark}
        />
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
  const { data, isPending, isError, refetch } = useUploadHistory(period);
  const history = fillHistory(data?.history ?? [], period);
  const labels = history.map((point) => formatHistoryLabel(point.date, period));
  const theme = chartTheme(isDark);
  const hint =
    STATS_PERIODS.find((item) => item.value === period)?.hint ??
    (kind === "bar" ? "Uploads over time" : "Files and storage over time");

  return (
    <ChartCard
      title={title}
      hint={hint}
      action={<PeriodSelect value={period} onChange={setPeriod} />}
    >
      {isPending && !data ? (
        <div className="h-[280px] animate-pulse rounded-2xl bg-secondary/60" />
      ) : isError ? (
        <div className="flex h-[280px] flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
          Could not load this chart.
          <button
            type="button"
            onClick={() => refetch()}
            className="text-xs font-medium text-primary"
          >
            Try again
          </button>
        </div>
      ) : (
        <ApexChart
          key={`${kind}-${period}`}
          type={kind}
          height={280}
          series={
            kind === "bar"
              ? [{ name: "Files", data: history.map((point) => point.count) }]
              : [
                  { name: "Files", data: history.map((point) => point.count) },
                  {
                    name: "Storage (KB)",
                    data: history.map((point) =>
                      Math.round(point.bytes / 1024)
                    ),
                  },
                ]
          }
          options={{
            ...baseOptions(isDark),
            plotOptions: {
              bar: { borderRadius: 6, columnWidth: "55%" },
            },
            fill:
              kind === "area"
                ? {
                    type: "gradient",
                    gradient: { opacityFrom: 0.35, opacityTo: 0.02 },
                  }
                : { type: "solid", opacity: 1 },
            stroke:
              kind === "area"
                ? { curve: "smooth", width: 2 }
                : { show: true, width: 0, curve: "smooth" },
            xaxis: {
              categories: labels,
              labels: { rotate: -45, style: { colors: theme.muted } },
              axisBorder: { show: false },
              axisTicks: { show: false },
            },
            yaxis:
              kind === "bar"
                ? {
                    min: 0,
                    forceNiceScale: true,
                    labels: { style: { colors: theme.muted } },
                  }
                : [
                    {
                      min: 0,
                      forceNiceScale: true,
                      labels: { style: { colors: theme.muted } },
                      title: { text: "Files", style: { color: theme.muted } },
                    },
                    {
                      opposite: true,
                      min: 0,
                      forceNiceScale: true,
                      labels: { style: { colors: theme.muted } },
                      title: { text: "KB", style: { color: theme.muted } },
                    },
                  ],
          }}
        />
      )}
    </ChartCard>
  );
}

function PeriodSelect({
  value,
  onChange,
}: {
  value: StatsPeriod;
  onChange: (period: StatsPeriod) => void;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value as StatsPeriod)}
      aria-label="Time range"
      className="h-8 rounded-lg border border-border bg-background px-2 text-xs text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
    >
      {STATS_PERIODS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}

function donutOptions(
  isDark: boolean,
  labels: string[],
  valueFormatter?: (value: string) => string
): ApexOptions {
  const theme = chartTheme(isDark);
  return {
    ...baseOptions(isDark),
    labels,
    stroke: { width: 0 },
    plotOptions: {
      pie: {
        donut: {
          size: "68%",
          labels: {
            show: true,
            name: { color: theme.muted },
            value: {
              color: theme.text,
              formatter: valueFormatter,
            },
          },
        },
      },
    },
    legend: {
      position: "bottom",
      labels: { colors: theme.muted },
    },
  };
}

function ChartCard({
  title,
  hint,
  action,
  children,
}: {
  title: string;
  hint: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>
        </div>
        {action}
      </div>
      <div className="mt-3">{children}</div>
    </article>
  );
}

function Kpi({
  Icon,
  label,
  value,
}: {
  Icon: typeof Upload;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card px-4 py-4 shadow-sm">
      <span className="inline-flex size-10 items-center justify-center rounded-xl bg-secondary text-primary">
        <Icon className="size-5" />
      </span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-semibold tracking-tight text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-[280px] items-center justify-center text-sm text-muted-foreground">
      Upload files to see this chart.
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
    <div className="mt-8 flex flex-col items-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-10 text-center">
      <CircleAlert className="size-6 text-destructive" />
      <p className="mt-3 text-sm font-medium text-foreground">
        Could not load analytics
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
