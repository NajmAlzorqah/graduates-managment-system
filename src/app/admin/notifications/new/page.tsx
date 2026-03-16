import { redirect } from "next/navigation";
import SendNotificationScreen from "@/components/admin/send-notification-screen";
import { getNotificationTemplates } from "@/lib/api/notification-templates";
import { getStaffUsers } from "@/lib/api/students";
import { auth } from "@/lib/auth";

export default async function AdminNewNotificationPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [staffUsers, templates] = await Promise.all([
    getStaffUsers(),
    getNotificationTemplates(),
  ]);

  return (
    <SendNotificationScreen
      staffUsers={staffUsers}
      initialTemplates={templates}
    />
  );
}
