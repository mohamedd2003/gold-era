import type { NextFunction, Request, Response } from "express";
import { env } from "../config/env";
import { HttpError } from "../errors/HttpError";

interface PrismaKnownError {
  code: string;
  meta?: Record<string, unknown>;
}

function isPrismaKnownError(error: unknown): error is PrismaKnownError {
  return (
    typeof error === "object" &&
    error !== null &&
    error.constructor?.name === "PrismaClientKnownRequestError" &&
    typeof (error as { code?: unknown }).code === "string"
  );
}

function mapPrismaError(error: PrismaKnownError): {
  statusCode: number;
  message: string;
  details?: unknown;
} {
  switch (error.code) {
    case "P2002": {
      const target = (error.meta?.target as string[] | undefined)?.join(", ");
      return {
        statusCode: 409,
        message: target
          ? `A record with this ${target} already exists`
          : "Unique constraint violation",
      };
    }
    case "P2025":
      return { statusCode: 404, message: "Record not found" };
    case "P2003":
      return { statusCode: 400, message: "Related record constraint failed" };
    default: {
      const raw = String(error.meta?.message ?? "");
      if (raw.includes("pool timeout") || error.code === "48928") {
        return {
          statusCode: 503,
          message:
            "Database is busy. Restart the Node server and try again.",
        };
      }
      return { statusCode: 400, message: "Database request error" };
    }
  }
}

/**
 * Global error handler. Normalises HttpError, Prisma errors and unknown
 * errors into a consistent JSON envelope.
 */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  // next is required for Express to treat this as an error handler
  _next: NextFunction
): void {
  let statusCode = 500;
  let message = "Internal server error";
  let details: unknown;

  if (err instanceof HttpError) {
    statusCode = err.statusCode;
    message = err.message;
    details = err.details;
  } else if (isPrismaKnownError(err)) {
    const mapped = mapPrismaError(err);
    statusCode = mapped.statusCode;
    message = mapped.message;
    details = mapped.details;
  } else if (err instanceof SyntaxError) {
    statusCode = 400;
    message = "Invalid JSON body";
  } else if (err instanceof Error) {
    message = env.isProduction ? "Internal server error" : err.message;
  }

  if (statusCode >= 500) {
    // eslint-disable-next-line no-console
    console.error("[error]", err);
  }

  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message,
    ...(details ? { details } : {}),
    ...(!env.isProduction && err instanceof Error ? { stack: err.stack } : {}),
  });
}

/**
 * 404 handler for unmatched routes.
 */
export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json({
    success: false,
    status: 404,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
}
