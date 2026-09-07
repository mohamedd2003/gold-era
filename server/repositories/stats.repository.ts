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
   * Upload counts and bytes grouped by the selected period.
   * hourly → last 7 hours, daily → last 7 days,
   * monthly → last 12 months, yearly → last 5 years.
   */
  async uploadHistory(
    userId: number | undefined,
    period: "hourly" | "daily" | "monthly" | "yearly" = "daily"
  ): Promise<HistoryPoint[]> {
    const bucket =
      period === "hourly"
        ? Prisma.sql`DATE_FORMAT(createdAt, '%Y-%m-%d %H:00')`
        : period === "monthly"
          ? Prisma.sql`DATE_FORMAT(createdAt, '%Y-%m')`
          : period === "yearly"
            ? Prisma.sql`DATE_FORMAT(createdAt, '%Y')`
            : Prisma.sql`DATE_FORMAT(createdAt, '%Y-%m-%d')`;

    const since =
      period === "hourly"
        ? Prisma.sql`NOW() - INTERVAL 7 HOUR`
        : period === "monthly"
          ? Prisma.sql`NOW() - INTERVAL 12 MONTH`
          : period === "yearly"
            ? Prisma.sql`NOW() - INTERVAL 5 YEAR`
            : Prisma.sql`NOW() - INTERVAL 7 DAY`;

    const rows = await this.prisma.$queryRaw<
      Array<{ date: Date | string; count: bigint; bytes: bigint | null }>
    >(
      userId === undefined
        ? Prisma.sql`
            SELECT ${bucket} AS date, COUNT(*) AS count, COALESCE(SUM(size), 0) AS bytes
            FROM files
            WHERE createdAt >= ${since}
            GROUP BY ${bucket}
            ORDER BY date ASC`
        : Prisma.sql`
            SELECT ${bucket} AS date, COUNT(*) AS count, COALESCE(SUM(size), 0) AS bytes
            FROM files
            WHERE userId = ${userId} AND createdAt >= ${since}
            GROUP BY ${bucket}
            ORDER BY date ASC`
    );

    return rows.map((row) => ({
      date:
        row.date instanceof Date
          ? row.date.toISOString().slice(0, 13).replace("T", " ")
          : String(row.date),
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
