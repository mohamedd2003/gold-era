import type { Response } from "express";

export interface Meta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface SuccessPayload<T> {
  success: true;
  message: string;
  data: T;
  meta?: Meta;
}

export function sendSuccess<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200,
  meta?: Meta
): Response<SuccessPayload<T>> {
  const body: SuccessPayload<T> = { success: true, message, data };
  if (meta) body.meta = meta;
  return res.status(statusCode).json(body);
}
