"use client";
import { motion } from "framer-motion";
import type { Notification } from "@/types/notification";

type NotificationCardProps = {
  notification: Notification;
};

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-6 w-6"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </svg>
  );
}

export default function StaffNotificationCard({
  notification,
}: NotificationCardProps) {
  const sentAt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(notification.createdAt);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col rounded-2xl bg-white p-4 shadow-lg md:flex-row md:items-start md:gap-6 md:p-6"
    >
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#1a3b5c]">
            {notification.title}
          </h3>
          <p className="text-sm text-gray-500">{sentAt}</p>
        </div>
        <p className="mt-2 text-gray-700">{notification.message}</p>
        <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
          <div>
            <span className="font-semibold">From:</span>{" "}
            {notification.sentById || "System"}
          </div>
          <div>
            <span className="font-semibold">To:</span> {notification.userId}
          </div>
        </div>
      </div>
      <div className="mt-4 flex justify-end md:mt-0">
        <button
          type="button"
          className="text-red-500 hover:text-red-700"
          aria-label="Delete notification"
        >
          <TrashIcon />
        </button>
      </div>
    </motion.div>
  );
}
