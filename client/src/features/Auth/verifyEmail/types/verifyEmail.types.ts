import type { ActionStatus } from "@/types";

export interface VerifyEmailState {
  status: ActionStatus;
  message: string;
}

export interface ResendState {
  status: ActionStatus;
  message: string;
}
