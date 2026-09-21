import { prisma } from "../lib/prisma.js";
import { AppError } from "../middleware/error.js";

const authUserSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  phone: true,
  isActive: true,
  patient: true,
  isClinicOwner: true,
  doctor: true,
} as const;

export async function getAuthUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: authUserSelect,
  });

  if (!user || !user.isActive) {
    throw new AppError(401, "User not found");
  }

  return user;
}
