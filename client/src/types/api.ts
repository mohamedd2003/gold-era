export type ActionStatus = "idle" | "success" | "error";

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
  details?: { field?: string; message: string }[];
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
