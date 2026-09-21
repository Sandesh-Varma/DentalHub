import crypto from "crypto";
import bcrypt from "bcryptjs";

const OTP_LENGTH = 6;
const OTP_TTL_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;

export function generateOtpCode(): string {
  const max = 10 ** OTP_LENGTH;
  const num = crypto.randomInt(0, max);
  return String(num).padStart(OTP_LENGTH, "0");
}

export async function hashOtp(code: string): Promise<string> {
  return bcrypt.hash(code, 10);
}

export async function verifyOtp(code: string, hash: string): Promise<boolean> {
  return bcrypt.compare(code, hash);
}

export function otpExpiresAt(): Date {
  return new Date(Date.now() + OTP_TTL_MS);
}

export { MAX_ATTEMPTS };
