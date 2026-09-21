import { Router } from "express";
import { AppointmentStatus, Role } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";

const router = Router();

router.use(authenticate);

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfMonth() {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const { role, userId } = req.user!;
    const todayStart = startOfToday();
    const todayEnd = endOfToday();

    if (role === Role.PATIENT) {
      const patient = await prisma.patient.findFirst({ where: { userId } });
      if (!patient) throw new AppError(404, "Patient not found");

      const [upcoming, past, unreadCount] = await Promise.all([
        prisma.appointment.findMany({
          where: {
            patientId: patient.id,
            appointmentDate: { gte: todayStart },
            status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
          },
          include: { doctor: { include: { user: { select: { name: true } } } } },
          orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
          take: 5,
        }),
        prisma.appointment.count({
          where: {
            patientId: patient.id,
            OR: [
              { appointmentDate: { lt: todayStart } },
              { status: AppointmentStatus.COMPLETED },
            ],
          },
        }),
        prisma.notification.count({
          where: { userId, isRead: false },
        }),
      ]);

      return res.json({
        role,
        stats: { upcomingCount: upcoming.length, pastCount: past, unreadCount },
        upcoming,
      });
    }

    if (role === Role.DOCTOR) {
      const doctor = await prisma.doctor.findFirst({ where: { userId } });
      const [todayAppointments, pendingCount, upcoming] = await Promise.all([
        prisma.appointment.findMany({
          where: {
            appointmentDate: { gte: todayStart, lte: todayEnd },
            status: { not: AppointmentStatus.CANCELLED },
          },
          include: { patient: { include: { user: { select: { name: true } } } } },
          orderBy: { startTime: "asc" },
        }),
        prisma.appointment.count({
          where: { status: AppointmentStatus.PENDING },
        }),
        prisma.appointment.findMany({
          where: {
            appointmentDate: { gte: todayStart },
            status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
          },
          take: 8,
          orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
          include: {
            patient: { include: { user: { select: { name: true } } } },
            doctor: { include: { user: { select: { name: true } } } },
          },
        }),
      ]);

      return res.json({
        role,
        stats: {
          todayCount: todayAppointments.length,
          pendingCount,
          upcomingCount: upcoming.length,
          hasProfile: !!doctor,
        },
        todayAppointments,
        upcoming,
      });
    }

    if (role === Role.RECEPTIONIST) {
      const [pendingCount, todayAppointments, upcoming, totalPatients] = await Promise.all([
        prisma.appointment.count({ where: { status: AppointmentStatus.PENDING } }),
        prisma.appointment.findMany({
          where: {
            appointmentDate: { gte: todayStart, lte: todayEnd },
            status: { not: AppointmentStatus.CANCELLED },
          },
          include: {
            patient: { include: { user: { select: { name: true } } } },
            doctor: { include: { user: { select: { name: true } } } },
          },
          orderBy: { startTime: "asc" },
        }),
        prisma.appointment.findMany({
          where: {
            appointmentDate: { gte: todayStart },
            status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
          },
          take: 10,
          orderBy: [{ appointmentDate: "asc" }, { startTime: "asc" }],
          include: {
            patient: { include: { user: { select: { name: true } } } },
            doctor: { include: { user: { select: { name: true } } } },
          },
        }),
        prisma.patient.count({
          where: {
            user: {
              role: Role.PATIENT,
            },
          },
        }),
      ]);

      return res.json({
        role,
        stats: { pendingCount, todayCount: todayAppointments.length, upcomingCount: upcoming.length, totalPatients },
        todayAppointments,
        upcoming,
      });
    }

    throw new AppError(400, "Unknown role");
  } catch (e) {
    next(e);
  }
});

router.get("/growth", authorize(Role.DOCTOR), async (_req, res, next) => {
  try {
    const monthStart = startOfMonth();
    const todayStart = startOfToday();

    const [
      totalPatients,
      newPatientsThisMonth,
      totalAppointments,
      completedThisMonth,
      cancelledThisMonth,
      pendingCount,
      appointmentsByStatus,
      employeeCount,
    ] = await Promise.all([
      prisma.patient.count({
        where: {
          user: {
            role: Role.PATIENT,
          },
        },
      }),
      prisma.patient.count({
        where: {
          user: {
            role: Role.PATIENT,
            createdAt: { gte: monthStart },
          },
        },
      }),
      prisma.appointment.count(),
      prisma.appointment.count({
        where: {
          status: AppointmentStatus.COMPLETED,
          updatedAt: { gte: monthStart },
        },
      }),
      prisma.appointment.count({
        where: {
          status: AppointmentStatus.CANCELLED,
          updatedAt: { gte: monthStart },
        },
      }),
      prisma.appointment.count({ where: { status: AppointmentStatus.PENDING } }),
      prisma.appointment.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
      prisma.user.count({ where: { role: Role.RECEPTIONIST, isActive: true } }),
    ]);

    const last6Months: { month: string; patients: number; appointments: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const start = new Date();
      start.setMonth(start.getMonth() - i, 1);
      start.setHours(0, 0, 0, 0);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);

      const [patients, appointments] = await Promise.all([
        prisma.patient.count({
          where: {
            user: {
              role: Role.PATIENT,
              createdAt: { gte: start, lt: end },
            },
          },
        }),
        prisma.appointment.count({
          where: { createdAt: { gte: start, lt: end } },
        }),
      ]);

      last6Months.push({
        month: start.toLocaleString("en-US", { month: "short", year: "2-digit" }),
        patients,
        appointments,
      });
    }

    const upcomingWeek = await prisma.appointment.count({
      where: {
        appointmentDate: { gte: todayStart },
        status: { in: [AppointmentStatus.PENDING, AppointmentStatus.CONFIRMED] },
      },
    });

    const completionRate =
      completedThisMonth + cancelledThisMonth > 0
        ? Math.round(
            (completedThisMonth / (completedThisMonth + cancelledThisMonth)) * 100
          )
        : 100;

    res.json({
      stats: {
        totalPatients,
        newPatientsThisMonth,
        totalAppointments,
        completedThisMonth,
        cancelledThisMonth,
        pendingCount,
        upcomingWeek,
        employeeCount,
        completionRate,
      },
      appointmentsByStatus: appointmentsByStatus.map((row) => ({
        status: row.status,
        count: row._count._all,
      })),
      last6Months,
    });
  } catch (e) {
    next(e);
  }
});

export default router;
