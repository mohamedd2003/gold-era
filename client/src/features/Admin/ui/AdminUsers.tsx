"use client";

import { useState } from "react";
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Clock,
  Loader2,
  RefreshCw,
  Search,
  Trash2,
  UserRoundX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types";
import { useDebouncedValue } from "@/features/UploadFiles/hooks/useDebouncedValue";
import { apiErrorMessage } from "@/features/UploadFiles/services/UploadFiles.services";
import { formatDate } from "@/features/UploadFiles/utils/format";
import { useDeleteUser, useUpdateUser, useUsers } from "../hooks/useAdmin";
import {
  ROLE_FILTERS,
  ROLE_OPTIONS,
  USER_SORT_OPTIONS,
  VERIFIED_FILTERS,
  type ManagedUser,
} from "../types/Admin.types";
import type { ListUsersParams } from "../validation/Admin.validation";
import { ConfirmDialog } from "./ConfirmDialog";

const PAGE_SIZE = 10;

/** `currentUserId` is the signed-in admin, who cannot demote or delete self. */
export function AdminUsers({ currentUserId }: { currentUserId: number }) {
  const [searchInput, setSearchInput] = useState("");
  const search = useDebouncedValue(searchInput.trim(), 350);
  const [role, setRole] = useState<"" | UserRole>("");
  const [verified, setVerified] = useState("");
  const [sort, setSort] = useState<string>("createdAt:desc");
  const [paging, setPaging] = useState({ key: "||createdAt:desc", page: 1 });
  const [pendingDelete, setPendingDelete] = useState<ManagedUser | null>(null);

  const [sortBy, order] = sort.split(":") as [
    NonNullable<ListUsersParams["sortBy"]>,
    NonNullable<ListUsersParams["order"]>,
  ];
  const filterKey = `${search}|${role}|${verified}|${sort}`;
  const page = paging.key === filterKey ? paging.page : 1;

  const listQuery = useUsers({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    role: role || undefined,
    isVerified: (verified || undefined) as "true" | "false" | undefined,
    sortBy,
    order,
  });
  const removeUser = useDeleteUser();

  const users = listQuery.data?.items ?? [];
  const meta = listQuery.data?.meta;
  const total = meta?.total ?? 0;
  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);
  const isLoading =
    listQuery.isPending ||
    searchInput.trim() !== search ||
    listQuery.isPlaceholderData;

  return (
    <section className="mx-auto w-full max-w-6xl">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            User management
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Search accounts, change roles and remove users.
          </p>
        </div>
        <button
          type="button"
          onClick={() => listQuery.refetch()}
          disabled={listQuery.isFetching}
          className="inline-flex items-center gap-1.5 self-start text-xs font-medium text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
        >
          <RefreshCw
            className={cn("size-3.5", listQuery.isFetching && "animate-spin")}
          />
          Refresh
        </button>
      </div>

      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <label className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Search by name or email…"
            className="h-10 w-full rounded-xl border border-border bg-card pr-3 pl-10 text-sm text-foreground outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </label>
        <select
          value={role}
          onChange={(event) => setRole(event.target.value as "" | UserRole)}
          aria-label="Filter by role"
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:w-36"
        >
          {ROLE_FILTERS.map((option) => (
            <option key={option.value || "all"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={verified}
          onChange={(event) => setVerified(event.target.value)}
          aria-label="Filter by verification status"
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:w-36"
        >
          {VERIFIED_FILTERS.map((option) => (
            <option key={option.value || "any"} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(event) => setSort(event.target.value)}
          aria-label="Sort users"
          className="h-10 rounded-xl border border-border bg-card px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 sm:w-36"
        >
          {USER_SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : listQuery.isError ? (
        <ErrorState
          message={apiErrorMessage(listQuery.error, "Please try again.")}
          onRetry={() => listQuery.refetch()}
        />
      ) : users.length === 0 ? (
        <EmptyState hasQuery={Boolean(search || role || verified)} />
      ) : (
        <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[42rem] text-left text-sm">
              <thead className="border-b border-border bg-secondary/50">
                <tr className="text-[11px] font-semibold tracking-[0.12em] text-muted-foreground uppercase">
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Joined</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/70">
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isSelf={user.id === currentUserId}
                    onDelete={() => setPendingDelete(user)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!isLoading && meta && total > 0 && (
        <div className="mt-5 flex flex-col items-center justify-between gap-3 sm:flex-row">
          <p className="text-xs text-muted-foreground">
            Showing {from}–{to} of {total} users
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!meta.hasPrev}
              onClick={() =>
                setPaging({ key: filterKey, page: Math.max(1, page - 1) })
              }
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </button>
            <span className="text-xs text-muted-foreground">
              Page {meta.page} of {meta.totalPages}
            </span>
            <button
              type="button"
              disabled={!meta.hasNext}
              onClick={() => setPaging({ key: filterKey, page: page + 1 })}
              className="inline-flex h-9 items-center gap-1 rounded-xl border border-border bg-card px-3 text-xs font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
              <ChevronRight className="size-3.5" />
            </button>
          </div>
        </div>
      )}

      {pendingDelete && (
        <ConfirmDialog
          title={`Delete ${pendingDelete.name}?`}
          description="Their account and every file they uploaded will be permanently removed. This cannot be undone."
          confirmLabel="Delete user"
          isPending={removeUser.isPending}
          onCancel={() => setPendingDelete(null)}
          onConfirm={() =>
            removeUser.mutate(pendingDelete.id, {
              onSuccess: () => setPendingDelete(null),
            })
          }
        />
      )}
    </section>
  );
}

function UserRow({
  user,
  isSelf,
  onDelete,
}: {
  user: ManagedUser;
  isSelf: boolean;
  onDelete: () => void;
}) {
  const update = useUpdateUser();

  return (
    <tr className={cn("transition-colors hover:bg-secondary/40")}>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary uppercase">
            {user.name.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">
              {user.name}
              {isSelf && (
                <span className="ml-1.5 text-xs font-normal text-muted-foreground">
                  (you)
                </span>
              )}
            </p>
            <p className="truncate text-xs text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <select
            value={user.role}
            // The server blocks self role changes too; this keeps the UI honest.
            disabled={isSelf || update.isPending}
            onChange={(event) =>
              update.mutate({
                id: user.id,
                input: { role: event.target.value as UserRole },
              })
            }
            aria-label={`Role for ${user.name}`}
            title={isSelf ? "You cannot change your own role" : undefined}
            className="h-9 rounded-xl border border-border bg-background px-2 text-xs font-medium text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {ROLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {update.isPending && (
            <Loader2 className="size-3.5 animate-spin text-muted-foreground" />
          )}
        </div>
      </td>

      <td className="px-4 py-3">
        {user.isVerified ? (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
            <BadgeCheck className="size-3.5" />
            Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-600 dark:text-amber-400">
            <Clock className="size-3.5" />
            Pending
          </span>
        )}
      </td>

      <td className="px-4 py-3 text-xs whitespace-nowrap text-muted-foreground">
        {formatDate(user.createdAt)}
      </td>

      <td className="px-4 py-3 text-right">
        <button
          type="button"
          onClick={onDelete}
          disabled={isSelf}
          aria-label={`Delete ${user.name}`}
          title={isSelf ? "You cannot delete your own account" : "Delete user"}
          className="inline-flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-muted-foreground"
        >
          <Trash2 className="size-4" />
        </button>
      </td>
    </tr>
  );
}

function TableSkeleton() {
  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
      <div className="h-11 animate-pulse border-b border-border bg-secondary/50" />
      <div className="divide-y divide-border/70">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="flex items-center gap-3 px-4 py-3.5">
            <div className="size-9 shrink-0 animate-pulse rounded-full bg-secondary" />
            <div className="flex-1 space-y-2">
              <div className="h-3.5 w-40 animate-pulse rounded bg-secondary" />
              <div className="h-3 w-56 animate-pulse rounded bg-secondary/80" />
            </div>
            <div className="h-9 w-24 animate-pulse rounded-xl bg-secondary/80" />
            <div className="h-6 w-20 animate-pulse rounded-full bg-secondary/80" />
            <div className="size-8 animate-pulse rounded-lg bg-secondary/80" />
          </div>
        ))}
      </div>
    </div>
  );
}

function EmptyState({ hasQuery }: { hasQuery: boolean }) {
  return (
    <div className="mt-5 flex flex-col items-center rounded-2xl border border-dashed border-border bg-secondary/30 px-6 py-12 text-center">
      <UserRoundX className="size-6 text-muted-foreground" />
      <p className="mt-3 text-sm font-medium text-foreground">
        {hasQuery ? "No users match these filters" : "No users yet"}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">
        {hasQuery
          ? "Try a different name, email or role."
          : "Accounts will appear here as people sign up."}
      </p>
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
    <div className="mt-5 flex flex-col items-center rounded-2xl border border-destructive/30 bg-destructive/5 px-6 py-12 text-center">
      <CircleAlert className="size-6 text-destructive" />
      <p className="mt-3 text-sm font-medium text-foreground">
        Could not load users
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
