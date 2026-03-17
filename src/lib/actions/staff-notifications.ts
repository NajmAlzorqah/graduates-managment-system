"use server";

import { revalidatePath } from "next/cache";
import {
  createGroupNotification,
  createNotification,
  deleteAllNotifications,
  deleteNotification,
} from "@/lib/api/notifications";
import {
  getAllApprovedStudentIds,
  getFilteredStudentsCount,
  getStudentIdsByFilter,
} from "@/lib/api/students";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createNotificationSchema } from "@/lib/validations/notification";

type ActionResult = { success: true } | { success: false; error: string };

export async function createNotificationAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return { success: false, error: "Unauthorized" };
  }

  const rawData = {
    title: formData.get("title"),
    message: formData.get("message"),
    userId: formData.get("userId") || undefined,
    // For group notifications, you might get an array of userIds
    userIds: formData.getAll("userIds").length
      ? formData.getAll("userIds")
      : undefined,
  };

  const parsed = createNotificationSchema.safeParse(rawData);

  if (!parsed.success) {
    return { success: false, error: "Invalid data" };
  }

  const { title, message, userId, userIds } = parsed.data;

  try {
    if (userId) {
      await createNotification(session.user.id, userId, title, message);
    } else if (userIds) {
      await createGroupNotification(session.user.id, userIds, title, message);
    }
    revalidatePath("/staff/notifications");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (_error) {
    return { success: false, error: "Failed to create notification" };
  }
}

export type SendNotificationData = {
  title: string;
  message: string;
  recipientType: "all" | "group" | "single";
  major?: string;
  graduationYear?: number;
  status?: "active" | "graduated" | "all";
  studentId?: string;
};

export async function sendNewNotificationAction(
  data: SendNotificationData,
): Promise<ActionResult> {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return { success: false, error: "Unauthorized" };
  }

  const {
    title,
    message,
    recipientType,
    major,
    graduationYear,
    status,
    studentId,
  } = data;

  if (!title.trim() || !message.trim()) {
    return { success: false, error: "العنوان والرسالة مطلوبان" };
  }

  const senderId = session.user.id;

  try {
    if (recipientType === "all") {
      const ids = await getAllApprovedStudentIds();
      if (ids.length > 0) {
        await createGroupNotification(senderId, ids, title, message);
      }
    } else if (recipientType === "group") {
      const ids = await getStudentIdsByFilter(
        major || undefined,
        graduationYear,
        status === "all" ? undefined : status,
      );
      if (ids.length === 0) {
        return { success: false, error: "لا يوجد طلاب في هذه المجموعة" };
      }
      await createGroupNotification(senderId, ids, title, message);
    } else if (recipientType === "single") {
      if (!studentId) {
        return { success: false, error: "يرجى تحديد طالب" };
      }
      await createNotification(senderId, studentId, title, message);
    }

    revalidatePath("/staff/notifications");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (error) {
    console.error("Error sending notification:", error);
    return { success: false, error: "فشل في إرسال الإشعار" };
  }
}

export async function getRecipientCountAction(filter: {
  major?: string;
  graduationYear?: number;
  status?: "active" | "graduated" | "all";
  recipientType: "all" | "group" | "single";
  studentId?: string;
}): Promise<number> {
  if (filter.recipientType === "all") {
    return prisma.user.count({ where: { role: "STUDENT", isApproved: true } });
  }

  if (filter.recipientType === "single") {
    return filter.studentId ? 1 : 0;
  }

  return getFilteredStudentsCount(filter);
}

export async function deleteNotificationAction(
  id: string,
): Promise<ActionResult> {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deleteNotification(id);
    revalidatePath("/staff/notifications");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (_error) {
    return { success: false, error: "Failed to delete notification" };
  }
}

export async function deleteAllNotificationsAction(): Promise<ActionResult> {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deleteAllNotifications();
    revalidatePath("/staff/notifications");
    revalidatePath("/admin/notifications");
    return { success: true };
  } catch (_error) {
    return { success: false, error: "Failed to clear notifications" };
  }
}
