"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  changeEmailSchema,
  changePasswordSchema,
  updateUserSettingsSchema,
} from "../validations/student-settings";

export async function updateUserSettingsAction(data: {
  emailNotifications?: boolean;
  siteNotifications?: boolean;
  language?: "ar" | "en";
  theme?: "light" | "dark";
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "غير مصرح" };

  const parsed = updateUserSettingsSchema.safeParse(data);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: parsed.data,
    });

    revalidatePath("/student/settings");
    return { success: true };
  } catch (error) {
    console.error("Error updating settings:", error);
    return { error: "حدث خطأ أثناء تحديث الإعدادات" };
  }
}

export async function changePasswordAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "غير مصرح" };

  const raw = {
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = changePasswordSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });

    if (!user) return { error: "المستخدم غير موجود" };

    const isMatch = await bcrypt.compare(
      parsed.data.currentPassword,
      user.passwordHash,
    );
    if (!isMatch) return { error: "كلمة المرور الحالية غير صحيحة" };

    const passwordHash = await bcrypt.hash(parsed.data.newPassword, 12);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash },
    });

    return { success: true };
  } catch (error) {
    console.error("Error changing password:", error);
    return { error: "حدث خطأ أثناء تغيير كلمة المرور" };
  }
}

export async function changeEmailAction(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) return { error: "غير مصرح" };

  const raw = {
    newEmail: formData.get("newEmail"),
  };

  const parsed = changeEmailSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  try {
    const existing = await prisma.user.findUnique({
      where: { email: parsed.data.newEmail },
    });

    if (existing) return { error: "البريد الإلكتروني مستخدم بالفعل" };

    await prisma.user.update({
      where: { id: session.user.id },
      data: { email: parsed.data.newEmail },
    });

    revalidatePath("/student/settings");
    return { success: true };
  } catch (error) {
    console.error("Error changing email:", error);
    return { error: "حدث خطأ أثناء تغيير البريد الإلكتروني" };
  }
}

export async function getStudentSettings() {
  const session = await auth();
  if (!session?.user?.id) return null;

  try {
    return await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        email: true,
        emailNotifications: true,
        siteNotifications: true,
        language: true,
        theme: true,
      },
    });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
}
