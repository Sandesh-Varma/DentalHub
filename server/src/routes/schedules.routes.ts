import { Router } from "express";
import { z } from "zod";
import { DayOfWeek, Role } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";
import { generateTimeSlots } from "../utils/slots.js";
import { getDayOfWeekFromDate } from "../utils/dayOfWeek.js";
import { parseLocalDate } from "../utils/parseLocalDate.js";
import {
  dateRangeForKey,
  dateToKey,
  isFullDayBlocked,
  isSlotBlocked,
  parseDateKey,
} from "../utils/availability.js";
import { paramId } from "../utils/params.js";

const router = Router();

const scheduleSchema = z.object({
  dayOfWeek: z.nativeEnum(DayOfWeek),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDuration: z.union([z.literal(15), z.literal(30), z.literal(60)]).default(30),
});

const weeklyTemplateSchema = z.object({
  days: z.array(z.nativeEnum(DayOfWeek)).min(1),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/),
  slotDuration: z.union([z.literal(15), z.literal(30), z.literal(60)]).default(30),
});

const unavailabilitySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  allDay: z.boolean().optional(),
  startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
});

async function assertDoctorAccess(req: AuthRequest, doctorId: string) {
  if (req.user!.role === Role.DOCTOR) {
    const doctor = await prisma.doctor.findFirst({
      where: { userId: req.user!.userId },
    });
    if (!doctor || doctor.id !== doctorId) {
      throw new AppError(403, "You can only manage your own schedule");
    }
  }
}

router.get("/doctor/:doctorId", async (req, res, next) => {
  try {
    const schedules = await prisma.schedule.findMany({
      where: { doctorId: paramId(req, "doctorId") },
      orderBy: { dayOfWeek: "asc" },
    });
    res.json(schedules);
  } catch (e) {
    next(e);
  }
});

