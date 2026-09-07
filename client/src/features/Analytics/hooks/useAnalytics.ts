"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import {
  getUploadHistory,
  getUserStats,
} from "../services/Analytics.services";
import type { StatsPeriod } from "../types/Analytics.types";

export const statsKeys = {
  all: ["stats"] as const,
  user: ["stats", "user"] as const,
  history: (period: StatsPeriod) => ["stats", "history", period] as const,
};

export function useUserStats() {
  return useQuery({
    queryKey: statsKeys.user,
    queryFn: getUserStats,
  });
}

export function useUploadHistory(period: StatsPeriod) {
  return useQuery({
    queryKey: statsKeys.history(period),
    queryFn: () => getUploadHistory(period),
    placeholderData: keepPreviousData,
  });
}
