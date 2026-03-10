import { NextResponse } from "next/server";
import { getStudentHomeData } from "@/lib/api/student-home";
import { auth } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const data = await getStudentHomeData(session.user.id);
  return NextResponse.json(data);
}
