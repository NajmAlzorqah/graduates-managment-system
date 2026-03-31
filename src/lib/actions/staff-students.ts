"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { updateStepStatus } from "@/lib/api/certificate-steps";
import { createNotification } from "@/lib/api/notifications";
import {
  approveStudent,
  createStaffUser,
  createStudent,
  deleteStudent,
  getStudentById,
} from "@/lib/api/students";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { updateStepStatusSchema } from "@/lib/validations/certificate-step";
import {
  createStaffUserSchema,
  createStudentSchema,
} from "@/lib/validations/student";

type ActionResult = { success: true } | { success: false; error: string };

export async function deleteStudentAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return { success: false, error: "غير مصرح" };
  }

  try {
    await deleteStudent(id);
    revalidatePath("/staff/students");
    revalidatePath("/staff/manage-students");
    return { success: true };
  } catch {
    return { success: false, error: "خطأ في حذف الطالب" };
  }
}

export async function approveStudentAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return { success: false, error: "غير مصرح" };
  }

  try {
    await approveStudent(id);
    revalidatePath("/staff/students");
    return { success: true };
  } catch {
    return { success: false, error: "خطأ في قبول الطالب" };
  }
}

export async function rejectStudentAction(id: string): Promise<ActionResult> {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return { success: false, error: "غير مصرح" };
  }

  try {
    await deleteStudent(id);
    revalidatePath("/staff/students");
    return { success: true };
  } catch {
    return { success: false, error: "خطأ في رفض الطالب" };
  }
}

export async function createStudentAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return { success: false, error: "غير مصرح" };
  }

  const raw = {
    nameAr: formData.get("nameAr"),
    name: formData.get("name") || "",
    email: formData.get("email") || "",
    academicId: formData.get("academicId"),
    password: formData.get("password"),
    major: formData.get("major") || undefined,
    studentCardNumber: formData.get("studentCardNumber") || undefined,
    graduationYear: formData.get("graduationYear") || undefined,
  };

  const parsed = createStudentSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { success: false, error: first ?? "بيانات غير صالحة" };
  }

  // Handle optional email for database requirements
  if (!parsed.data.email) {
    parsed.data.email = `${parsed.data.academicId}@grads.system`;
  }

  try {
    await createStudent(parsed.data);
    revalidatePath("/staff/students");
    return { success: true };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        success: false,
        error: "الرقم الجامعي أو البريد الإلكتروني مستخدم بالفعل",
      };
    }
    return { success: false, error: "خطأ في إنشاء حساب الطالب" };
  }
}

export async function createStaffUserAction(
  formData: FormData,
): Promise<ActionResult> {
  const session = await auth();
  // Only ADMIN can create staff accounts now
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    return { success: false, error: "غير مصرح - للمسؤولين فقط" };
  }

  const raw = {
    nameAr: formData.get("nameAr"),
    name: formData.get("name") || "",
    email: formData.get("email") || "",
    academicId: formData.get("academicId"),
    password: formData.get("password"),
  };

  const parsed = createStaffUserSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { success: false, error: first ?? "بيانات غير صالحة" };
  }

  // Handle optional email for database requirements
  if (!parsed.data.email) {
    parsed.data.email = `${parsed.data.academicId}@grads.system`;
  }

  try {
    await createStaffUser(parsed.data);
    revalidatePath("/staff/students");
    return { success: true };
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return {
        success: false,
        error: "الرقم الجامعي أو البريد الإلكتروني مستخدم بالفعل",
      };
    }
    return { success: false, error: "خطأ في إنشاء حساب الموظف" };
  }
}

export async function updateStepStatusAction(
  stepId: string,
  rawStatus: string,
): Promise<ActionResult> {
  const session = await auth();
  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return { success: false, error: "غير مصرح" };
  }

  const parsed = updateStepStatusSchema.safeParse({ status: rawStatus });
  if (!parsed.success) {
    return { success: false, error: "حالة غير صالحة" };
  }

  try {
    const step = await prisma.certificateStep.findUnique({
      where: { id: stepId },
      select: {
        id: true,
        label: true,
        userId: true,
        status: true,
        order: true,
      },
    });

    if (!step) return { success: false, error: "الخطوة غير موجودة" };

    const isVerificationStep =
      step.label === "مراجعة البيانات وتأكيدها" || step.order === 2;
    const nextStatus = parsed.data.status;

    // Workflow Part 1: Verify Button (Step 2)
    // If staff clicks "Approve" (nextStatus === COMPLETED) on step 2,
    // we check if it's currently in a state that implies student has responded.
    // If it's NOT in MODIFIED state, it means it's the INITIAL "Verify" click.
    if (
      isVerificationStep &&
      nextStatus === "COMPLETED" &&
      step.status !== "MODIFIED"
    ) {
      const student = await prisma.user.findUnique({
        where: { id: step.userId },
        include: {
          studentProfile: {
            include: { majorRelation: true },
          },
          graduationForm: true,
        },
      });

      if (student) {
        if (!student.graduationForm || student.graduationForm.status === "DRAFT") {
          await createNotification(
            session.user.id,
            step.userId,
            "تنبيه: نموذج التخرج ناقص",
            "يرجى إكمال نموذج التخرج قبل التأكيد.",
          );
          return { success: false, error: "يرجى إكمال نموذج التخرج قبل التأكيد." };
        }

        const passportDoc = await prisma.document.findFirst({
          where: { userId: step.userId, documentType: "PASSPORT" },
          orderBy: { createdAt: "desc" },
        });

        const dataMessage = `يرجى مراجعة بياناتك التالية وتأكيدها:
الاسم بالعربي: ${student.nameAr || "—"}
الاسم بالإنجليزي: ${student.name || "—"}
رقم الهاتف: ${student.studentProfile?.phone || "—"}
التخصص: ${student.studentProfile?.majorRelation?.name ?? student.studentProfile?.major ?? "—"}
سنة التخرج: ${student.studentProfile?.graduationYear || "—"}
صورة الجواز: ${passportDoc ? "مرفوعة" : "غير مرفوعة"}`;

        // Send notification to student with their form data
        await createNotification(
          session.user.id,
          step.userId,
          "مراجعة وتأكيد البيانات",
          dataMessage,
        );

        // Update to NEEDS_VERIFICATION. Status NOT COMPLETED yet.
        await updateStepStatus(stepId, "NEEDS_VERIFICATION", session.user.id);

        revalidatePath("/staff/certificates");
        revalidatePath("/student");
        return { success: true };
      }
    }

    // Standard Update (including final manual approval of step 2)
    await updateStepStatus(stepId, nextStatus, session.user.id);

    // Workflow Part 2: Automatic notification for any manual update
    const statusLabels: Record<string, string> = {
      COMPLETED: "مكتملة",
      IN_PROGRESS: "قيد التنفيذ",
      PENDING: "قيد الانتظار",
      NEEDS_VERIFICATION: "تحتاج لمراجعة",
      MODIFIED: "تم التعديل",
      REJECTED: "مرفوضة",
    };

    await createNotification(
      session.user.id,
      step.userId,
      `تحديث حالة الشهادة: ${step.label}`,
      `تم تحديث حالة خطوة "${step.label}" إلى: ${statusLabels[nextStatus] || nextStatus}`,
    );

    revalidatePath("/staff/certificates");
    revalidatePath("/student");
    return { success: true };
  } catch (error) {
    console.error("Error updating step status:", error);
    return { success: false, error: "خطأ في تحديث الحالة" };
  }
}
