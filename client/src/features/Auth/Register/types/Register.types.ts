export interface RegisterUser {
  id: number;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RegisterStatus = "idle" | "success" | "error";

export interface RegisterState {
  status: RegisterStatus;
  message: string;
  /** The email that was registered, so the UI can prefill verification. */
  email?: string;
}
