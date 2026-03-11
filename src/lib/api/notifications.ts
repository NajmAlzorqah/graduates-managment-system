import { prisma } from "@/lib/prisma";
import type { Notification } from "@/types/notification";

export async function getNotifications(
  userId: string,
): Promise<Notification[]> {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return notifications.map((n) => ({
    id: n.id,
    userId: n.userId,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    sentById: n.sentById,
    createdAt: n.createdAt,
  }));
}

export async function getUnreadCount(userId: string): Promise<number> {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
}

export async function createNotification(
  senderId: string,
  userId: string,
  title: string,
  message: string,
): Promise<Notification> {
  const n = await prisma.notification.create({
    data: { userId, title, message, sentById: senderId },
  });

  return {
    id: n.id,
    userId: n.userId,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    sentById: n.sentById,
    createdAt: n.createdAt,
  };
}

export async function createGroupNotification(
  senderId: string,
  userIds: string[],
  title: string,
  message: string,
): Promise<number> {
  const result = await prisma.notification.createMany({
    data: userIds.map((userId) => ({
      userId,
      title,
      message,
      sentById: senderId,
    })),
  });
  return result.count;
}

export async function markAsRead(notificationId: string): Promise<void> {
  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
}

export async function markAllAsRead(userId: string): Promise<void> {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
}

export async function getSystemNotificationStats(): Promise<{
  unreadCount: number;
  totalCount: number;
}> {
  const [unreadCount, totalCount] = await Promise.all([
    prisma.notification.count({ where: { isRead: false } }),
    prisma.notification.count(),
  ]);

  return { unreadCount, totalCount };
}
