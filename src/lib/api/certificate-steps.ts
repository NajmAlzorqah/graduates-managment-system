import { prisma } from "@/lib/prisma";
import type { CertificateStep } from "@/types/student";

const DEFAULT_STEP_LABELS = [
  "تعبئة استمارة التخرج",
  "مراجعة البيانات وتأكيدها",
  "اعتماد التخرج",
  "رفع الشهادة للتعليم العالي",
  "المصادقة النهائية",
];

const statusMap = {
  COMPLETED: "completed",
  IN_PROGRESS: "in-progress",
  PENDING: "pending",
  NEEDS_VERIFICATION: "needs-verification",
  MODIFIED: "modified",
  REJECTED: "rejected",
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
    status: statusMap[s.status as keyof typeof statusMap],
  }));
}

export async function updateStepStatus(
  stepId: string,
  status:
    | "PENDING"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "NEEDS_VERIFICATION"
    | "MODIFIED"
    | "REJECTED",
  staffId: string,
): Promise<CertificateStep> {
  const step = await prisma.certificateStep.update({
    where: { id: stepId },
    data: { status, updatedById: staffId },
  });

  return {
    id: step.id,
    label: step.label,
    status: statusMap[step.status as keyof typeof statusMap],
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
