"use server";

import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateOwnProfileSchema = z.object({
  nameAr: z.string().trim().min(1, "الاسم مطلوب").optional(),
  email: z.string().email("بريد إلكتروني غير صالح").optional(),
  studentCardNumber: z.string().trim().optional(),
  phone: z.string().trim().optional(),
});

type UpdateProfileResult = { success?: boolean; error?: string };

export async function updateOwnProfileAction(
  _prevState: { success?: boolean; error?: string },
  formData: FormData,
): Promise<UpdateProfileResult> {
  const session = await auth();
  if (!session?.user?.id) return { error: "غير مصرح" };

  const nameAr = formData.get("nameAr")?.toString();
  const email = formData.get("email")?.toString();
  const studentCardNumber = formData.get("studentCardNumber")?.toString();
  const phone = formData.get("phone")?.toString();
  const imageFile = formData.get("image") as File | null;
  const deleteImage = formData.get("deleteImage") === "true";

  const rawData = {
    nameAr: nameAr || undefined,
    email: email || undefined,
    studentCardNumber: studentCardNumber || undefined,
    phone: phone || undefined,
  };

  const parsed = updateOwnProfileSchema.safeParse(rawData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "بيانات غير صالحة" };
  }

  const userId = session.user.id;

  try {
    let imageUrl: string | null | undefined;

    if (deleteImage) {
      // Get current image to delete from filesystem
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { image: true },
      });

      if (user?.image?.startsWith("/api/uploads/")) {
        const relativePath = user.image.replace("/api/uploads/", "");
        const fullPath = join(process.cwd(), "uploads", relativePath);
        await rm(fullPath, { force: true });
      }
      imageUrl = null;
    } else if (imageFile && imageFile.size > 0) {
      const bytes = await imageFile.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const userDir = join(process.cwd(), "uploads", userId);
      await mkdir(userDir, { recursive: true });

      const safeFileName = `avatar-${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
      const filePath = join(userDir, safeFileName);
      await writeFile(filePath, buffer);

      imageUrl = `/api/uploads/${userId}/${safeFileName}`;
    }

    if (email) {
      const existing = await prisma.user.findFirst({
        where: { email, NOT: { id: userId } },
      });
      if (existing) return { error: "البريد الإلكتروني مستخدم بالفعل" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        ...(nameAr !== undefined && { nameAr }),
        ...(email !== undefined && { email }),
        ...(imageUrl !== undefined && { image: imageUrl }),
      },
    });

    if (studentCardNumber !== undefined || phone !== undefined) {
      await prisma.studentProfile.upsert({
        where: { userId: userId },
        update: {
          ...(studentCardNumber !== undefined && {
            studentCardNumber: studentCardNumber || null,
          }),
          ...(phone !== undefined && { phone: phone || null }),
        },
        create: {
          userId: userId,
          studentCardNumber: studentCardNumber || null,
          phone: phone || null,
          major: null,
        },
      });
    }

    revalidatePath("/student/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating profile:", error);
    return { error: "حدث خطأ أثناء تحديث البيانات" };
  }
}

export async function updateStudentDataAction(data: {
  nameAr?: string;
  name?: string;
  major?: string;
  studentCardNumber?: string;
  graduationYear?: number;
}) {
  const session = await auth();
  if (!session?.user?.id) return { error: "غير مصرح" };

  const userId = session.user.id;

  try {
    // Validate major if provided
    if (data.major) {
      const majorExists = await prisma.major.findUnique({
        where: { name: data.major },
      });
      if (!majorExists) {
        return { error: `التخصص "${data.major}" غير موجود في النظام` };
      }
    }

    await prisma.$transaction(async (tx) => {
      // Update User info
      if (data.nameAr || data.name) {
        await tx.user.update({
          where: { id: userId },
          data: {
            ...(data.nameAr && { nameAr: data.nameAr }),
            ...(data.name && { name: data.name }),
          },
        });
      }

      // Update Student Profile
      if (data.major || data.studentCardNumber || data.graduationYear) {
        await tx.studentProfile.upsert({
          where: { userId: userId },
          update: {
            ...(data.major && { major: data.major }),
            ...(data.studentCardNumber && {
              studentCardNumber: data.studentCardNumber,
            }),
            ...(data.graduationYear && { graduationYear: data.graduationYear }),
          },
          create: {
            userId: userId,
            major: data.major || null,
            studentCardNumber: data.studentCardNumber || null,
            graduationYear: data.graduationYear || null,
          },
        });
      }
    });

    revalidatePath("/student/notifications");
    revalidatePath("/student/profile");
    return { success: true };
  } catch (error) {
    console.error("Error updating student data:", error);
    return { error: "حدث خطأ أثناء تحديث البيانات" };
  }
}

export async function confirmStepAction(stepOrder: number) {
  const session = await auth();
  if (!session?.user?.id) return { error: "غير مصرح" };

  try {
    // Find the step
    const step = await prisma.certificateStep.findFirst({
      where: {
        userId: session.user.id,
        order: stepOrder,
      },
      select: { id: true, label: true, updatedById: true },
    });

    if (!step) return { error: "الخطوة غير موجودة" };

    // Update status to MODIFIED to indicate student has interacted/confirmed
    // The requirement says "The certificate status must not update until staff reviews"
    // So we don't set to COMPLETED.
    await prisma.certificateStep.update({
      where: { id: step.id },
      data: {
        status: "MODIFIED", // Indicates student has confirmed/modified data
        isModifiedByStudent: true,
      },
    });

    // Notify the staff member who last updated this step (if any) or all staff
    if (step.updatedById) {
      await prisma.notification.create({
        data: {
          userId: step.updatedById,
          title: "تأكيد بيانات الطالب",
          message: `قام الطالب بتأكيد/تعديل بياناته للخطوة: ${step.label}. يرجى المراجعة والاعتماد يدوياً.`,
          sentById: session.user.id,
        },
      });
    }

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
