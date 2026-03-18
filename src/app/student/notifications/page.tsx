import { redirect } from "next/navigation";
import type { SerializedNotification } from "@/components/student/notification-card";
import NotificationsList from "@/components/student/notifications-list";
import { getIncomingNotifications } from "@/lib/api/notifications";
import { getStudentById } from "@/lib/api/students";
import { auth } from "@/lib/auth";

export default async function StudentNotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [raw, student] = await Promise.all([
    getIncomingNotifications(session.user.id),
    getStudentById(session.user.id),
  ]);

  // Serialize Dates to strings for the client component boundary
  const notifications: SerializedNotification[] = raw.map((n) => ({
    ...n,
    createdAt: n.createdAt.toISOString(),
  }));

  return (
    <NotificationsList
      initialNotifications={notifications}
      student={student}
    />
  );
}
