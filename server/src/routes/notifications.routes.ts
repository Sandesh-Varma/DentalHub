import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { AppError } from "../middleware/error.js";
import { paramId } from "../utils/params.js";

const router = Router();

router.use(authenticate);

router.get("/", async (req: AuthRequest, res, next) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.userId },
      orderBy: { createdAt: "desc" },
    });
    const unreadCount = notifications.filter((n) => !n.isRead).length;
    res.json({ notifications, unreadCount });
  } catch (e) {
    next(e);
  }
});

router.patch("/:id/read", async (req: AuthRequest, res, next) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: paramId(req), userId: req.user!.userId },
    });
    if (!notification) throw new AppError(404, "Notification not found");

    const updated = await prisma.notification.update({
      where: { id: paramId(req) },
      data: { isRead: true },
    });
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

router.patch("/read-all", async (req: AuthRequest, res, next) => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.userId, isRead: false },
      data: { isRead: true },
    });
    res.json({ message: "All notifications marked as read" });
  } catch (e) {
    next(e);
  }
});

router.delete("/:id", async (req: AuthRequest, res, next) => {
  try {
    const notification = await prisma.notification.findFirst({
      where: { id: paramId(req), userId: req.user!.userId },
    });
    if (!notification) throw new AppError(404, "Notification not found");

    await prisma.notification.delete({ where: { id: paramId(req) } });
    res.json({ message: "Notification deleted" });
  } catch (e) {
    next(e);
  }
});

export default router;
