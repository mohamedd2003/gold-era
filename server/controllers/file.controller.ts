import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/ApiResponse";
import { getPagination } from "../utils/pagination";
import { BadRequestError, UnauthorizedError } from "../errors/HttpError";
import { fileService, type FileService } from "../services/file.service";
import type { ListFilesQuery } from "../validations/file.validation";

export class FileController {
  constructor(private readonly service: FileService = fileService) {}

  upload = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    if (!req.file) throw new BadRequestError("A file is required");
    const file = await this.service.upload(req.user, req.file);
    sendSuccess(res, file, "File uploaded successfully", 201);
  });

  list = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const query = req.validatedQuery as ListFilesQuery;
    const pagination = getPagination(query as Record<string, unknown>);
    const { items, meta } = await this.service.list(req.user, query, pagination);
    sendSuccess(res, items, "Files fetched successfully", 200, meta);
  });

  getOne = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const id = Number(req.params.id);
    const file = await this.service.getById(req.user, id);
    sendSuccess(res, file, "File fetched successfully");
  });

  remove = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) throw new UnauthorizedError("Authentication required");
    const id = Number(req.params.id);
    await this.service.remove(req.user, id);
    sendSuccess(res, null, "File deleted successfully");
  });
}

export const fileController = new FileController();
