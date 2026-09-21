import { Router } from "express";
import bcrypt from "bcryptjs";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { Role } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { signToken } from "../lib/jwt.js";
import { AppError } from "../middleware/error.js";
import { sendPasswordResetOtp, isEmailConfigured } from "../services/email.service.js";
import {
  isGoogleAuthConfigured,
  verifyGoogleCredential,
} from "../services/googleAuth.service.js";
import {
  generateOtpCode,
  hashOtp,
  MAX_ATTEMPTS,
  otpExpiresAt,
  verifyOtp,
} from "../utils/otp.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { getAuthUser } from "../utils/authUser.js";

const router = Router();

const resetRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many reset attempts. Try again later." },
});

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  role: z.nativeEnum(Role).optional().default(Role.PATIENT),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  email: z.string().email(),
  otp: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const googleAuthSchema = z.object({
  credential: z.string().min(1),
  portal: z.enum(["patient", "clinic"]),
});

const GENERIC_RESET_MSG =
  "If an account exists for this email, a reset code has been sent to your inbox.";

function userResponse(user: {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone: string | null;
}) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
  };
}

function isStaffRole(role: Role) {
  return role === Role.DOCTOR || role === Role.RECEPTIONIST;
}

router.post("/register", async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);

    if (data.role !== Role.PATIENT) {
      throw new AppError(403, "Only patient self-registration is allowed");
    }

    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) {
      throw new AppError(409, "Email already exists");
    }

    const hashed = await bcrypt.hash(data.password, 12);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashed,
        role: Role.PATIENT,
        patient: { create: {} },
      },
      select: { id: true, name: true, email: true, role: true, phone: true },
    });

    const token = signToken({ userId: user.id, email: user.email, role: user.role });
    res.status(201).json({ user, token });
  } catch (e) {
    next(e);
  }
});

router.post("/login", async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });

    if (!user || !user.isActive) {
      throw new AppError(401, "Invalid credentials");
    }

    if (!user.password) {
      throw new AppError(401, "This account uses Google sign-in. Use Continue with Google.");
    }

    const valid = await bcrypt.compare(data.password, user.password);
    if (!valid) {
      throw new AppError(401, "Invalid credentials");
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({ token, user: userResponse(user) });
  } catch (e) {
    next(e);
  }
});

router.post("/forgot-password", resetRateLimit, async (req, res, next) => {
  try {
    if (!isEmailConfigured()) {
      throw new AppError(
        503,
        "Password reset email is not configured. Ask your administrator to set up SMTP."
      );
    }

    const { email } = forgotPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (user?.isActive) {
      const code = generateOtpCode();
      const codeHash = await hashOtp(code);

      await prisma.$transaction([
        prisma.passwordResetOtp.updateMany({
          where: { userId: user.id, usedAt: null },
          data: { usedAt: new Date() },
        }),
        prisma.passwordResetOtp.create({
          data: {
            userId: user.id,
            codeHash,
            expiresAt: otpExpiresAt(),
          },
        }),
      ]);

      await sendPasswordResetOtp(user.email, user.name, code);
    }

    res.json({ message: GENERIC_RESET_MSG });
  } catch (e) {
    next(e);
  }
});

router.post("/google", async (req, res, next) => {
  try {
    if (!isGoogleAuthConfigured()) {
      throw new AppError(503, "Google sign-in is not configured");
    }

    const { credential, portal } = googleAuthSchema.parse(req.body);
    const profile = await verifyGoogleCredential(credential);

    let user = await prisma.user.findFirst({
      where: {
        OR: [{ googleId: profile.googleId }, { email: profile.email }],
      },
    });

    if (portal === "clinic") {
      if (!user || !user.isActive || !isStaffRole(user.role)) {
        throw new AppError(
          403,
          "No clinic account found for this Google email. Ask your clinic owner to add you."
        );
      }
    } else if (!user) {
      user = await prisma.user.create({
        data: {
          name: profile.name,
          email: profile.email,
          googleId: profile.googleId,
          role: Role.PATIENT,
          patient: { create: {} },
        },
      });
    } else if (!user.isActive) {
      throw new AppError(403, "Account is inactive");
    }

    if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: profile.googleId },
      });
    }

    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    res.json({ token, user: userResponse(user) });
  } catch (e) {
    next(e);
  }
});

router.post("/reset-password", resetRateLimit, async (req, res, next) => {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email: data.email } });

    if (!user || !user.isActive) {
      throw new AppError(400, "Invalid or expired reset code");
    }

    const otpRecord = await prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      throw new AppError(400, "Invalid or expired reset code");
    }

    if (otpRecord.attempts >= MAX_ATTEMPTS) {
      throw new AppError(400, "Too many failed attempts. Request a new code.");
    }

    const valid = await verifyOtp(data.otp, otpRecord.codeHash);
    if (!valid) {
      await prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new AppError(400, "Invalid or expired reset code");
    }

    const hashed = await bcrypt.hash(data.password, 12);
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashed },
      }),
      prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { usedAt: new Date() },
      }),
    ]);

    res.json({ message: "Password updated successfully. You can sign in now." });
  } catch (e) {
    next(e);
  }
});

router.get("/me", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const user = await getAuthUser(req.user!.userId);
    res.json({ user });
  } catch (e) {
    next(e);
  }
});

export default router;
