import { prisma } from "@/lib/prisma";
import type { CertificateStep } from "@/types/student";

const DEFAULT_STEP_LABELS = [
  "تعبئة الاستمارة",
  "التأكد من بيانات الاستمارة",
  "ارسال الشهادة للتعليم العالي",
  "المصادقة على الشهادة",
];

const statusMap = {
  COMPLETED: "completed",
  IN_PROGRESS: "in-progress",
  PENDING: "pending",
} as const;

export async function getStepsByStudent(
  userId: string,
): Promise<CertificateStep[]> {
  const steps = await prisma.certificateStep.findMany({
    where: { userId },
    orderBy: { order: "asc" },
  });

  return steps.map((s) => ({
    id: s.id,
    label: s.label,
    status: statusMap[s.status],
  }));
}

export async function updateStepStatus(
  stepId: string,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED",
  staffId: string,
): Promise<CertificateStep> {
  const step = await prisma.certificateStep.update({
    where: { id: stepId },
    data: { status, updatedById: staffId },
  });

  return {
    id: step.id,
    label: step.label,
    status: statusMap[step.status],
  };
}

export async function createDefaultSteps(
  userId: string,
): Promise<CertificateStep[]> {
  await prisma.certificateStep.createMany({
    data: DEFAULT_STEP_LABELS.map((label, i) => ({
      userId,
      label,
      order: i + 1,
      status: "PENDING" as const,
    })),
  });

  return getStepsByStudent(userId);
}
