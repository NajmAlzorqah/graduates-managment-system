"use server";

import { revalidatePath } from "next/cache";
import {
  createNotificationTemplate,
  deleteNotificationTemplate,
  updateNotificationTemplate,
} from "@/lib/api/notification-templates";
import { auth } from "@/lib/auth";

type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

export async function createTemplateAction(data: {
  title: string;
  message: string;
}): Promise<ActionResult<any>> {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const template = await createNotificationTemplate(data);
    revalidatePath("/admin/notifications/new");
    revalidatePath("/staff/notifications/new");
    return { success: true, data: template };
  } catch (error) {
    console.error("Error creating template:", error);
    return { success: false, error: "فشل في إنشاء القالب" };
  }
}

export async function updateTemplateAction(
  id: string,
  data: {
    title?: string;
    message?: string;
  },
): Promise<ActionResult> {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await updateNotificationTemplate(id, data);
    revalidatePath("/admin/notifications/new");
    revalidatePath("/staff/notifications/new");
    return { success: true };
  } catch (error) {
    console.error("Error updating template:", error);
    return { success: false, error: "فشل في تحديث القالب" };
  }
}

export async function deleteTemplateAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "ADMIN" && session.user.role !== "STAFF")
  ) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await deleteNotificationTemplate(id);
    revalidatePath("/admin/notifications/new");
    revalidatePath("/staff/notifications/new");
    return { success: true };
  } catch (error) {
    console.error("Error deleting template:", error);
    return { success: false, error: "فشل في حذف القالب" };
  }
}
