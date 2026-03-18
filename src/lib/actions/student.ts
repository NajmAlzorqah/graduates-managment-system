"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateOwnProfileSchema = z.object({
  nameAr: z.string().trim().min(1, "الاسم مطلوب").optional(),
  email: z.string().email("بريد إلكتروني غير صالح").optional(),
  studentCardNumber: z.string().trim().optional(),
});

type UpdateProfileResult = { success?: true; error?: string };

export async function updateOwnProfileAction(
  _prevState: { success?: boolean; error?: string },
  formData: FormData,
): Promise<UpdateProfileResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "غير مصرح" };

  const rawData = {
    nameAr: formData.get("nameAr")?.toString() || undefined,
    email: formData.get("email")?.toString() || undefined,
    studentCardNumber:
      formData.get("studentCardNumber")?.toString() ?? undefined,
  };

  const parsed = updateOwnProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const { nameAr, email, studentCardNumber } = parsed.data;

  try {
    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: session.user.id } },
      });
      if (existing) return { error: "البريد الإلكتروني مستخدم بالفعل" };
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        ...(nameAr !== undefined && { nameAr }),
        ...(email !== undefined && { email }),
      },
    });

    if (studentCardNumber !== undefined) {
      await prisma.studentProfile.upsert({
        where: { userId: session.user.id },
        update: { studentCardNumber: studentCardNumber || null },
        create: {
          userId: session.user.id,
          studentCardNumber: studentCardNumber || null,
        },
      });
    }

    revalidatePath("/student/profile");
    return { success: true };
  } catch {
    return { error: "حدث خطأ أثناء تحديث البيانات" };
  }
}

export async function confirmStepAction(stepOrder: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "غير مصرح" };

  try {
    await prisma.certificateStep.updateMany({
      where: {
        userId: session.user.id,
        order: stepOrder,
      },
      data: {
        status: "COMPLETED",
      },
    });

    revalidatePath("/student/notifications");
    revalidatePath("/student");
    revalidatePath("/staff/certificates");

    return { success: true };
  } catch (error) {
    console.error("Error confirming step:", error);
    return { error: "حدث خطأ أثناء تأكيد الخطوة" };
  }
}

export async function getUnreadNotificationsCount() {
  const session = await auth();
  if (!session?.user?.id) return 0;

  try {
    return await prisma.notification.count({
      where: {
        userId: session.user.id,
        isRead: false,
      },
    });
  } catch (error) {
    console.error("Error fetching unread notifications count:", error);
    return 0;
  }
}
