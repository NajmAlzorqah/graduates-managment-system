import { NextResponse } from "next/server";
import { deleteAllUserNotifications } from "@/lib/api/notifications";
import { auth } from "@/lib/auth";

export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await deleteAllUserNotifications(session.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete notifications:", error);
    return NextResponse.json(
      { error: "Failed to delete notifications" },
      { status: 500 },
    );
  }
}
