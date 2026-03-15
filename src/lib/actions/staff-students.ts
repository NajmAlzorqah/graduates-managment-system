"use server";

import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { updateStepStatus } from "@/lib/api/certificate-steps";
import {
  approveStudent,
  createStaffUser,
  createStudent,
  deleteStudent,
} from "@/lib/api/students";
import { auth } from "@/lib/auth";
import { updateStepStatusSchema } from "@/lib/validations/certificate-step";
import {
  createStaffUserSchema,
  createStudentSchema,
} from "@/lib/validations/student";

type ActionResult = { success: true } | { success: false; error: string };

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
    name: formData.get("name"),
    email: formData.get("email"),
    academicId: formData.get("academicId"),
    password: formData.get("password"),
    nameAr: formData.get("nameAr") || undefined,
    major: formData.get("major") || undefined,
    studentCardNumber: formData.get("studentCardNumber") || undefined,
    graduationYear: formData.get("graduationYear") || undefined,
  };

  const parsed = createStudentSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { success: false, error: first ?? "بيانات غير صالحة" };
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
  if (
    !session?.user?.id ||
    (session.user.role !== "STAFF" && session.user.role !== "ADMIN")
  ) {
    return { success: false, error: "غير مصرح" };
  }

  const raw = {
    name: formData.get("name"),
    email: formData.get("email"),
    academicId: formData.get("academicId"),
    password: formData.get("password"),
    nameAr: formData.get("nameAr") || undefined,
  };

  const parsed = createStaffUserSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { success: false, error: first ?? "بيانات غير صالحة" };
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
    await updateStepStatus(stepId, parsed.data.status, session.user.id);
    revalidatePath("/staff/certificates");
    return { success: true };
  } catch {
    return { success: false, error: "خطأ في تحديث الحالة" };
  }
}
