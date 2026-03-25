"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import type { StaffTodoItem } from "@/types/staff";

export async function getStaffTodos(
  staffId?: string,
): Promise<StaffTodoItem[]> {
  try {
    const todos = await prisma.todo.findMany({
      where: staffId ? { staffId } : {},
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
    });

    return todos.map((todo) => ({
      id: todo.id,
      title: todo.title,
      completed: todo.completed,
      staffId: todo.staffId,
      staffName: todo.staff.nameAr || todo.staff.name || "Unknown",
    }));
  } catch (error) {
    console.error("Failed to fetch todos:", error);
    return [];
  }
}

export async function createTodo(data: { title: string; staffId: string }) {
  try {
    // Check total count of tasks
    const count = await prisma.todo.count();

    if (count >= 10) {
      // Find the oldest completed task to delete
      const oldestCompleted = await prisma.todo.findFirst({
        where: { completed: true },
        orderBy: { createdAt: "asc" },
      });

      if (oldestCompleted) {
        await prisma.todo.delete({
          where: { id: oldestCompleted.id },
        });
      }
    }

    const todo = await prisma.todo.create({
      data: {
        title: data.title,
        staffId: data.staffId,
        completed: false,
      },
    });

    revalidatePath("/admin/reports");
    revalidatePath("/staff");
    return { success: true, todo };
  } catch (error) {
    console.error("Failed to create todo:", error);
    return { success: false, error: "Failed to create todo" };
  }
}

export async function updateTodo(
  id: string,
  data: { title?: string; completed?: boolean },
) {
  try {
    const todo = await prisma.todo.update({
      where: { id },
      data,
    });

    revalidatePath("/admin/reports");
    revalidatePath("/staff");
    return { success: true, todo };
  } catch (error) {
    console.error("Failed to update todo:", error);
    return { success: false, error: "Failed to update todo" };
  }
}

export async function deleteTodo(id: string) {
  try {
    await prisma.todo.delete({
      where: { id },
    });

    revalidatePath("/admin/reports");
    revalidatePath("/staff");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete todo:", error);
    return { success: false, error: "Failed to delete todo" };
  }
}

export async function toggleTodo(id: string, completed: boolean) {
  return updateTodo(id, { completed });
}

export async function getStaffMembers() {
  try {
    const staff = await prisma.user.findMany({
      where: {
        role: "STAFF",
      },
      select: {
        id: true,
        name: true,
        nameAr: true,
      },
    });

    return staff.map((s) => ({
      id: s.id,
      name: s.nameAr || s.name || "Unknown",
    }));
  } catch (error) {
    console.error("Failed to fetch staff members:", error);
    return [];
  }
}
