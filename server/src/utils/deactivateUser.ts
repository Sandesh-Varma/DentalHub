import { prisma } from "../lib/prisma.js";

export async function deactivateUser(userId: string) {
  await prisma.user.update({
    where: { id: userId },
    data: { isActive: false },
  });
}
