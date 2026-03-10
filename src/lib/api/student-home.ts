import { prisma } from "@/lib/prisma";
import type { StudentHomeData } from "@/types/student";

export async function getStudentHomeData(
  userId: string,
): Promise<StudentHomeData> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      studentProfile: true,
      certificateSteps: { orderBy: { order: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  const statusMap = {
    COMPLETED: "completed",
    IN_PROGRESS: "in-progress",
    PENDING: "pending",
  } as const;

  const docStatusMap = {
    ACCEPTED: "accepted",
    PENDING: "pending",
    REJECTED: "rejected",
  } as const;

  return {
    profile: {
      id: user.id,
      nameAr: user.nameAr ?? user.name ?? "",
      department: user.studentProfile?.major ?? "",
    },
    certificateSteps: user.certificateSteps.map((s) => ({
      id: s.id,
      label: s.label,
      status: statusMap[s.status],
    })),
    documents: user.documents.map((d) => ({
      id: d.id,
      label: d.label,
      status: docStatusMap[d.status],
    })),
  };
}
