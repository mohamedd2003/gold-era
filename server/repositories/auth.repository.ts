import { BaseRepository } from "./base.repository";
import type {
  Prisma,
  User,
  VerificationCode,
} from "../generated/prisma/client";

/**
 * Data-access layer for authentication concerns: users and their
 * email-verification codes.
 */
export class AuthRepository extends BaseRepository {
  findUserByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  findUserById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  createUser(data: Prisma.UserCreateInput): Promise<User> {
    return this.prisma.user.create({ data });
  }

  updateUser(id: number, data: Prisma.UserUpdateInput): Promise<User> {
    return this.prisma.user.update({ where: { id }, data });
  }

  createVerificationCode(
    userId: number,
    code: string,
    expiresAt: Date
  ): Promise<VerificationCode> {
    return this.prisma.verificationCode.create({
      data: { userId, code, expiresAt },
    });
  }

  findLatestValidCode(
    userId: number,
    code: string
  ): Promise<VerificationCode | null> {
    return this.prisma.verificationCode.findFirst({
      where: { userId, code, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
  }

  deleteCodesForUser(userId: number): Promise<Prisma.BatchPayload> {
    return this.prisma.verificationCode.deleteMany({ where: { userId } });
  }

  /**
   * Atomically marks a user verified and removes all of their codes.
   */
  verifyUser(userId: number): Promise<User> {
    return this.transaction(async (tx) => {
      await tx.verificationCode.deleteMany({ where: { userId } });
      return tx.user.update({
        where: { id: userId },
        data: { isVerified: true },
      });
    });
  }

  /**
   * Replaces any existing codes for a user with a fresh one.
   */
  replaceVerificationCode(
    userId: number,
    code: string,
    expiresAt: Date
  ): Promise<VerificationCode> {
    return this.transaction(async (tx) => {
      await tx.verificationCode.deleteMany({ where: { userId } });
      return tx.verificationCode.create({
        data: { userId, code, expiresAt },
      });
    });
  }
}

export const authRepository = new AuthRepository();
