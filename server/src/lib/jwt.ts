import jwt from "jsonwebtoken";
import type { Role } from "../../generated/prisma/client.js";

export type JwtPayload = {
  userId: string;
  email: string;
  role: Role;
};

const secret = process.env.JWT_SECRET;
const expiresIn = process.env.JWT_EXPIRES_IN ?? "7d";

if (!secret || secret === "replace_with_a_long_random_secret") {
  throw new Error("JWT_SECRET must be set to a strong value in server/.env");
}

const signingSecret = secret;

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, signingSecret, { expiresIn: expiresIn as jwt.SignOptions["expiresIn"] });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, signingSecret) as unknown as JwtPayload;
}
