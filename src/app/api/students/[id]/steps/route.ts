import { NextResponse } from "next/server";
import {
  getStepsByStudent,
  updateStepStatus,
} from "@/lib/api/certificate-steps";
import { auth } from "@/lib/auth";
import { updateStepStatusSchema } from "@/lib/validations/certificate-step";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Students can view their own steps; staff/admin can view any
  if (session.user.role === "STUDENT" && session.user.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const steps = await getStepsByStudent(id);
  return NextResponse.json(steps);
}

export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await params;
  const body: unknown = await request.json();

  // Expect { stepId, status } in body — id param is the student's userId
  const stepId = (body as Record<string, unknown>)?.stepId;
  if (typeof stepId !== "string") {
    return NextResponse.json({ error: "stepId is required" }, { status: 400 });
  }

  const parsed = updateStepStatusSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const step = await updateStepStatus(
    stepId,
    parsed.data.status,
    session.user.id,
  );
  return NextResponse.json(step);
}
