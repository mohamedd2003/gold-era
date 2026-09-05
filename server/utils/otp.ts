import { env } from "../config/env";

/**
 * Generates a numeric OTP of the given length (default 6 digits).
 */
export function generateOtp(length = 6): string {
  let code = "";
  for (let i = 0; i < length; i += 1) {
    code += Math.floor(Math.random() * 10).toString();
  }
  return code;
}

export function getOtpExpiry(): Date {
  return new Date(Date.now() + env.otp.expiresMinutes * 60 * 1000);
}
