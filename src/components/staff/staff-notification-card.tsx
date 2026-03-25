"use client";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { deleteNotificationAction } from "@/lib/actions/staff-notifications";
import {
  getNotificationRecipientName,
  getNotificationSenderName,
} from "@/lib/utils";
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
      className="text-white/80"
      role="img"
      aria-label="Actions"
    >
      <title>Actions</title>
      <circle cx="5" cy="5" r="5" fill="currentColor" />
      <circle cx="5" cy="19.5" r="5" fill="currentColor" />
      <circle cx="5" cy="34" r="5" fill="currentColor" />
    </svg>
  );
}

export default function StaffNotificationCard({
  notification,
}: NotificationCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const sentAt = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  }).format(notification.createdAt);

  const handleDelete = async () => {
    if (!confirm("هل أنت متأكد من حذف هذا الإشعار؟")) return;

    setIsDeleting(true);
    try {
      const result = await deleteNotificationAction(notification.id);
      if (result.success) {
        toast.success("تم حذف الإشعار بنجاح");
      } else {
        toast.error("فشل حذف الإشعار");
      }
    } catch (_error) {
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`relative flex min-h-[160px] w-full flex-col rounded-[40px] bg-[#ffb755] p-6 shadow-lg md:min-h-[211px] md:p-8 ${isDeleting ? "opacity-50 grayscale" : ""}`}
      dir="rtl"
    >
      {/* Three dots icon - left side (visually) in RTL */}
      <div className="absolute top-8 left-8 md:left-10 z-10">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 transition-all hover:bg-black/5 rounded-full active:scale-90"
        >
          <ThreeDotsIcon />
        </button>

        <AnimatePresence>
          {showMenu && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-20"
                onClick={() => setShowMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: -10 }}
                className="absolute left-0 mt-2 min-w-[160px] rounded-2xl bg-white p-2 shadow-2xl z-30"
              >
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-lg font-bold text-red-500 transition-colors hover:bg-red-50 active:scale-95 disabled:opacity-50"
                >
                  <Trash2 className="size-6" />
                  <span>حذف</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-2 md:gap-4 pl-12 md:pl-16">
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
