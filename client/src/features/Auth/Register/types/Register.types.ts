import type { ActionStatus, User } from "@/types";

export type { User as RegisterUser };

export interface RegisterState {
  status: ActionStatus;
  message: string;
  /** The email that was registered, so the UI can prefill verification. */
  email?: string;
}
