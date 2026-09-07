import type { ApexOptions } from "apexcharts";
import type {
  FileTypeStat,
  HistoryPoint,
  StatsPeriod,
} from "../types/Analytics.types";

export const CHART_COLORS = [
  "#4f7cff",
  "#7c9cff",
  "#22c55e",
  "#f59e0b",
  "#ef4444",
  "#a78bfa",
  "#14b8a6",
  "#f472b6",
];

export function chartTheme(isDark: boolean) {
  return {
    isDark,
    text: isDark ? "#e8eef8" : "#1e293b",
    muted: isDark ? "#94a3b8" : "#64748b",
    grid: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
    primary: isDark ? "#7aa2ff" : "#3b6cf5",
  };
}

export function typeLabel(mimetype: string): string {
  if (!mimetype) return "Unknown";
  const [kind, subtype = ""] = mimetype.split("/");
  if (kind === "image") return "Images";
  if (kind === "video") return "Videos";
  if (kind === "audio") return "Audio";
  if (subtype === "pdf") return "PDF";
  if (kind === "text") return "Text";
  if (subtype.includes("zip") || subtype.includes("compressed")) return "Archives";
  return subtype.replace("vnd.", "").slice(0, 18) || kind;
}

/** Merge raw mimetypes into a few readable buckets. */
export function groupTypes(types: FileTypeStat[]): FileTypeStat[] {
  const buckets = new Map<string, FileTypeStat>();
  for (const item of types) {
    const label = typeLabel(item.mimetype);
    const current = buckets.get(label);
    if (current) {
      current.count += item.count;
      current.bytes += item.bytes;
    } else {
      buckets.set(label, { mimetype: label, count: item.count, bytes: item.bytes });
    }
  }
  return [...buckets.values()].sort((a, b) => b.count - a.count);
}

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function pad(value: number) {
  return String(value).padStart(2, "0");
}

function historyKey(date: Date, period: StatsPeriod): string {
  const year = date.getUTCFullYear();
  const month = pad(date.getUTCMonth() + 1);
  const day = pad(date.getUTCDate());
  const hour = pad(date.getUTCHours());
  if (period === "hourly") return `${year}-${month}-${day} ${hour}:00`;
  if (period === "monthly") return `${year}-${month}`;
  if (period === "yearly") return String(year);
  return `${year}-${month}-${day}`;
}

/** Server DATE_FORMAT keys are UTC; accept a few wire formats. */
export function normalizeHistoryKey(raw: string, period: StatsPeriod): string {
  const value = raw.trim();
  if (period === "hourly") {
    const match = value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2})/);
    if (match) return `${match[1]} ${match[2]}:00`;
  }
  if (period === "monthly") {
    const match = value.match(/^(\d{4}-\d{2})/);
    if (match) return match[1];
  }
  if (period === "yearly") {
    const match = value.match(/^(\d{4})/);
    if (match) return match[1];
  }
  const match = value.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : value;
}

function parseHistoryDate(value: string, period: StatsPeriod): Date {
  const key = normalizeHistoryKey(value, period);
  if (period === "hourly") {
    const [datePart, timePart = "00:00"] = key.split(" ");
    const [year, month, day] = datePart.split("-").map(Number);
    const [hour] = timePart.split(":").map(Number);
    return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1, hour ?? 0));
  }
  if (period === "monthly") {
    const [year, month] = key.split("-").map(Number);
    return new Date(Date.UTC(year, (month ?? 1) - 1, 1));
  }
  if (period === "yearly") {
    return new Date(Date.UTC(Number(key), 0, 1));
  }
  const [year, month, day] = key.split("-").map(Number);
  return new Date(Date.UTC(year, (month ?? 1) - 1, day ?? 1));
}

/** Fill empty UTC buckets so the selected period is a continuous series. */
export function fillHistory(
  history: HistoryPoint[],
  period: StatsPeriod
): HistoryPoint[] {
  const byKey = new Map(
    history.map((point) => [normalizeHistoryKey(point.date, period), point])
  );
  const points: HistoryPoint[] = [];
  const cursor = new Date();

  if (period === "hourly") {
    cursor.setUTCMinutes(0, 0, 0);
    for (let offset = 6; offset >= 0; offset -= 1) {
      const date = new Date(cursor);
      date.setUTCHours(cursor.getUTCHours() - offset);
      const key = historyKey(date, period);
      points.push(byKey.get(key) ?? { date: key, count: 0, bytes: 0 });
    }
    return points;
  }

  if (period === "monthly") {
    cursor.setUTCDate(1);
    cursor.setUTCHours(0, 0, 0, 0);
    for (let offset = 11; offset >= 0; offset -= 1) {
      const date = new Date(cursor);
      date.setUTCMonth(cursor.getUTCMonth() - offset);
      const key = historyKey(date, period);
      points.push(byKey.get(key) ?? { date: key, count: 0, bytes: 0 });
    }
    return points;
  }

  if (period === "yearly") {
    cursor.setUTCMonth(0, 1);
    cursor.setUTCHours(0, 0, 0, 0);
    for (let offset = 4; offset >= 0; offset -= 1) {
      const date = new Date(cursor);
      date.setUTCFullYear(cursor.getUTCFullYear() - offset);
      const key = historyKey(date, period);
      points.push(byKey.get(key) ?? { date: key, count: 0, bytes: 0 });
    }
    return points;
  }

  cursor.setUTCHours(0, 0, 0, 0);
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(cursor);
    date.setUTCDate(cursor.getUTCDate() - offset);
    const key = historyKey(date, "daily");
    points.push(byKey.get(key) ?? { date: key, count: 0, bytes: 0 });
  }
  return points;
}

export function formatHistoryLabel(value: string, period: StatsPeriod): string {
  const date = parseHistoryDate(value, period);
  if (period === "hourly") {
    const hour = date.getHours();
    const suffix = hour >= 12 ? "PM" : "AM";
    const hour12 = hour % 12 || 12;
    return `${hour12} ${suffix}`;
  }
  if (period === "monthly") {
    return `${MONTHS[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  }
  if (period === "yearly") return String(date.getUTCFullYear());
  return `${MONTHS[date.getUTCMonth()]} ${date.getUTCDate()}`;
}

export function baseOptions(isDark: boolean): ApexOptions {
  const theme = chartTheme(isDark);
  return {
    chart: {
      toolbar: { show: false },
      fontFamily: "inherit",
      background: "transparent",
      foreColor: theme.muted,
    },
    colors: CHART_COLORS,
    grid: { borderColor: theme.grid, strokeDashArray: 4 },
    legend: { labels: { colors: theme.muted } },
    dataLabels: { enabled: false },
    tooltip: { theme: isDark ? "dark" : "light" },
    stroke: { curve: "smooth" },
  };
}
