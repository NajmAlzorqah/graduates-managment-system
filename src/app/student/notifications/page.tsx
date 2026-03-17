import { redirect } from "next/navigation";
import type { SerializedNotification } from "@/components/student/notification-card";
import NotificationsList from "@/components/student/notifications-list";
import { getIncomingNotifications } from "@/lib/api/notifications";
import { auth } from "@/lib/auth";

export default async function StudentNotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const raw = await getIncomingNotifications(session.user.id);

  // Serialize Dates to strings for the client component boundary
  const notifications: SerializedNotification[] = raw.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));

  return <NotificationsList initialNotifications={notifications} />;
}
