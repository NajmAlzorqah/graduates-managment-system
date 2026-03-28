"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validations/auth";

export type LoginActionState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginActionState,
  formData: FormData,
): Promise<LoginActionState> {
  const raw = {
    academicId: formData.get("academicId"),
    password: formData.get("password"),
  };

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message;
    return { error: first ?? "Invalid input" };
  }

  // Pre-check: distinguish "not approved" from "bad credentials"
  const existing = await prisma.user.findUnique({
    where: { academicId: parsed.data.academicId },
    select: { isApproved: true, passwordHash: true, role: true },
  });

  if (existing) {
    const passwordValid = await bcrypt.compare(
      parsed.data.password,
      existing.passwordHash,
    );
    if (passwordValid && !existing.isApproved) {
      return { error: "Your account is pending approval by an administrator." };
    }
  }

  const roleRedirects: Record<string, string> = {
    STUDENT: "/student",
    STAFF: "/staff",
    ADMIN: "/admin",
  };

  const redirectTo = existing ? (roleRedirects[existing.role] || "/") : "/";

  try {
    await signIn("credentials", {
      academicId: parsed.data.academicId,
      password: parsed.data.password,
      redirect: true,
      redirectTo,
    });
  } catch (err) {
    // Auth.js throws a NEXT_REDIRECT for successful logins — rethrow it
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;

    if (err instanceof AuthError) {
      switch (err.type) {
        case "CredentialsSignin":
          return { error: "Invalid academic ID or password." };
        default:
          return { error: "Something went wrong. Please try again." };
      }
    }
    throw err;
  }

  return {};
}

// ---------------------------------------------------------------------------
// Register
// ---------------------------------------------------------------------------

export type RegisterActionState = {
  error?: string;
  fieldErrors?: Partial<Record<string, string>>;
  success?: boolean;
};

export async function registerAction(
  _prev: RegisterActionState,
  formData: FormData,
): Promise<RegisterActionState> {
  const raw = {
    nameAr: formData.get("nameAr"),
    name: formData.get("name") || "",
    academicId: formData.get("academicId"),
    email: formData.get("email") || "",
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  };

  const parsed = registerSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Partial<Record<string, string>> = {};
    for (const issue of parsed.error.issues) {
      const key = issue.path[0];
      if (typeof key === "string" && !fieldErrors[key]) {
        fieldErrors[key] = issue.message;
      }
    }
    return { fieldErrors };
  }

  const emailToUse = parsed.data.email || `${parsed.data.academicId}@grads.system`;

  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { email: emailToUse },
        { academicId: parsed.data.academicId },
      ],
    },
  });
  if (existing) {
    return {
      error: "An account with this email or academic ID already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        nameAr: parsed.data.nameAr,
        name: parsed.data.name || null,
        email: emailToUse,
        academicId: parsed.data.academicId,
        passwordHash,
        role: "STUDENT",
        isApproved: false,
      },
    });

    await tx.studentProfile.create({
      data: {
        userId: user.id,
        major: "",
      },
    });

    const defaultSteps = [
      { label: "Fill graduation form", order: 1 },
      { label: "Verify data", order: 2 },
      { label: "Send to higher education", order: 3 },
      { label: "Authenticate certificate", order: 4 },
    ];

    await tx.certificateStep.createMany({
      data: defaultSteps.map((step) => ({
        userId: user.id,
        label: step.label,
        order: step.order,
        status: "PENDING" as const,
      })),
    });
  });

  return { success: true };
}
