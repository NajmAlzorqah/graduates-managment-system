"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/lib/auth";
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

  try {
    await signIn("credentials", {
      academicId: parsed.data.academicId,
      password: parsed.data.password,
      // redirectTo is handled by the auth config (pages.signIn) and the
      // root page.tsx which reads the session and redirects by role.
      redirect: true,
      redirectTo: "/",
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
    name: formData.get("name"),
    academicId: formData.get("academicId"),
    email: formData.get("email"),
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

  // TODO: swap mock for real Prisma call:
  // const existing = await prisma.user.findFirst({
  //   where: { OR: [{ email: parsed.data.email }, { academicId: parsed.data.academicId }] },
  // });
  // if (existing) return { error: "An account with this email or academic ID already exists." };
  // const passwordHash = await bcrypt.hash(parsed.data.password, 12);
  // await prisma.user.create({
  //   data: { name: parsed.data.name, email: parsed.data.email, academicId: parsed.data.academicId, passwordHash },
  // });

  return { success: true };
}
