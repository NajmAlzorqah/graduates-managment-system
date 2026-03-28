import { NextResponse } from "next/server";
import { confirmGraduationForm } from "@/lib/api/graduation-forms";
import { auth } from "@/lib/auth";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "STUDENT") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const form = await confirmGraduationForm(session.user.id);
    return NextResponse.json(form);
  } catch (error) {
    console.error("Error confirming graduation form:", error);
    return NextResponse.json(
      { error: "Failed to confirm graduation form" },
      { status: 500 },
    );
  }
}
