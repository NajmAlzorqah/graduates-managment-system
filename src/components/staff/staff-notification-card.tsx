"use client";
import { getNotificationRecipientName, getNotificationSenderName } from "@/lib/utils";
import { motion } from "framer-motion";
import type { NotificationWithUsers } from "@/types/notification";

type NotificationCardProps = {
  notification: NotificationWithUsers;
};

function ThreeDotsIcon() {
  return (
    <svg
      width="10"
      height="39"
      viewBox="0 0 10 39"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-white/60"
      role="img"
      aria-label="Actions"
    >
      <title>Actions</title>
      <circle cx="5" cy="5" r="5" fill="white" />
      <circle cx="5" cy="19.5" r="5" fill="white" />
      <circle cx="5" cy="34" r="5" fill="white" />
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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="relative flex min-h-[160px] w-full flex-col rounded-[40px] bg-[#ffb755] p-6 shadow-lg md:min-h-[211px] md:p-8"
      dir="rtl"
    >
      {/* Three dots icon - left side in RTL */}
      <div className="absolute top-8 right-8 md:right-10">
        <ThreeDotsIcon />
      </div>

      <div className="flex flex-col gap-2 md:gap-4 pr-12 md:pr-16">
        {/* Title */}
        <h3 className="text-xl font-bold text-white md:text-3xl lg:text-4xl">
          {notification.title}
        </h3>

        {/* Message */}
        <p className="text-lg font-medium text-[#1a3b5c] md:text-2xl lg:text-3xl leading-relaxed">
          {notification.message}
        </p>

        {/* Footer info */}
        <div className="mt-auto flex flex-wrap items-end justify-between gap-4">
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white md:text-lg lg:text-xl">
                المرسل
              </span>
              <span className="text-sm font-bold text-[#1a3b5c] md:text-xl lg:text-2xl">
                {getNotificationSenderName(notification.sentBy)}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-white md:text-lg lg:text-xl">
                المستقبل
              </span>
              <span className="text-sm font-bold text-[#1a3b5c] md:text-xl lg:text-2xl">
                {getNotificationRecipientName(notification.user)}
              </span>
            </div>
          </div>

          <div className="text-sm font-medium text-[#1a3b5c] md:text-xl lg:text-2xl">
            {sentAt}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
