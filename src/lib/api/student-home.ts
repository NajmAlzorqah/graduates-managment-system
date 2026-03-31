import { prisma } from "@/lib/prisma";
import type { StudentHomeData } from "@/types/student";

export async function getStudentHomeData(
  userId: string,
): Promise<StudentHomeData> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    include: {
      studentProfile: {
        include: { majorRelation: true },
      },
      certificateSteps: { orderBy: { order: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
  });

  const statusMap = {
    COMPLETED: "completed",
    IN_PROGRESS: "in-progress",
    PENDING: "pending",
    NEEDS_VERIFICATION: "needs-verification",
    MODIFIED: "modified",
    REJECTED: "rejected",
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
      department: user.studentProfile?.majorRelation?.name ?? user.studentProfile?.major ?? "",
      avatarUrl: user.image,
    },
    certificateSteps: user.certificateSteps.map((s) => ({
      id: s.id,
      label: s.label,
      status: statusMap[s.status as keyof typeof statusMap],
    })),
    documents: user.documents.map((d) => ({
      id: d.id,
      label: d.label,
      status: docStatusMap[d.status],
    })),
  };
}
