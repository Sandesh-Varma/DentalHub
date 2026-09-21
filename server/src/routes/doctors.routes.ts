import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";
import { paramId } from "../utils/params.js";
import { deactivateUser } from "../utils/deactivateUser.js";
import { saveDoctorAvatar } from "../utils/profileImage.js";

const router = Router();

const doctorInclude = {
  user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
};

const createDoctorSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
  specialization: z.string().min(2),
  qualification: z.string().optional(),
  experience: z.number().int().min(0).optional(),
  bio: z.string().max(2000).optional(),
  clinicName: z.string().max(200).optional(),
  address: z.string().max(500).optional(),
  profileImage: z.string().optional(),
});

const updateMyProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional().nullable(),
  specialization: z.string().min(2).optional(),
  qualification: z.string().optional().nullable(),
  experience: z.coerce.number().int().min(0).optional().nullable(),
  bio: z.string().max(2000).optional().nullable(),
  clinicName: z.string().max(200).optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  profileImage: z.string().optional().nullable(),
  removeProfileImage: z.boolean().optional(),
});

router.get("/", async (_req, res, next) => {
  try {
    const doctors = await prisma.doctor.findMany({
      where: { user: { isActive: true } },
      include: {
        ...doctorInclude,
        _count: { select: { appointments: true } },
      },
      orderBy: { user: { name: "asc" } },
    });
    res.json(doctors);
  } catch (e) {
    next(e);
  }
});

router.get(
  "/me",
  authenticate,
  authorize(Role.DOCTOR),
  async (req: AuthRequest, res, next) => {
    try {
      const doctor = await prisma.doctor.findFirst({
        where: { userId: req.user!.userId },
        include: doctorInclude,
      });
      if (!doctor) throw new AppError(404, "Doctor profile not found");
      res.json(doctor);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/me",
  authenticate,
  authorize(Role.DOCTOR),
  async (req: AuthRequest, res, next) => {
    try {
      const data = updateMyProfileSchema.parse(req.body);
      const doctor = await prisma.doctor.findFirst({
        where: { userId: req.user!.userId },
      });
      if (!doctor) throw new AppError(404, "Doctor profile not found");

      let profileImage: string | null | undefined = undefined;
      if (data.removeProfileImage) {
        profileImage = null;
      } else if (data.profileImage !== undefined) {
        const saved = await saveDoctorAvatar(
          req.user!.userId,
          data.profileImage ?? undefined
        );
        profileImage = saved ?? null;
      }

      const updated = await prisma.doctor.update({
        where: { id: doctor.id },
        data: {
          specialization: data.specialization,
          qualification: data.qualification,
          experience: data.experience ?? undefined,
          bio: data.bio,
          clinicName: data.clinicName,
          address: data.address,
          ...(profileImage !== undefined ? { profileImage } : {}),
          user: {
            update: {
              ...(data.name !== undefined ? { name: data.name } : {}),
              ...(data.phone !== undefined ? { phone: data.phone } : {}),
            },
          },
        },
        include: doctorInclude,
      });

      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

router.get("/:id", async (req, res, next) => {
  try {
    const doctor = await prisma.doctor.findUnique({
      where: { id: paramId(req) },
      include: {
        ...doctorInclude,
        schedules: true,
      },
    });
    if (!doctor) throw new AppError(404, "Doctor not found");
    res.json(doctor);
  } catch (e) {
    next(e);
  }
});

router.post(
  "/",
  authenticate,
  authorize(Role.DOCTOR),
  async (req: AuthRequest, res, next) => {
    try {
      const data = createDoctorSchema.parse(req.body);
      const existing = await prisma.user.findUnique({ where: { email: data.email } });
      if (existing) throw new AppError(409, "Email already exists");

      const hashed = await bcrypt.hash(data.password, 12);
      const doctor = await prisma.doctor.create({
        data: {
          specialization: data.specialization,
          qualification: data.qualification,
          experience: data.experience,
          bio: data.bio,
          clinicName: data.clinicName,
          address: data.address,
          profileImage: data.profileImage,
          user: {
            create: {
              name: data.name,
              email: data.email,
              phone: data.phone,
              password: hashed,
              role: Role.DOCTOR,
            },
          },
        },
        include: doctorInclude,
      });

      res.status(201).json(doctor);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/:id",
  authenticate,
  authorize(Role.DOCTOR),
  async (req, res, next) => {
    try {
      const schema = createDoctorSchema.partial().omit({ password: true, email: true });
      const data = schema.parse(req.body);

      const doctor = await prisma.doctor.findUnique({
        where: { id: paramId(req) },
        include: { user: true },
      });
      if (!doctor) throw new AppError(404, "Doctor not found");

      const updated = await prisma.doctor.update({
        where: { id: paramId(req) },
        data: {
          specialization: data.specialization,
          qualification: data.qualification,
          experience: data.experience,
          bio: data.bio,
          clinicName: data.clinicName,
          address: data.address,
          profileImage: data.profileImage,
          user: {
            update: {
              name: data.name,
              phone: data.phone,
            },
          },
        },
        include: doctorInclude,
      });

      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize(Role.DOCTOR),
  async (req, res, next) => {
    try {
      const doctor = await prisma.doctor.findUnique({ where: { id: paramId(req) } });
      if (!doctor) throw new AppError(404, "Doctor not found");

      await deactivateUser(doctor.userId);

      res.json({ message: "Doctor deactivated" });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
