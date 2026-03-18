"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { auth, signOut } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const updateNameSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters long."),
});

export async function updateStaffName(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STAFF") {
    return { error: "Not authenticated" };
  }

  const result = updateNameSchema.safeParse({ name: formData.get("name") });
  if (!result.success) {
    return { error: result.error.flatten().fieldErrors.name?.[0] };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { name: result.data.name },
    });

    revalidatePath("/staff/settings");
    return { success: "Name updated successfully." };
  } catch {
    return { error: "Failed to update name." };
  }
}

const updatePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, "Old password is required."),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export async function updateStaffPassword(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STAFF") {
    return { error: "Not authenticated" };
  }

  const result = updatePasswordSchema.safeParse(Object.fromEntries(formData));
  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    return { error: Object.values(fieldErrors).flat()[0] };
  }

  const { oldPassword, newPassword } = result.data;

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { passwordHash: true },
    });
    if (!user) {
      return { error: "User not found." };
    }

    const passwordMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!passwordMatch) {
      return { error: "Incorrect old password." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: session.user.id },
      data: { passwordHash: hashedPassword },
    });

    // Password changed, force re-login
    await signOut({ redirect: false });

    return { success: "Password updated. Please log in again." };
  } catch {
    return { error: "Failed to update password." };
  }
}

const updatePreferencesSchema = z.object({
  emailNotifications: z.enum(["on", "off"]),
  siteNotifications: z.enum(["on", "off"]),
});

export async function updateStaffPreferences(prefs: {
  emailNotifications: "on" | "off";
  siteNotifications: "on" | "off";
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STAFF") {
    return { error: "Not authenticated" };
  }

  const result = updatePreferencesSchema.safeParse(prefs);
  if (!result.success) {
    return { error: "Invalid preferences." };
  }

  try {
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        emailNotifications: prefs.emailNotifications === "on",
        siteNotifications: prefs.siteNotifications === "on",
      },
    });

    revalidatePath("/staff/settings");
    return { success: "Preferences updated." };
  } catch (error) {
    console.error("Error updating staff preferences:", error);
    return { error: "Failed to update preferences." };
  }
}

export async function getStaffSettings() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "STAFF") {
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailNotifications: true,
        siteNotifications: true,
        language: true,
        theme: true,
      },
    });

    if (!user) return null;

    return {
      emailNotifications: (user.emailNotifications ? "on" : "off") as "on" | "off",
      siteNotifications: (user.siteNotifications ? "on" : "off") as "on" | "off",
      language: user.language as "ar" | "en",
      theme: user.theme as "light" | "dark",
    };
  } catch (error) {
    console.error("Error fetching staff settings:", error);
    return null;
  }
}
