import "dotenv/config";
import bcrypt from "bcryptjs";
import { Role } from "../generated/prisma/client.js";
import { prisma } from "../src/lib/prisma.js";

async function main() {
  const doctorEmail = process.env.SEED_DOCTOR_EMAIL ?? "doctor@dentflow.com";
  const doctorPassword = process.env.SEED_DOCTOR_PASSWORD ?? "Doctor@12345";
  const doctorName = process.env.SEED_DOCTOR_NAME ?? "Dr. Clinic Owner";

  const existing = await prisma.user.findUnique({
    where: { email: doctorEmail },
    include: { doctor: true },
  });

  if (existing?.doctor) {
    console.log("Clinic owner already exists:", doctorEmail);
    return;
  }

  if (existing && !existing.doctor) {
    const hashed = await bcrypt.hash(doctorPassword, 12);
    await prisma.doctor.create({
      data: {
        specialization: "General Dentistry",
        qualification: "DDS",
        experience: 10,
        user: {
          connect: { id: existing.id },
        },
      },
    });
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        role: Role.DOCTOR,
        isClinicOwner: true,
        password: hashed,
        name: doctorName,
      },
    });
    console.log("Linked doctor profile to existing user:", doctorEmail);
    return;
  }

  const hashed = await bcrypt.hash(doctorPassword, 12);

  await prisma.doctor.create({
    data: {
      specialization: "General Dentistry",
      qualification: "DDS",
      experience: 10,
      user: {
        create: {
          name: doctorName,
          email: doctorEmail,
          password: hashed,
          role: Role.DOCTOR,
          isClinicOwner: true,
          phone: "+1-555-0200",
        },
      },
    },
  });

  console.log("--- Clinic owner (doctor) seeded ---");
  console.log("Staff login: http://localhost:5173/clinic/login");
  console.log("Email:   ", doctorEmail);
  console.log("Password:", doctorPassword);
  console.log("(Set SEED_DOCTOR_EMAIL / SEED_DOCTOR_PASSWORD in .env to customize)");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
