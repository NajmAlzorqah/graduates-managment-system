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
    // Get current form to check for re-submission
    const currentForm = await tx.graduationForm.findUnique({
      where: { userId },
    });

    const isResubmission =
      currentForm &&
      (currentForm.status === "NEEDS_CONFIRMATION" ||
        currentForm.status === "REJECTED");

    // Update user names
    const user = await tx.user.update({
      where: { id: userId },
      data: {
        nameAr: data.fullNameAr,
        name: data.fullNameEn,
      },
    });

    // Send notification to staff if it's a re-submission
    if (isResubmission) {
      const staffUsers = await tx.user.findMany({
        where: { role: { in: ["STAFF", "ADMIN"] } },
      });

      for (const staff of staffUsers) {
        await tx.notification.create({
          data: {
            userId: staff.id,
            title: "تعديل في نموذج التخرج",
            message: `قام الطالب ${user.nameAr} بتعديل بيانات الاستمارة وإعادة إرسالها للمراجعة.`,
          },
        });
      }
    }

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
        major: data.major || null,
        graduationYear: data.graduationYear,
        studentCardNumber: data.studentCardNumber || null,
        phone: fullPhone,
      },
      update: {
        major: data.major || null,
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

    // Reset Step 2 to PENDING if student edited/submitted the form
    await tx.certificateStep.updateMany({
      where: {
        userId,
        order: 2,
      },
      data: {
        status: "PENDING",
      },
    });

    // Disable previous correction notifications
    await tx.notification.updateMany({
      where: {
        userId,
        status: "نشط",
        title: {
          in: ["مراجعة وتأكيد البيانات", "يوجد أخطاء في نموذج التخرج"],
        },
      },
      data: {
        status: "مستخدم",
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

      // Mark Step 2 as IN_PROGRESS
      await tx.certificateStep.updateMany({
        where: { userId: studentId, order: 2 },
        data: { status: "IN_PROGRESS" },
      });
    } else if (status === "REJECTED") {
      title = "يوجد أخطاء في نموذج التخرج";
      message = comments || "يرجى مراجعة وتصحيح البيانات في نموذج التخرج.";

      // Reset Step 1 and Step 2 if rejected
      await tx.certificateStep.updateMany({
        where: { userId: studentId, order: { in: [1, 2] } },
        data: { status: "PENDING" },
      });

      // Also mark passport as rejected if it exists
      await tx.document.updateMany({
        where: { userId: studentId, documentType: "PASSPORT" },
        data: {
          status: "REJECTED",
          rejectionReason: comments || "يرجى إعادة رفع صورة واضحة للجواز.",
          reviewedById: staffId,
          reviewedAt: new Date(),
        },
      });
    } else if (status === "APPROVED") {
      title = "تم اعتماد نموذج التخرج";
      message = "تم اعتماد نموذج التخرج الخاص بك بنجاح.";

      // Complete Step 1, Step 2, and Step 3 if approved
      await tx.certificateStep.updateMany({
        where: { userId: studentId, order: { in: [1, 2, 3] } },
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
        status: "CONFIRMED_BY_STUDENT",
      },
    });

    const user = await tx.user.findUnique({ where: { id: userId } });

    // Send notification to staff
    const staffUsers = await tx.user.findMany({
      where: { role: { in: ["STAFF", "ADMIN"] } },
    });

    for (const staff of staffUsers) {
      await tx.notification.create({
        data: {
          userId: staff.id,
          title: "تأكيد بيانات الطالب",
          message: `قام الطالب ${user?.nameAr} بتأكيد صحة البيانات، يرجى الاعتماد النهائي.`,
        },
      });
    }

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

    // Mark Step 3 (Approve graduation) as IN_PROGRESS
    await tx.certificateStep.updateMany({
      where: {
        userId,
        order: 3,
      },
      data: {
        status: "IN_PROGRESS",
      },
    });

    // Disable confirmation notification
    await tx.notification.updateMany({
      where: {
        userId,
        status: "نشط",
        title: "يرجى تأكيد بياناتك",
      },
      data: {
        status: "مستخدم",
      },
    });

    // Send confirmation notification to student
    await tx.notification.create({
      data: {
        userId,
        title: "تم تأكيد طلبك بنجاح",
        message: "لقد قمت بتأكيد بياناتك، وسيتم مراجعتها واعتمادها من قبل الموظف المختص.",
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
