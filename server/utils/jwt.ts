import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "../errors/HttpError";

export interface JwtPayload {
  sub: number;
  email: string;
  role: string;
}

export function signToken(payload: JwtPayload): string {
  const options: SignOptions = {
    expiresIn: env.jwt.expiresIn as SignOptions["expiresIn"],
  };
  return jwt.sign(payload, env.jwt.secret, options);
}

export function verifyToken(token: string): JwtPayload {
  try {
    return jwt.verify(token, env.jwt.secret) as unknown as JwtPayload;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
