"use client";

import { AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import StaffNotificationCard from "@/components/staff/staff-notification-card";
import StaffSectionShell from "@/components/staff/staff-section-shell";
import type { Notification } from "@/types/notification";

type NotificationsPageClientProps = {
  notifications: Notification[];
};

export default function NotificationsPageClient({
  notifications,
}: NotificationsPageClientProps) {
  const [filter, setFilter] = useState<"all" | "sent">("all");

  // This would need more robust logic for a real "sent" filter
  const filteredNotifications =
    filter === "sent"
      ? notifications.slice(0, Math.ceil(notifications.length / 2))
      : notifications;

  return (
    <StaffSectionShell
      title="Notifications"
      subtitle="Send and view notifications"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFilter("all")}
              className={`rounded-full px-6 py-2 font-bold text-white ${
                filter === "all" ? "bg-[#ffb755]" : "bg-gray-400"
              }`}
            >
              All
            </button>
            <button
              type="button"
              onClick={() => setFilter("sent")}
              className={`rounded-full px-6 py-2 font-bold text-white ${
                filter === "sent" ? "bg-[#ffb755]" : "bg-gray-400"
              }`}
            >
              Sent
            </button>
          </div>
          <Link href="/staff/notifications/new">
            <button
              type="button"
              className="rounded-full bg-[#ffb755] px-6 py-2 font-bold text-white"
            >
              Send New
            </button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <AnimatePresence>
            {filteredNotifications.map((notification) => (
              <StaffNotificationCard
                key={notification.id}
                notification={notification}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>
    </StaffSectionShell>
  );
}
