export type ActionStatus = "idle" | "success" | "error";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ApiSuccess<T> {
  success: true;
  message: string;
  data: T;
  /** Only present on paginated list endpoints. */
  meta?: PaginationMeta;
}

export interface ApiError {
  success: false;
  message: string;
  details?: { field?: string; message: string }[];
}

export type ApiResponse<T = unknown> = ApiSuccess<T> | ApiError;
