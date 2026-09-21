import type { NextFunction, Request, Response } from "express";
import type { Role } from "../../generated/prisma/client.js";
import { verifyToken } from "../lib/jwt.js";
import { AppError } from "./error.js";

export type AuthRequest = Request & {
  user?: { userId: string; email: string; role: Role };
};

export function authenticate(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new AppError(401, "Authentication required"));
  }

  const token = header.slice(7).trim();
  if (!token) {
    return next(new AppError(401, "Authentication required"));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new AppError(401, "Invalid or expired token"));
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, "Authentication required"));
    }
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "Insufficient permissions"));
    }
    next();
  };
}
