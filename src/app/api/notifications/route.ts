import { NextResponse } from "next/server";
import {
  createGroupNotification,
  createNotification,
  getNotifications,
} from "@/lib/api/notifications";
import { auth } from "@/lib/auth";
import { createNotificationSchema } from "@/lib/validations/notification";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const notifications = await getNotifications(session.user.id);
  return NextResponse.json(notifications);
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body: unknown = await request.json();
  const parsed = createNotificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { title, message, userId, userIds } = parsed.data;

  if (userIds) {
    const count = await createGroupNotification(
      session.user.id,
      userIds,
      title,
      message,
    );
    return NextResponse.json({ count }, { status: 201 });
  }

  if (!userId) {
    return NextResponse.json(
      { error: "userId or userIds is required" },
      { status: 400 },
    );
  }

  const notification = await createNotification(
    session.user.id,
    userId,
    title,
    message,
  );
  return NextResponse.json(notification, { status: 201 });
}
