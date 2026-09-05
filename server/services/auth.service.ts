import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError,
} from "../errors/HttpError";
import { comparePassword, hashPassword } from "../utils/password";
import { signToken } from "../utils/jwt";
import { generateOtp, getOtpExpiry } from "../utils/otp";
import { sendVerificationEmail } from "../utils/mailer";
import { toPublicUser, type PublicUser } from "../models/user.model";
import { AuthRepository, authRepository } from "../repositories/auth.repository";
import type {
  LoginDto,
  RegisterDto,
  ResendCodeDto,
  VerifyEmailDto,
} from "../validations/auth.validation";

export interface AuthResult {
  token: string;
  user: PublicUser;
}

export class AuthService {
  constructor(private readonly repo: AuthRepository = authRepository) {}

  async register(dto: RegisterDto): Promise<PublicUser> {
    const existing = await this.repo.findUserByEmail(dto.email);
    if (existing) {
      throw new ConflictError("Email is already registered");
    }

    const passwordHash = await hashPassword(dto.password);
    const user = await this.repo.createUser({
      name: dto.name,
      email: dto.email,
      password: passwordHash,
    });

    const code = generateOtp();
    await this.repo.createVerificationCode(user.id, code, getOtpExpiry());
    await sendVerificationEmail(user.email, code);

    return toPublicUser(user);
  }

  async verifyEmail(dto: VerifyEmailDto): Promise<PublicUser> {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user) {
      throw new NotFoundError("No account found for this email");
    }
    if (user.isVerified) {
      throw new BadRequestError("Email is already verified");
    }

    const code = await this.repo.findLatestValidCode(user.id, dto.code);
    if (!code) {
      throw new BadRequestError("Invalid or expired verification code");
    }

    const verified = await this.repo.verifyUser(user.id);
    return toPublicUser(verified);
  }

  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const passwordOk = await comparePassword(dto.password, user.password);
    if (!passwordOk) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isVerified) {
      throw new ForbiddenError("Please verify your email before logging in");
    }

    const token = signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return { token, user: toPublicUser(user) };
  }

  async resendCode(dto: ResendCodeDto): Promise<void> {
    const user = await this.repo.findUserByEmail(dto.email);
    if (!user) {
      throw new NotFoundError("No account found for this email");
    }
    if (user.isVerified) {
      throw new BadRequestError("Email is already verified");
    }

    const code = generateOtp();
    await this.repo.replaceVerificationCode(user.id, code, getOtpExpiry());
    await sendVerificationEmail(user.email, code);
  }

  async getProfile(userId: number): Promise<PublicUser> {
    const user = await this.repo.findUserById(userId);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return toPublicUser(user);
  }
}

export const authService = new AuthService();
