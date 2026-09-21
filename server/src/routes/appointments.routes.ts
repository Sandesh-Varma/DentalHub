import { Router } from "express";
import { z } from "zod";
import { AppointmentStatus, Role } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";
import { createNotification } from "../services/notification.service.js";
import { bookAppointment } from "../utils/bookAppointment.js";
import { parseLocalDate } from "../utils/parseLocalDate.js";
import { paramId } from "../utils/params.js";

const router = Router();

const bookSchema = z
  .object({
    doctorId: z.string().uuid().optional(),
    dentistId: z.string().uuid().optional(),
    appointmentDate: z.coerce.date(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/),
    reason: z.string().min(3).optional(),
    patientId: z.string().uuid().optional(),
  })
  .refine((d) => d.doctorId ?? d.dentistId, {
    message: "doctorId is required",
    path: ["doctorId"],
  });

const statusSchema = z.object({
  status: z.nativeEnum(AppointmentStatus),
});

async function notifyStaffNewAppointment() {
  const staff = await prisma.user.findMany({
    where: {
      role: { in: [Role.RECEPTIONIST, Role.DOCTOR] },
      isActive: true,
    },
    select: { id: true },
  });
  for (const user of staff) {
    await createNotification(
      user.id,
      "New Appointment",
      "A new appointment has been scheduled."
    );
  }
}

router.get("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const { role, userId } = req.user!;
    let where = {};

    if (role === Role.PATIENT) {
      const patient = await prisma.patient.findFirst({ where: { userId } });
      if (!patient) throw new AppError(404, "Patient not found");
      where = { patientId: patient.id };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      include: {
        patient: { include: { user: { select: { id: true, name: true, email: true, phone: true } } } },
        doctor: { include: { user: { select: { id: true, name: true } } } },
      },
      orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
    });

    res.json(appointments);
  } catch (e) {
    next(e);
  }
});

router.post("/", authenticate, async (req: AuthRequest, res, next) => {
  try {
    const data = bookSchema.parse(req.body);
    const { role, userId } = req.user!;

    let patientId: string;

    if (role === Role.PATIENT) {
      const patient = await prisma.patient.findFirst({ where: { userId } });
      if (!patient) throw new AppError(404, "Patient profile not found");
      patientId = patient.id;
    } else if (role === Role.DOCTOR || role === Role.RECEPTIONIST) {
      if (!data.patientId) throw new AppError(400, "patientId is required when booking for a patient");
      patientId = data.patientId;
    } else {
      throw new AppError(403, "Insufficient permissions");
    }

    const doctorId = data.doctorId ?? data.dentistId!;
    const bookedByUserId =
      role === Role.PATIENT ? undefined : userId;

    const appointment = await bookAppointment({
      patientId,
      doctorId,
      appointmentDate: parseLocalDate(data.appointmentDate),
      startTime: data.startTime,
      reason: data.reason,
      bookedByUserId,
    });

    const patientUser = await prisma.patient.findUnique({
      where: { id: patientId },
      select: { userId: true },
    });

    if (patientUser) {
      await createNotification(
        patientUser.userId,
        "Appointment Scheduled",
        role === Role.PATIENT
          ? "Your appointment request has been submitted."
          : "An appointment has been scheduled for you."
      );
    }

    await notifyStaffNewAppointment();

    res.status(201).json(appointment);
  } catch (e) {
    next(e);
  }
});

router.patch(
  "/:id/status",
  authenticate,
  authorize(Role.DOCTOR, Role.RECEPTIONIST),
  async (req: AuthRequest, res, next) => {
    try {
      const { status } = statusSchema.parse(req.body);
      const appointment = await prisma.appointment.findUnique({
        where: { id: paramId(req) },
        include: {
          patient: { include: { user: true } },
          doctor: { include: { user: true } },
        },
      });
      if (!appointment) throw new AppError(404, "Appointment not found");

      const updated = await prisma.appointment.update({
        where: { id: paramId(req) },
        data: { status },
        include: {
          patient: { include: { user: { select: { id: true, name: true } } } },
          doctor: { include: { user: { select: { name: true } } } },
        },
      });

      const messages: Partial<Record<AppointmentStatus, { title: string; message: string }>> = {
        CONFIRMED: {
          title: "Appointment Confirmed",
          message: "Your appointment is confirmed.",
        },
        CANCELLED: {
          title: "Appointment Cancelled",
          message: "Your appointment has been cancelled.",
        },
        COMPLETED: {
          title: "Appointment Completed",
          message: "Your visit has been marked as completed.",
        },
      };

      const notification = messages[status];
      if (notification) {
        await createNotification(
          appointment.patient.user.id,
          notification.title,
          notification.message
        );
      }

      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

router.patch(
  "/:id/cancel",
  authenticate,
  async (req: AuthRequest, res, next) => {
    try {
      const { role, userId } = req.user!;
      const appointment = await prisma.appointment.findUnique({
        where: { id: paramId(req) },
        include: { patient: true },
      });
      if (!appointment) throw new AppError(404, "Appointment not found");

      if (appointment.status === AppointmentStatus.COMPLETED) {
        throw new AppError(400, "Cannot cancel a completed appointment");
      }

      if (role === Role.PATIENT) {
        const patient = await prisma.patient.findFirst({ where: { userId } });
        if (!patient || patient.id !== appointment.patientId) {
          throw new AppError(403, "Not your appointment");
        }
      } else if (role !== Role.DOCTOR && role !== Role.RECEPTIONIST) {
        throw new AppError(403, "Insufficient permissions");
      }

      const updated = await prisma.appointment.update({
        where: { id: paramId(req) },
        data: { status: AppointmentStatus.CANCELLED },
      });

      await createNotification(
        appointment.patient.userId,
        "Appointment Cancelled",
        "Your appointment has been cancelled."
      );

      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

export default router;
