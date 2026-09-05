import type { Role, User } from "../generated/prisma/client";

/**
 * Public-facing user shape. Never includes the password hash.
 */
export interface PublicUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export function toPublicUser(user: User): PublicUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}
