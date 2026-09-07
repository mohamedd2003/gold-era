import type { UserRole } from "@/types";

export function normalizeRole(role: unknown): UserRole {
  return String(role ?? "")
    .trim()
    .toUpperCase() === "ADMIN"
    ? "ADMIN"
    : "USER";
}

export function isAdminRole(role: unknown): boolean {
  return normalizeRole(role) === "ADMIN";
}
