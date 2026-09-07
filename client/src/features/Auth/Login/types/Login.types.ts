import type { ActionStatus, User, UserRole } from "@/types";

export type { User as AuthUser, UserRole };

export interface LoginData {
  token: string;
  user: User;
}

export interface LoginState {
  status: ActionStatus;
  message: string;
  /** The signed-in user's role (only on success). */
  role?: UserRole;
  /** Where the client should navigate next (only on success). */
  redirectTo?: string;
  /** Present only when the account exists but is not verified yet. */
  needsVerification?: boolean;
}
