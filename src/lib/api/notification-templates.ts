import { prisma } from "@/lib/prisma";
import type { NotificationTemplate } from "@prisma/client";

export async function getNotificationTemplates(): Promise<
  NotificationTemplate[]
> {
  return prisma.notificationTemplate.findMany({
    orderBy: { createdAt: "desc" },
  });
}

export async function createNotificationTemplate(data: {
  title: string;
  message: string;
}): Promise<NotificationTemplate> {
  return prisma.notificationTemplate.create({
    data,
  });
}

export async function updateNotificationTemplate(
  id: string,
  data: {
    title?: string;
    message?: string;
  },
): Promise<NotificationTemplate> {
  return prisma.notificationTemplate.update({
    where: { id },
    data,
  });
}

export async function deleteNotificationTemplate(id: string): Promise<void> {
  await prisma.notificationTemplate.delete({
    where: { id },
  });
}
