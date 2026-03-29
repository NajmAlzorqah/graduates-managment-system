import { prisma } from "@/lib/prisma";
import type { Notification, NotificationWithUsers } from "@/types/notification";

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
    status: n.status,
    sentById: n.sentById,
    createdAt: n.createdAt,
  }));
}

export async function getOutgoingNotifications(
  senderId: string,
): Promise<NotificationWithUsers[]> {
  const notifications = await prisma.notification.findMany({
    where: { sentById: senderId },
    include: {
      user: {
        select: {
          nameAr: true,
          role: true,
        },
      },
      sentBy: {
        select: {
          nameAr: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return notifications as NotificationWithUsers[];
}

export async function getIncomingNotifications(
  userId: string,
): Promise<NotificationWithUsers[]> {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    include: {
      user: {
        select: {
          nameAr: true,
          role: true,
        },
      },
      sentBy: {
        select: {
          nameAr: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return notifications as NotificationWithUsers[];
}

export async function getNotificationsWithUsers(): Promise<
  NotificationWithUsers[]
> {
  const notifications = await prisma.notification.findMany({
    include: {
      user: {
        select: {
          nameAr: true,
          role: true,
        },
      },
      sentBy: {
        select: {
          nameAr: true,
          role: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalStudents = await prisma.user.count({
    where: { role: "STUDENT", isApproved: true },
  });

  // Group notifications by (title, message, sentById, createdAt_rounded_to_minute)
  const groups: Record<string, NotificationWithUsers[]> = {};

  for (const n of notifications) {
    const dateKey = new Date(n.createdAt).toISOString().slice(0, 16); // Round to minute
    const key = `${n.title}|${n.message}|${n.sentById}|${dateKey}`;
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(n as NotificationWithUsers);
  }

  const result: NotificationWithUsers[] = [];

  for (const key in groups) {
    const group = groups[key];
    if (group.length > 1) {
      const base = group[0];
      const isAll = group.length >= totalStudents && totalStudents > 0;

      result.push({
        ...base,
        user: {
          nameAr: isAll
            ? "الكل (Sent to all)"
            : `مجموعة (${group.length} طلاب)`,
          role: isAll ? "ALL" : "GROUP",
        },
      });
    } else {
      // Add them individually
      result.push(...group);
    }
  }

  // Re-sort by createdAt desc
  return result.sort(
    (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
  ) as NotificationWithUsers[];
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
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { role: true },
  });

  if (!sender || (sender.role !== "ADMIN" && sender.role !== "STAFF")) {
    throw new Error("Only Admin or Staff can send notifications");
  }

  const n = await prisma.notification.create({
    data: { userId, title, message, sentById: senderId },
  });

  return {
    id: n.id,
    userId: n.userId,
    title: n.title,
    message: n.message,
    isRead: n.isRead,
    status: n.status,
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
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { role: true },
  });

  if (!sender || (sender.role !== "ADMIN" && sender.role !== "STAFF")) {
    throw new Error("Only Admin or Staff can send notifications");
  }

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

export async function deleteNotification(
  notificationId: string,
): Promise<void> {
  await prisma.notification.delete({
    where: { id: notificationId },
  });
}

export async function deleteAllUserNotifications(
  userId: string,
): Promise<void> {
  await prisma.notification.deleteMany({
    where: { userId },
  });
}

export async function deleteAllNotifications(): Promise<void> {
  await prisma.notification.deleteMany();
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
