import type { NextFunction, Request, Response } from "express";
import { prisma } from "../config/db";
import { ForbiddenError, UnauthorizedError } from "../errors/HttpError";
import { verifyToken } from "../utils/jwt";
import { Role } from "../generated/prisma/client";

function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    return header.slice(7).trim();
  }
  return null;
}

/**
 * Authenticates the request via a Bearer JWT and attaches the live user
 * record to `req.user`. Rejects if the token is missing/invalid or the
 * user no longer exists.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const token = extractToken(req);
    if (!token) {
      throw new UnauthorizedError("Authentication token is required");
    }

    const payload = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isVerified: true,
      },
    });

    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Guards a route so only the listed roles may access it.
 * Must be used after `authenticate`.
 */
export function authorize(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError("Authentication required"));
      return;
    }
    if (!roles.includes(req.user.role as Role)) {
      next(new ForbiddenError("You do not have permission to access this resource"));
      return;
    }
    next();
  };
}

/**
 * Ensures the authenticated user has verified their email.
 */
export function requireVerified(
  req: Request,
  _res: Response,
  next: NextFunction
): void {
  if (!req.user) {
    next(new UnauthorizedError("Authentication required"));
    return;
  }
  if (!req.user.isVerified) {
    next(new ForbiddenError("Please verify your email to continue"));
    return;
  }
  next();
}
