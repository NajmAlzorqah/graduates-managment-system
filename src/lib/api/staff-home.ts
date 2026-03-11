import { prisma } from "@/lib/prisma";
import type { StaffHomeData, StaffTodoItem } from "@/types/staff";

function getDayBounds(input: Date): { start: Date; end: Date } {
  const start = new Date(input);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

function getFallbackTodoItems(): StaffTodoItem[] {
  return [
    {
      id: "fallback-1",
      label: "استعادة شهادة صالح المصلوح من التعليم العالي",
      completed: false,
    },
    {
      id: "fallback-2",
      label: "استعادة شهادة صالح المصلوح من التعليم العالي",
      completed: false,
    },
    {
      id: "fallback-3",
      label: "استعادة شهادة صالح المصلوح من التعليم العالي",
      completed: false,
    },
  ];
}

export async function getStaffHomeData(): Promise<StaffHomeData> {
  const now = new Date();
  const { start, end } = getDayBounds(now);

  const [
    registeredTodayCount,
    certificatesUnderReviewCount,
    certificatesApprovedCount,
    pendingSteps,
  ] = await Promise.all([
    prisma.user.count({
      where: {
        role: "STUDENT",
        createdAt: {
          gte: start,
          lt: end,
        },
      },
    }),
    prisma.graduationForm.count({
      where: {
        status: "UNDER_REVIEW",
      },
    }),
    prisma.graduationForm.count({
      where: {
        status: "APPROVED",
      },
    }),
    prisma.certificateStep.findMany({
      where: {
        status: {
          in: ["PENDING", "IN_PROGRESS"],
        },
      },
      include: {
        user: {
          select: {
            name: true,
            nameAr: true,
          },
        },
      },
      orderBy: [{ status: "desc" }, { updatedAt: "asc" }],
      take: 4,
    }),
  ]);

  const todoItems =
    pendingSteps.length > 0
      ? pendingSteps.map((step) => {
          const studentName = step.user.nameAr ?? step.user.name ?? "طالب";

          return {
            id: step.id,
            label: `${step.label} - ${studentName}`,
            completed: false,
          };
        })
      : getFallbackTodoItems();

  return {
    stats: {
      registeredTodayCount,
      certificatesUnderReviewCount,
      certificatesApprovedCount,
    },
    todoItems,
  };
}
