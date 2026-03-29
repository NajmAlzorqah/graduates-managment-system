import { prisma } from "@/lib/prisma";
import type { SubmitGraduationFormInput } from "@/lib/validations/graduation-form";
import type {
  GraduationForm,
  GraduationFormStatus,
} from "@/types/graduation-form";

function toGraduationForm(f: {
  id: string;
  userId: string;
  status: string;
  submittedAt: Date | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): GraduationForm {
  return {
    id: f.id,
    userId: f.userId,
    status: f.status as GraduationForm["status"],
    submittedAt: f.submittedAt,
    reviewedById: f.reviewedById,
    reviewedAt: f.reviewedAt,
    createdAt: f.createdAt,
    updatedAt: f.updatedAt,
  };
}

export async function getGraduationForm(
  userId: string,
): Promise<GraduationForm | null> {
  const form = await prisma.graduationForm.findUnique({ where: { userId } });
  if (!form) return null;
  return toGraduationForm(form);
}

export async function submitGraduationForm(
  userId: string,
  data: SubmitGraduationFormInput,
): Promise<GraduationForm> {
  const form = await prisma.$transaction(async (tx) => {
    // Update user names
    await tx.user.update({
      where: { id: userId },
      data: {
        nameAr: data.fullNameAr,
        name: data.fullNameEn,
      },
    });

    // Upsert the graduation form
    const gf = await tx.graduationForm.upsert({
      where: { userId },
      create: {
        userId,
        status: "SUBMITTED",
        submittedAt: new Date(),
      },
      update: {
        status: "SUBMITTED",
        submittedAt: new Date(),
        reviewedById: null,
        reviewedAt: null,
      },
    });

    // Update profile with form data
    const fullPhone = `${data.countryCode}${data.phoneNumber}`;
    await tx.studentProfile.upsert({
      where: { userId },
      create: {
        userId,
        major: data.major || "IT",
        graduationYear: data.graduationYear,
        studentCardNumber: data.studentCardNumber || null,
        phone: fullPhone,
      },
      update: {
        major: data.major || "IT",
        graduationYear: data.graduationYear,
        studentCardNumber: data.studentCardNumber || null,
        phone: fullPhone,
      },
    });

    // Update Step 1 (Fill graduation form) to COMPLETED
    await tx.certificateStep.updateMany({
      where: {
        userId,
        order: 1,
      },
      data: {
        status: "COMPLETED",
      },
    });

    return gf;
  });

  return toGraduationForm(form);
}

export async function reviewGraduationForm(
  formId: string,
  status: "APPROVED" | "REJECTED" | "NEEDS_CONFIRMATION",
  staffId: string,
  comments?: string,
): Promise<GraduationForm> {
  const form = await prisma.$transaction(async (tx) => {
    const gf = await tx.graduationForm.update({
      where: { id: formId },
      data: {
        status,
        reviewedById: staffId,
        reviewedAt: new Date(),
      },
    });

    const studentId = gf.userId;
    let title = "";
    let message = "";

    if (status === "NEEDS_CONFIRMATION") {
      title = "يرجى تأكيد بياناتك";
      message =
        "قام الموظف بمراجعة طلبك، يرجى التأكد من صحة البيانات وتأكيدها.";
    } else if (status === "REJECTED") {
      title = "يوجد أخطاء في نموذج التخرج";
      message = comments || "يرجى مراجعة وتصحيح البيانات في نموذج التخرج.";

      // Reset Step 1 if rejected?
      await tx.certificateStep.updateMany({
        where: { userId: studentId, order: 1 },
        data: { status: "PENDING" },
      });
    } else if (status === "APPROVED") {
      title = "تم اعتماد نموذج التخرج";
      message = "تم اعتماد نموذج التخرج الخاص بك بنجاح.";

      // Complete Step 1 and Step 2 if approved directly
      await tx.certificateStep.updateMany({
        where: { userId: studentId, order: { in: [1, 2] } },
        data: { status: "COMPLETED" },
      });
    }

    await tx.notification.create({
      data: {
        userId: studentId,
        sentById: staffId,
        title,
        message,
      },
    });

    return gf;
  });

  return toGraduationForm(form);
}

export async function confirmGraduationForm(
  userId: string,
): Promise<GraduationForm> {
  const form = await prisma.$transaction(async (tx) => {
    const gf = await tx.graduationForm.update({
      where: { userId },
      data: {
        status: "APPROVED",
      },
    });

    // Update Step 2 (Review and confirm) to COMPLETED
    await tx.certificateStep.updateMany({
      where: {
        userId,
        order: 2,
      },
      data: {
        status: "COMPLETED",
      },
    });

    // Send confirmation notification
    await tx.notification.create({
      data: {
        userId,
        title: "تم تأكيد طلبك بنجاح",
        message: "لقد قمت بتأكيد بياناتك، وسيتم البدء في إجراءات الشهادة.",
      },
    });

    return gf;
  });

  return toGraduationForm(form);
}

export async function getAllForms(
  filter?: GraduationFormStatus,
): Promise<GraduationForm[]> {
  const forms = await prisma.graduationForm.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return forms.map(toGraduationForm);
}
