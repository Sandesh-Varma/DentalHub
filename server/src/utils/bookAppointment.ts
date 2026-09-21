import { AppointmentStatus } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";
import { getDayOfWeekFromDate } from "./dayOfWeek.js";
import { parseLocalDate } from "./parseLocalDate.js";
import { dateRangeForKey, isFullDayBlocked, isSlotBlocked } from "./availability.js";
import { generateTimeSlots } from "./slots.js";

export type BookAppointmentInput = {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  startTime: string;
  reason?: string;
  bookedByUserId?: string;
};

export async function bookAppointment(data: BookAppointmentInput) {
  const appointmentDate = parseLocalDate(data.appointmentDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (appointmentDate < today) {
    throw new AppError(400, "Cannot book appointments in the past");
  }

  const patient = await prisma.patient.findUnique({ where: { id: data.patientId } });
  if (!patient) throw new AppError(404, "Patient not found");

  const dayOfWeek = getDayOfWeekFromDate(appointmentDate);
  const schedule = await prisma.schedule.findUnique({
    where: {
      doctorId_dayOfWeek: {
        doctorId: data.doctorId,
        dayOfWeek,
      },
    },
  });
  if (!schedule) throw new AppError(400, "Doctor is not available on this day");

  const dateKey = typeof data.appointmentDate === "string"
    ? data.appointmentDate
    : `${appointmentDate.getFullYear()}-${String(appointmentDate.getMonth() + 1).padStart(2, "0")}-${String(appointmentDate.getDate()).padStart(2, "0")}`;

  const blocks = await prisma.doctorUnavailability.findMany({
    where: { doctorId: data.doctorId, date: dateRangeForKey(dateKey) },
  });
  if (isFullDayBlocked(blocks)) {
    throw new AppError(400, "Doctor is not available on this date");
  }
  if (isSlotBlocked(data.startTime, blocks)) {
    throw new AppError(400, "Selected time slot is blocked");
  }

  const slots = generateTimeSlots(
    schedule.startTime,
    schedule.endTime,
    schedule.slotDuration
  );
  const slot = slots.find((s) => s.start === data.startTime);
  if (!slot) throw new AppError(400, "Selected time slot is unavailable");

  const conflict = await prisma.appointment.findFirst({
    where: {
      doctorId: data.doctorId,
      appointmentDate,
      startTime: data.startTime,
      status: { notIn: [AppointmentStatus.CANCELLED] },
    },
  });
  if (conflict) throw new AppError(409, "This slot is already booked");

  return prisma.appointment.create({
    data: {
      patientId: data.patientId,
      doctorId: data.doctorId,
      appointmentDate,
      startTime: slot.start,
      endTime: slot.end,
      reason: data.reason,
      status: AppointmentStatus.PENDING,
      bookedByUserId: data.bookedByUserId,
    },
    include: {
      patient: { include: { user: { select: { id: true, name: true, email: true } } } },
      doctor: { include: { user: { select: { name: true } } } },
    },
  });
}
