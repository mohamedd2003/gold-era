export interface FileTypeStat {
  mimetype: string;
  count: number;
  bytes: number;
}

export interface HistoryPoint {
  date: string;
  count: number;
  bytes: number;
}

export interface UserStats {
  totalFiles: number;
  storageUsageBytes: number;
  fileTypes: FileTypeStat[];
  uploadHistory: HistoryPoint[];
}

export type StatsPeriod = "hourly" | "daily" | "monthly" | "yearly";

export interface HistorySeries {
  period: StatsPeriod;
  history: HistoryPoint[];
}

export const STATS_PERIODS: { value: StatsPeriod; label: string; hint: string }[] =
  [
    { value: "hourly", label: "Hourly", hint: "Last 7 hours" },
    { value: "daily", label: "Daily", hint: "Last 7 days" },
    { value: "monthly", label: "Monthly", hint: "Last 12 months" },
    { value: "yearly", label: "Yearly", hint: "Last 5 years" },
  ];
