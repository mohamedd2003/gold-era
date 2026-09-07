import fs from "node:fs/promises";
import path from "node:path";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
} from "../errors/HttpError";
import { buildMeta, type PaginationParams } from "../utils/pagination";
import type { Meta } from "../utils/ApiResponse";
import { extractTextContent } from "../utils/extractContent";
import type { AuthenticatedUser } from "../types/express";
import { Role, type File, type Prisma } from "../generated/prisma/client";
import {
  FileRepository,
  fileRepository,
} from "../repositories/file.repository";
import {
  toPublicFile,
  toPublicFileListItem,
  type PublicFile,
  type PublicFileListItem,
} from "../models/file.model";
import type { ListFilesQuery } from "../validations/file.validation";

export class FileService {
  constructor(private readonly repo: FileRepository = fileRepository) {}

  private isAdmin(user: AuthenticatedUser): boolean {
    return user.role === Role.ADMIN;
  }

  /**
   * Loads a file the user is allowed to access, returning the full entity
   * (including the internal `path`) for use by other service methods.
   */
  private async findAccessible(
    user: AuthenticatedUser,
    id: number
  ): Promise<File> {
    const file = await this.repo.findById(id);
    if (!file) {
      throw new NotFoundError("File not found");
    }
    if (!this.isAdmin(user) && file.userId !== user.id) {
      throw new ForbiddenError("You do not have access to this file");
    }
    return file;
  }

  async upload(
    user: AuthenticatedUser,
    file: Express.Multer.File
  ): Promise<PublicFile> {
    if (!file) {
      throw new BadRequestError("A file is required");
    }

    try {
      const extractedContent = await extractTextContent(
        file.path,
        file.mimetype
      );

      const created = await this.repo.create({
        originalName: file.originalname,
        filename: file.filename,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        extractedContent,
        userId: user.id,
      });
      return toPublicFile(created);
    } catch (error) {
      // Roll back the stored file if persistence failed.
      await fs.unlink(file.path).catch(() => undefined);
      throw error;
    }
  }

  async list(
    user: AuthenticatedUser,
    query: ListFilesQuery,
    pagination: PaginationParams
  ): Promise<{ items: PublicFileListItem[]; meta: Meta }> {
    const where: Prisma.FileWhereInput = {};

    // Regular users only ever see their own files; admins may scope by owner.
    if (this.isAdmin(user)) {
      if (query.userId) where.userId = query.userId;
    } else {
      where.userId = user.id;
    }
    if (query.search) {
      where.originalName = { contains: query.search };
    }
    if (query.type) {
      where.mimetype = { contains: query.type };
    }

    const { items, total } = await this.repo.findMany({
      where,
      skip: pagination.skip,
      take: pagination.limit,
      orderBy: { [query.sortBy]: query.order },
    });

    return {
      items: items.map(toPublicFileListItem),
      meta: buildMeta(total, pagination),
    };
  }

  async getById(user: AuthenticatedUser, id: number): Promise<PublicFile> {
    const file = await this.findAccessible(user, id);
    return toPublicFile(file);
  }

  /**
   * Resolves the on-disk location of a file so it can be streamed back to the
   * owner (or an admin). Kept separate from `getById` because the absolute
   * path must never leak into a JSON response.
   */
  async getStorageTarget(
    user: AuthenticatedUser,
    id: number
  ): Promise<{ absolutePath: string; mimetype: string; originalName: string }> {
    const file = await this.findAccessible(user, id);
    const absolutePath = path.resolve(file.path);

    try {
      await fs.access(absolutePath);
    } catch {
      throw new NotFoundError("File is no longer available on the server");
    }

    return {
      absolutePath,
      mimetype: file.mimetype,
      originalName: file.originalName,
    };
  }

  async remove(user: AuthenticatedUser, id: number): Promise<void> {
    const file = await this.findAccessible(user, id);
    await this.repo.delete(file.id);
    // Best-effort removal from disk; ignore if already gone.
    await fs.unlink(file.path).catch(() => undefined);
  }
}

export const fileService = new FileService();
