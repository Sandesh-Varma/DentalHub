import { prisma } from "../lib/prisma.js";
import type { Server } from "socket.io";

let io: Server | null = null;

export function setNotificationIo(server: Server) {
  io = server;
}

export async function createNotification(
  userId: string,
  title: string,
  message: string
) {
  const notification = await prisma.notification.create({
    data: { userId, title, message },
  });

  io?.to(`user:${userId}`).emit("notification:new", notification);
  return notification;
}
