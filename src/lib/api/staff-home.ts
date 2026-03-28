import { prisma } from "@/lib/prisma";
import type { StaffHomeData, StaffTodoItem } from "@/types/staff";

function getDayBounds(input: Date): { start: Date; end: Date } {
  const start = new Date(input);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return { start, end };
}

export async function getStaffHomeData(
  staffId?: string,
): Promise<StaffHomeData> {
  const now = new Date();
  const { start, end } = getDayBounds(now);

  const [
    registeredTodayCount,
    certificatesUnderReviewCount,
    certificatesApprovedCount,
    certificatesDeliveredCount,
    todos,
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
    prisma.certificate.count(),
    staffId
      ? prisma.todo.findMany({
          where: {
            staffId,
          },
          include: {
            staff: {
              select: {
                name: true,
                nameAr: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        })
      : Promise.resolve([]),
  ]);

  const todoItems: StaffTodoItem[] = (todos as any[]).map((todo) => ({
    id: todo.id,
    title: todo.title,
    completed: todo.completed,
    staffId: todo.staffId,
    staffName: todo.staff.nameAr || todo.staff.name || "Unknown",
  }));

  return {
    stats: {
      registeredTodayCount,
      certificatesUnderReviewCount,
      certificatesApprovedCount,
      certificatesDeliveredCount,
    },
    todoItems,
  };
}
