import { prisma } from "../config/db";
import type { PrismaClient } from "../generated/prisma/client";

/**
 * Base repository giving every concrete repository access to the shared
 * Prisma client and a transaction helper. Concrete repositories encapsulate
 * all persistence logic for a single aggregate/model.
 */
export abstract class BaseRepository {
  protected readonly prisma: PrismaClient = prisma;

  /**
   * Runs the provided work inside a single database transaction.
   */
  protected transaction<T>(
    work: (tx: Parameters<Parameters<PrismaClient["$transaction"]>[0]>[0]) => Promise<T>
  ): Promise<T> {
    return this.prisma.$transaction(work);
  }
}
