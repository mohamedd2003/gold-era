export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  token: string;
  user: AuthUser;
}

export type LoginStatus = "idle" | "success" | "error";

export type UserRole = "USER" | "ADMIN";

export interface LoginState {
  status: LoginStatus;
  message: string;
  /** The signed-in user's role (only on success). */
  role?: UserRole;
  /** Where the client should navigate next (only on success). */
  redirectTo?: string;
  /** Present only when the account exists but is not verified yet. */
  needsVerification?: boolean;
}
