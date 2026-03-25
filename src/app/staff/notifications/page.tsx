import { redirect } from "next/navigation";
import {
  getIncomingNotifications,
  getOutgoingNotifications,
} from "@/lib/api/notifications";
import { auth } from "@/lib/auth";
import NotificationsPageClient from "./client-page";

export default async function StaffNotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [incoming, outgoing] = await Promise.all([
    getIncomingNotifications(session.user.id),
    getOutgoingNotifications(session.user.id),
  ]);

  return (
    <NotificationsPageClient
      incomingNotifications={incoming}
      outgoingNotifications={outgoing}
    />
  );
}
