import { BaseRepository } from "./base.repository";
import type { File, Prisma } from "../generated/prisma/client";

/** Metadata only — never load `content` (can be tens of MB). */
export const fileMetaSelect = {
  id: true,
  originalName: true,
  filename: true,
  path: true,
  size: true,
  mimetype: true,
  extractedContent: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.FileSelect;

export type FileMeta = Prisma.FileGetPayload<{
  select: typeof fileMetaSelect;
}>;

/**
 * List projection: excludes the potentially large `extractedContent` column.
 */
export const fileListSelect = {
  id: true,
  originalName: true,
  filename: true,
  path: true,
  size: true,
  mimetype: true,
  userId: true,
  createdAt: true,
  updatedAt: true,
  // Owner details so admins can tell whose file they are looking at.
  user: { select: { id: true, name: true, email: true } },
} satisfies Prisma.FileSelect;

export type FileListItem = Prisma.FileGetPayload<{
  select: typeof fileListSelect;
}>;

export interface FindFilesOptions {
  where: Prisma.FileWhereInput;
  skip: number;
  take: number;
  orderBy: Prisma.FileOrderByWithRelationInput;
}

export class FileRepository extends BaseRepository {
  create(data: Prisma.FileUncheckedCreateInput): Promise<File> {
    return this.prisma.file.create({ data });
  }

  findById(id: number): Promise<FileMeta | null> {
    return this.prisma.file.findUnique({
      where: { id },
      select: fileMetaSelect,
    });
  }

  async findContent(id: number): Promise<Uint8Array | null> {
    const row = await this.prisma.file.findUnique({
      where: { id },
      select: { content: true },
    });
    return row?.content ?? null;
  }

  async findMany(
    options: FindFilesOptions
  ): Promise<{ items: FileListItem[]; total: number }> {
    const [items, total] = await Promise.all([
      this.prisma.file.findMany({
        where: options.where,
        skip: options.skip,
        take: options.take,
        orderBy: options.orderBy,
        select: fileListSelect,
      }),
      this.prisma.file.count({ where: options.where }),
    ]);
    return { items, total };
  }

  delete(id: number): Promise<File> {
    return this.prisma.file.delete({ where: { id } });
  }
}

export const fileRepository = new FileRepository();
