import { NextResponse } from "next/server";
import {
  getGraduationForm,
  submitGraduationForm,
} from "@/lib/api/graduation-forms";
import { auth } from "@/lib/auth";
import { submitGraduationFormSchema } from "@/lib/validations/graduation-form";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const form = await getGraduationForm(session.user.id);
  return NextResponse.json(form);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: unknown = await request.json();
  const parsed = submitGraduationFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const form = await submitGraduationForm(session.user.id, parsed.data);
  return NextResponse.json(form, { status: 201 });
}
