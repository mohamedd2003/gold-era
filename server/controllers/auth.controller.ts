import type { Request, Response } from "express";
import { catchAsync } from "../utils/catchAsync";
import { sendSuccess } from "../utils/ApiResponse";
import { UnauthorizedError } from "../errors/HttpError";
import { authService, type AuthService } from "../services/auth.service";

export class AuthController {
  constructor(private readonly service: AuthService = authService) {}

  register = catchAsync(async (req: Request, res: Response) => {
    const user = await this.service.register(req.body);
    sendSuccess(
      res,
      user,
      "Registration successful. A verification code has been sent to your email.",
      201
    );
  });

  verifyEmail = catchAsync(async (req: Request, res: Response) => {
    const user = await this.service.verifyEmail(req.body);
    sendSuccess(res, user, "Email verified successfully");
  });

  login = catchAsync(async (req: Request, res: Response) => {
    const result = await this.service.login(req.body);
    sendSuccess(res, result, "Login successful");
  });

  resendCode = catchAsync(async (req: Request, res: Response) => {
    await this.service.resendCode(req.body);
    sendSuccess(res, null, "A new verification code has been sent");
  });

  profile = catchAsync(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new UnauthorizedError("Authentication required");
    }
    const user = await this.service.getProfile(req.user.id);
    sendSuccess(res, user, "Profile fetched successfully");
  });
}

export const authController = new AuthController();
