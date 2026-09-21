import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { Role } from "../../generated/prisma/client.js";
import { prisma } from "../lib/prisma.js";
import { authenticate, authorize, type AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";
import { paramId } from "../utils/params.js";
import { deactivateUser } from "../utils/deactivateUser.js";

const router = Router();

const createEmployeeSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  password: z.string().min(8),
});

router.use(authenticate, authorize(Role.DOCTOR));

router.get("/", async (_req, res, next) => {
  try {
    const employees = await prisma.user.findMany({
      where: { role: Role.RECEPTIONIST },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });
    res.json(employees);
  } catch (e) {
    next(e);
  }
});

router.post("/", async (req: AuthRequest, res, next) => {
  try {
    const owner = await prisma.user.findFirst({
      where: {
        id: req.user!.userId,
        role: Role.DOCTOR,
        isClinicOwner: true,
        isActive: true,
      },
    });
    if (!owner) throw new AppError(403, "Only the clinic owner can add employees");

    const data = createEmployeeSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new AppError(409, "Email already exists");

    const hashed = await bcrypt.hash(data.password, 12);
    const employee = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: hashed,
        role: Role.RECEPTIONIST,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isActive: true,
        createdAt: true,
      },
    });

    res.status(201).json(employee);
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/deactivate", async (req, res, next) => {
  try {
    const employee = await prisma.user.findFirst({
      where: { id: paramId(req), role: Role.RECEPTIONIST },
    });
    if (!employee) throw new AppError(404, "Employee not found");

    await deactivateUser(employee.id);

    res.json({ message: "Employee deactivated" });
  } catch (e) {
    next(e);
  }
});

export default router;
