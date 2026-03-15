import { redirect } from "next/navigation";
import { getNotificationsWithUsers } from "@/lib/api/notifications";
import { getStaffUsers } from "@/lib/api/students";
import { auth } from "@/lib/auth";
import AdminNotificationsClient from "./notifications-client";

export default async function AdminNotificationsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  const [notifications, staffUsers] = await Promise.all([
    getNotificationsWithUsers(),
    getStaffUsers(),
  ]);

  return (
    <AdminNotificationsClient
      initialNotifications={notifications}
      staffUsers={staffUsers}
    />
  );
}
