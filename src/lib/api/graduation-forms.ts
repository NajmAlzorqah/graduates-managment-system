import { prisma } from "@/lib/prisma";
import type { SubmitGraduationFormInput } from "@/lib/validations/graduation-form";
import type { GraduationForm } from "@/types/graduation-form";

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
    await tx.studentProfile.upsert({
      where: { userId },
      create: {
        userId,
        major: data.major,
        graduationYear: data.graduationYear,
        studentCardNumber: data.studentCardNumber,
      },
      update: {
        major: data.major,
        graduationYear: data.graduationYear,
        studentCardNumber: data.studentCardNumber,
      },
    });

    return gf;
  });

  return toGraduationForm(form);
}

export async function reviewGraduationForm(
  formId: string,
  status: "APPROVED" | "REJECTED",
  staffId: string,
): Promise<GraduationForm> {
  const form = await prisma.graduationForm.update({
    where: { id: formId },
    data: {
      status,
      reviewedById: staffId,
      reviewedAt: new Date(),
    },
  });
  return toGraduationForm(form);
}

export async function getAllForms(
  filter?: "SUBMITTED" | "UNDER_REVIEW" | "APPROVED" | "REJECTED",
): Promise<GraduationForm[]> {
  const forms = await prisma.graduationForm.findMany({
    where: filter ? { status: filter } : undefined,
    orderBy: { createdAt: "desc" },
  });
  return forms.map(toGraduationForm);
}
