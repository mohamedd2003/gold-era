import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/ApiResponse";
import { getPagination } from "../utils/pagination";
import { userService, type UserService } from "../services/user.service";
import type { ListUsersQuery } from "../validations/user.validation";

export class UserController {
  constructor(private readonly service: UserService = userService) {}

  list = catchAsync(async (req: Request, res: Response) => {
    const query = req.validatedQuery as ListUsersQuery;
    const pagination = getPagination(query as Record<string, unknown>);
    const { items, meta } = await this.service.list(query, pagination);
    sendSuccess(res, items, "Users fetched successfully", 200, meta);
  });

  update = catchAsync(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const user = await this.service.update(id, req.body);
    sendSuccess(res, user, "User updated successfully");
  });

  remove = catchAsync(async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    await this.service.remove(id);
    sendSuccess(res, null, "User deleted successfully");
  });
}

export const userController = new UserController();
