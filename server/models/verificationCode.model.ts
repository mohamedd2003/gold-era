import type { VerificationCode } from "../generated/prisma/client";

/**
 * Public-facing verification-code shape. Never exposes the raw `code`
 * value; only metadata that is safe to surface (e.g. expiry).
 */
export interface PublicVerificationCode {
  id: number;
  userId: number;
  expiresAt: Date;
  createdAt: Date;
}

export function toPublicVerificationCode(
  entity: VerificationCode
): PublicVerificationCode {
  return {
    id: entity.id,
    userId: entity.userId,
    expiresAt: entity.expiresAt,
    createdAt: entity.createdAt,
  };
}
