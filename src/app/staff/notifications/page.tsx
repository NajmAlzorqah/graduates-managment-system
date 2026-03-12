import { getNotifications } from "@/lib/api/notifications";
import { getStudents } from "@/lib/api/students";
import NotificationsPageClient from "./client-page";

export default async function StaffNotificationsPage() {
  // This is not ideal, we should fetch notifications for the staff member
  // but the current API doesn't support that.
  // We will fetch all students and all notifications for now.
  const students = await getStudents();
  const allNotifications = await Promise.all(
    students.map((s) => getNotifications(s.id)),
  );
  const notifications = allNotifications.flat();

  return <NotificationsPageClient notifications={notifications} />;
}
