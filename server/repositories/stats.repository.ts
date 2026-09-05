import { BaseRepository } from "./base.repository";
import { Prisma } from "../generated/prisma/client";

export interface MimetypeGroup {
  mimetype: string;
  count: number;
  bytes: number;
}

export interface HistoryPoint {
  date: string;
  count: number;
  bytes: number;
}

export interface RecentUpload {
  id: number;
  originalName: string;
  mimetype: string;
  size: number;
  createdAt: Date;
  user: { id: number; name: string; email: string };
}

export class StatsRepository extends BaseRepository {
  countFiles(where: Prisma.FileWhereInput = {}): Promise<number> {
    return this.prisma.file.count({ where });
  }

  countUsers(where: Prisma.UserWhereInput = {}): Promise<number> {
    return this.prisma.user.count({ where });
  }

  async totalStorage(where: Prisma.FileWhereInput = {}): Promise<number> {
    const result = await this.prisma.file.aggregate({
      where,
      _sum: { size: true },
    });
    return result._sum.size ?? 0;
  }

  async mimetypeDistribution(
    where: Prisma.FileWhereInput = {},
    limit?: number
  ): Promise<MimetypeGroup[]> {
    const groups = await this.prisma.file.groupBy({
      by: ["mimetype"],
      where,
      _count: { _all: true },
      _sum: { size: true },
      orderBy: { _count: { mimetype: "desc" } },
      ...(limit ? { take: limit } : {}),
    });

    return groups.map((group) => ({
      mimetype: group.mimetype,
      count: group._count._all,
      bytes: group._sum.size ?? 0,
    }));
  }

  /**
   * Per-day upload counts and bytes for the last 30 days.
   */
  async uploadHistory(userId?: number): Promise<HistoryPoint[]> {
    const rows = await this.prisma.$queryRaw<
      Array<{ date: Date | string; count: bigint; bytes: bigint | null }>
    >(
      userId === undefined
        ? Prisma.sql`
            SELECT DATE(createdAt) AS date, COUNT(*) AS count, COALESCE(SUM(size), 0) AS bytes
            FROM files
            WHERE createdAt >= (NOW() - INTERVAL 30 DAY)
            GROUP BY DATE(createdAt)
            ORDER BY date DESC`
        : Prisma.sql`
            SELECT DATE(createdAt) AS date, COUNT(*) AS count, COALESCE(SUM(size), 0) AS bytes
            FROM files
            WHERE userId = ${userId} AND createdAt >= (NOW() - INTERVAL 30 DAY)
            GROUP BY DATE(createdAt)
            ORDER BY date DESC`
    );

    return rows.map((row) => ({
      date:
        row.date instanceof Date
          ? row.date.toISOString().slice(0, 10)
          : String(row.date).slice(0, 10),
      count: Number(row.count),
      bytes: Number(row.bytes ?? 0),
    }));
  }

  recentUploads(limit = 10): Promise<RecentUpload[]> {
    return this.prisma.file.findMany({
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        originalName: true,
        mimetype: true,
        size: true,
        createdAt: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
  }
}

export const statsRepository = new StatsRepository();
