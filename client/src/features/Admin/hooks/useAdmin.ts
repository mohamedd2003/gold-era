"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { apiErrorMessage } from "@/features/UploadFiles/services/UploadFiles.services";
import type { StatsPeriod } from "@/features/Analytics/types/Analytics.types";
import {
  deleteUser,
  getAdminHistory,
  getAdminStats,
  listUsers,
  updateUser,
} from "../services/Admin.services";
import type { ListUsersParams, UpdateUserInput } from "../validation/Admin.validation";

export const adminKeys = {
  all: ["admin"] as const,
  users: ["admin", "users"] as const,
  userList: (params: ListUsersParams) => ["admin", "users", params] as const,
  stats: ["admin", "stats"] as const,
  history: (period: StatsPeriod) => ["admin", "history", period] as const,
};

export function useUsers(params: ListUsersParams = {}) {
  return useQuery({
    queryKey: adminKeys.userList(params),
    queryFn: () => listUsers(params),
    placeholderData: keepPreviousData,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: UpdateUserInput }) =>
      updateUser(id, input),
    onSuccess: (user) => {
      toast.success(`${user.name} updated.`);
      queryClient.invalidateQueries({ queryKey: adminKeys.users });
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Could not update the user.")),
  });
}

export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteUser,
    onSuccess: () => {
      toast.success("User deleted.");
      // Deleting a user cascades to their files, so the stats are stale too.
      queryClient.invalidateQueries({ queryKey: adminKeys.all });
      queryClient.invalidateQueries({ queryKey: ["files"] });
    },
    onError: (error) =>
      toast.error(apiErrorMessage(error, "Could not delete the user.")),
  });
}

export function useAdminStats() {
  return useQuery({
    queryKey: adminKeys.stats,
    queryFn: getAdminStats,
  });
}

export function useAdminHistory(period: StatsPeriod) {
  return useQuery({
    queryKey: adminKeys.history(period),
    queryFn: () => getAdminHistory(period),
    placeholderData: keepPreviousData,
  });
}