router.get("/doctor/:doctorId/calendar", async (req, res, next) => {
  try {
    const doctorId = paramId(req, "doctorId");
    const month = (req.query.month as string) ?? new Date().toISOString().slice(0, 7);
    if (!/^\d{4}-\d{2}$/.test(month)) {
      throw new AppError(400, "month must be YYYY-MM");
    }

    const [year, mon] = month.split("-").map(Number);
    const rangeStart = new Date(year, mon - 1, 1);
    const rangeEnd = new Date(year, mon, 0);

    const [schedules, blocks] = await Promise.all([
      prisma.schedule.findMany({ where: { doctorId } }),
      prisma.doctorUnavailability.findMany({
        where: {
          doctorId,
          date: { gte: rangeStart, lte: rangeEnd },
        },
        orderBy: [{ date: "asc" }, { startTime: "asc" }],
      }),
    ]);

    res.json({
      month,
      schedules,
      unavailability: blocks.map((b) => ({
        id: b.id,
        date: dateToKey(b.date),
        startTime: b.startTime,
        endTime: b.endTime,
        allDay: b.startTime == null && b.endTime == null,
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/doctor/:doctorId/weekly-template",
  authenticate,
  authorize(Role.DOCTOR),
  async (req: AuthRequest, res, next) => {
    try {
      const doctorId = paramId(req, "doctorId");
      await assertDoctorAccess(req, doctorId);
      const data = weeklyTemplateSchema.parse(req.body);

      await prisma.$transaction([
        prisma.schedule.deleteMany({
          where: {
            doctorId,
            dayOfWeek: { notIn: data.days },
          },
        }),
        ...data.days.map((dayOfWeek) =>
          prisma.schedule.upsert({
            where: { doctorId_dayOfWeek: { doctorId, dayOfWeek } },
            create: {
              doctorId,
              dayOfWeek,
              startTime: data.startTime,
              endTime: data.endTime,
              slotDuration: data.slotDuration,
            },
            update: {
              startTime: data.startTime,
              endTime: data.endTime,
              slotDuration: data.slotDuration,
            },
          })
        ),
      ]);

      const schedules = await prisma.schedule.findMany({ where: { doctorId } });
      res.json(schedules);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  "/doctor/:doctorId/unavailability",
  authenticate,
  authorize(Role.DOCTOR),
  async (req: AuthRequest, res, next) => {
    try {
      const doctorId = paramId(req, "doctorId");
      await assertDoctorAccess(req, doctorId);
      const data = unavailabilitySchema.parse(req.body);
      const date = parseDateKey(data.date);

      if (data.allDay || (!data.startTime && !data.endTime)) {
        const range = dateRangeForKey(data.date);
        await prisma.doctorUnavailability.deleteMany({
          where: { doctorId, date: range },
        });
        const block = await prisma.doctorUnavailability.create({
          data: { doctorId, date: parseDateKey(data.date) },
        });
        return res.status(201).json({
          id: block.id,
          date: data.date,
          allDay: true,
          startTime: null,
          endTime: null,
        });
      }

      if (!data.startTime || !data.endTime) {
        throw new AppError(400, "startTime and endTime required for partial blocks");
      }

      const block = await prisma.doctorUnavailability.create({
        data: {
          doctorId,
          date,
          startTime: data.startTime,
          endTime: data.endTime,
        },
      });

      res.status(201).json({
        id: block.id,
        date: data.date,
        startTime: block.startTime,
        endTime: block.endTime,
        allDay: false,
      });
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/unavailability/:id",
  authenticate,
  authorize(Role.DOCTOR),
  async (req: AuthRequest, res, next) => {
    try {
      const block = await prisma.doctorUnavailability.findUnique({
        where: { id: paramId(req) },
      });
      if (!block) throw new AppError(404, "Block not found");
      await assertDoctorAccess(req, block.doctorId);
      await prisma.doctorUnavailability.delete({ where: { id: block.id } });
      res.json({ message: "Unavailable time removed" });
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/doctor/:doctorId/unavailability/day",
  authenticate,
  authorize(Role.DOCTOR),
  async (req: AuthRequest, res, next) => {
    try {
      const doctorId = paramId(req, "doctorId");
      await assertDoctorAccess(req, doctorId);
      const dateStr = req.query.date as string;
      if (!dateStr) throw new AppError(400, "date query required");
      const date = parseDateKey(dateStr);
      await prisma.doctorUnavailability.deleteMany({
        where: { doctorId, date: dateRangeForKey(dateStr) },
      });
      res.json({ message: "Day cleared" });
    } catch (e) {
      next(e);
    }
  }
);

router.get("/doctor/:doctorId/manage-slots", authenticate, authorize(Role.DOCTOR), async (req: AuthRequest, res, next) => {
  try {
    const doctorId = paramId(req, "doctorId");
    await assertDoctorAccess(req, doctorId);
    const dateStr = req.query.date as string;
    if (!dateStr) throw new AppError(400, "date query parameter is required");

    const date = parseDateKey(dateStr);
    const dayOfWeek = getDayOfWeekFromDate(parseLocalDate(dateStr));

    const [schedule, blocks] = await Promise.all([
      prisma.schedule.findUnique({
        where: { doctorId_dayOfWeek: { doctorId, dayOfWeek } },
      }),
      prisma.doctorUnavailability.findMany({
        where: { doctorId, date: dateRangeForKey(dateStr) },
      }),
    ]);

    if (!schedule) {
      return res.json({
        date: dateStr,
        hasSchedule: false,
        allDayBlocked: false,
        slots: [],
      });
    }

    const allDayBlocked = isFullDayBlocked(blocks);
    const allSlots = generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.slotDuration
    );

    res.json({
      date: dateStr,
      hasSchedule: true,
      allDayBlocked,
      slots: allSlots.map((slot) => ({
        ...slot,
        blocked: allDayBlocked || isSlotBlocked(slot.start, blocks),
        blockId: blocks.find((b) => b.startTime === slot.start)?.id ?? null,
      })),
    });
  } catch (e) {
    next(e);
  }
});

router.get("/doctor/:doctorId/slots", async (req, res, next) => {
  try {
    const dateStr = req.query.date as string;
    if (!dateStr) throw new AppError(400, "date query parameter is required");

    const localDate = parseLocalDate(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (localDate < today) throw new AppError(400, "Cannot book past dates");

    const doctorId = paramId(req, "doctorId");
    const dayOfWeek = getDayOfWeekFromDate(localDate);

    const [schedule, blocks, booked] = await Promise.all([
      prisma.schedule.findUnique({
        where: { doctorId_dayOfWeek: { doctorId, dayOfWeek } },
      }),
      prisma.doctorUnavailability.findMany({
        where: { doctorId, date: dateRangeForKey(dateStr) },
      }),
      prisma.appointment.findMany({
        where: {
          doctorId,
          appointmentDate: localDate,
          status: { notIn: ["CANCELLED"] },
        },
        select: { startTime: true },
      }),
    ]);

    if (!schedule) {
      return res.json({ slots: [], available: [], reason: "NO_REGULAR_HOURS" });
    }

    if (isFullDayBlocked(blocks)) {
      return res.json({ slots: [], available: [], reason: "DAY_BLOCKED" });
    }

    const allSlots = generateTimeSlots(
      schedule.startTime,
      schedule.endTime,
      schedule.slotDuration
    );

    const bookedSet = new Set(booked.map((b) => b.startTime));
    const available = allSlots.filter(
      (s) => !bookedSet.has(s.start) && !isSlotBlocked(s.start, blocks)
    );

    res.json({ slots: allSlots, available });
  } catch (e) {
    next(e);
  }
});

router.post(
  "/doctor/:doctorId",
  authenticate,
  authorize(Role.DOCTOR, Role.RECEPTIONIST),
  async (req: AuthRequest, res, next) => {
    try {
      const data = scheduleSchema.parse(req.body);
      const doctorId = paramId(req, "doctorId");
      await assertDoctorAccess(req, doctorId);

      const schedule = await prisma.schedule.upsert({
        where: {
          doctorId_dayOfWeek: { doctorId, dayOfWeek: data.dayOfWeek },
        },
        create: { doctorId, ...data },
        update: data,
      });

      res.json(schedule);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/:id",
  authenticate,
  authorize(Role.DOCTOR, Role.RECEPTIONIST),
  async (req: AuthRequest, res, next) => {
    try {
      await prisma.schedule.delete({ where: { id: paramId(req) } });
      res.json({ message: "Schedule removed" });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
