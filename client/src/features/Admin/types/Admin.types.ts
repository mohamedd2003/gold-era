import type { PaginationMeta, User, UserRole } from "@/types";
import type { FileTypeStat } from "@/features/Analytics/types/Analytics.types";

/** A row in the admin user table. */
export type ManagedUser = Required<
  Pick<User, "id" | "name" | "email" | "role" | "isVerified">
> & {
  createdAt: string;
  updatedAt?: string;
};

export interface ManagedUsersPage {
  items: ManagedUser[];
  meta?: PaginationMeta;
}

export interface RecentUpload {
  id: number;
  originalName: string;
  mimetype: string;
  size: number;
  createdAt: string;
  user: { id: number; name: string; email: string };
}

/** GET /stats/admin */
export interface AdminStats {
  totalUsers: number;
  totalFiles: number;
  storageUsageBytes: number;
  topFileTypes: FileTypeStat[];
  recentUploads: RecentUpload[];
}

export const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "USER", label: "User" },
  { value: "ADMIN", label: "Admin" },
];

export const ROLE_FILTERS: { value: "" | UserRole; label: string }[] = [
  { value: "", label: "All roles" },
  { value: "USER", label: "Users" },
  { value: "ADMIN", label: "Admins" },
];

export const VERIFIED_FILTERS: { value: string; label: string }[] = [
  { value: "", label: "Any status" },
  { value: "true", label: "Verified" },
  { value: "false", label: "Unverified" },
];

export const USER_SORT_OPTIONS = [
  { value: "createdAt:desc", label: "Newest" },
  { value: "createdAt:asc", label: "Oldest" },
  { value: "name:asc", label: "Name A–Z" },
  { value: "name:desc", label: "Name Z–A" },
  { value: "email:asc", label: "Email A–Z" },
] as const;
