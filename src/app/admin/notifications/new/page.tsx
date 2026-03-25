import { redirect } from "next/navigation";
import NotificationForm from "@/components/notifications/notification-form";
import { getStudentsBasicInfo } from "@/lib/api/students";
import { auth } from "@/lib/auth";

export default async function AdminNewNotificationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const students = await getStudentsBasicInfo();

  return (
    <NotificationForm
      students={students}
      backLink="/admin/notifications"
      role="ADMIN"
    />
  );
}
