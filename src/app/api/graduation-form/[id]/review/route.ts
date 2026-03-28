import { NextResponse } from "next/server";
import { reviewGraduationForm } from "@/lib/api/graduation-forms";
import { auth } from "@/lib/auth";
import { reviewGraduationFormSchema } from "@/lib/validations/graduation-form";

type Params = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body: unknown = await request.json();
  const parsed = reviewGraduationFormSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const form = await reviewGraduationForm(
    id,
    parsed.data.status,
    session.user.id,
    parsed.data.comments,
  );
  return NextResponse.json(form);
}
