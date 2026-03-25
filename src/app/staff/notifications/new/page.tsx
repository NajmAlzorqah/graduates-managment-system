import { redirect } from "next/navigation";
import NotificationForm from "@/components/notifications/notification-form";
import { getStudentsBasicInfo } from "@/lib/api/students";
import { auth } from "@/lib/auth";

export default async function NewNotificationPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== "STAFF") {
    redirect("/login");
  }

  const students = await getStudentsBasicInfo();

  return (
    <div className="w-full">
      <NotificationForm
        students={students}
        backLink="/staff/notifications"
        role="STAFF"
      />
    </div>
  );
}
