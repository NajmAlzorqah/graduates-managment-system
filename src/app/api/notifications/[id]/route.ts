import { NextResponse } from "next/server";
import { markAsRead } from "@/lib/api/notifications";
import { auth } from "@/lib/auth";
import { markReadSchema } from "@/lib/validations/notification";

type Params = { params: Promise<{ id: string }> };

export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body: unknown = await request.json();
  const parsed = markReadSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  await markAsRead(id);
  return NextResponse.json({ success: true });
}
