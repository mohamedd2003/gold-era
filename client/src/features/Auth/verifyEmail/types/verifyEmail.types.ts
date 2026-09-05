export type VerifyStatus = "idle" | "success" | "error";

export interface VerifyEmailState {
  status: VerifyStatus;
  message: string;
}

export interface ResendState {
  status: VerifyStatus;
  message: string;
}
