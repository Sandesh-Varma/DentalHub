import { Router } from "express";
import { z } from "zod";
import { Gender, Role } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";
import { paramId } from "../utils/params.js";
import { deactivateUser } from "../utils/deactivateUser.js";

const router = Router();

const updatePatientSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().optional(),
  dob: z.coerce.date().optional(),
  gender: z.nativeEnum(Gender).optional(),
  address: z.string().optional(),
  emergencyContact: z.string().optional(),
});

router.get(
  "/",
  authenticate,
  authorize(Role.DOCTOR, Role.RECEPTIONIST),
  async (_req, res, next) => {
    try {
      const patients = await prisma.patient.findMany({
        where: {
          user: {
            role: Role.PATIENT,
          },
        },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
          _count: { select: { appointments: true } },
        },
        orderBy: { user: { name: "asc" } },
      });
      res.json(patients);
    } catch (e) {
      next(e);
    }
  }
);

router.get("/me", authenticate, authorize(Role.PATIENT), async (req: AuthRequest, res, next) => {
  try {
    let patient = await prisma.patient.findFirst({
      where: { userId: req.user!.userId },
      include: {
        user: { select: { id: true, name: true, email: true, phone: true } },
        appointments: {
          include: {
            doctor: { include: { user: { select: { name: true } } } },
          },
          orderBy: { appointmentDate: "desc" },
        },
      },
    });

    if (!patient) {
      patient = await prisma.patient.create({
        data: { userId: req.user!.userId },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true } },
          appointments: {
            include: {
              doctor: { include: { user: { select: { name: true } } } },
            },
            orderBy: { appointmentDate: "desc" },
          },
        },
      });
    }

    res.json(patient);
  } catch (e) {
    next(e);
  }
});

router.patch("/me", authenticate, authorize(Role.PATIENT), async (req: AuthRequest, res, next) => {
  try {
    const data = updatePatientSchema.parse(req.body);
    const patient = await prisma.patient.findFirst({
      where: { userId: req.user!.userId },
    });
    if (!patient) throw new AppError(404, "Patient profile not found");

    const updated = await prisma.patient.update({
      where: { id: patient.id },
      data: {
        dob: data.dob,
        gender: data.gender,
        address: data.address,
        emergencyContact: data.emergencyContact,
        user: {
          update: { name: data.name, phone: data.phone },
        },
      },
      include: { user: { select: { id: true, name: true, email: true, phone: true } } },
    });

    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.get(
  "/:id",
  authenticate,
  authorize(Role.DOCTOR, Role.RECEPTIONIST),
  async (req, res, next) => {
    try {
      const patient = await prisma.patient.findUnique({
        where: { id: paramId(req) },
        include: {
          user: { select: { id: true, name: true, email: true, phone: true, isActive: true } },
          appointments: {
            include: {
              doctor: { include: { user: { select: { name: true } } } },
            },
            orderBy: { appointmentDate: "desc" },
          },
        },
      });
      if (!patient) throw new AppError(404, "Patient not found");
      res.json(patient);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/:id/deactivate",
  authenticate,
  authorize(Role.DOCTOR, Role.RECEPTIONIST),
  async (req, res, next) => {
    try {
      const patient = await prisma.patient.findUnique({ where: { id: paramId(req) } });
      if (!patient) throw new AppError(404, "Patient not found");

      await deactivateUser(patient.userId);

      res.json({ message: "Patient deactivated" });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
