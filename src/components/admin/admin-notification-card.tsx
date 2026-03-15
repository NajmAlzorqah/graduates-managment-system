"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal, Trash2, UserX, XCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  deleteAllNotificationsAction,
  deleteNotificationAction,
} from "@/lib/actions/staff-notifications";
import type { NotificationWithUsers } from "@/types/notification";

type AdminNotificationCardProps = {
  notification: NotificationWithUsers;
};

export default function AdminNotificationCard({
  notification,
}: AdminNotificationCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleDelete = async () => {
    if (confirm("هل أنت متأكد من حذف هذا الإشعار؟")) {
      const result = await deleteNotificationAction(notification.id);
      if (result.success) {
        toast.success("تم حذف الإشعار");
      } else {
        toast.error(result.error);
      }
    }
    setIsMenuOpen(false);
  };

  const handleClearAll = async () => {
    if (
      confirm(
        "هل أنت متأكد من مسح جميع الإشعارات؟ لا يمكن التراجع عن هذا الإجراء.",
      )
    ) {
      const result = await deleteAllNotificationsAction();
      if (result.success) {
        toast.success("تم مسح جميع الإشعارات");
      } else {
        toast.error(result.error);
      }
    }
    setIsMenuOpen(false);
  };

  const senderName =
    notification.sentBy?.role === "ADMIN"
      ? "رئاسة الجامعة"
      : notification.sentBy?.role === "STAFF"
        ? "شؤون الخريجين"
        : (notification.sentBy?.nameAr ?? "النظام");

  const recipientName =
    notification.user.role === "ADMIN"
      ? "رئاسة الجامعة"
      : notification.user.role === "STAFF"
        ? "شؤون الخريجين"
        : (notification.user.nameAr ?? "طالب");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative flex w-full flex-col overflow-hidden rounded-[24px] bg-[#ffb755] shadow-lg md:rounded-[30px]"
    >
      {/* Title Header - White font on slightly darker orange */}
      <div className="flex items-center justify-between bg-[#f39c12] px-6 py-4 md:px-8">
        {/* Three-dots Menu */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex size-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 active:bg-white/40"
            aria-label="Actions"
          >
            <MoreHorizontal className="size-8" />
          </button>

          <AnimatePresence>
            {isMenuOpen && (
              <>
                <button
                  type="button"
                  className="fixed inset-0 z-10 h-full w-full cursor-default bg-transparent"
                  onClick={() => setIsMenuOpen(false)}
                  aria-label="Close menu"
                />
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: -10 }}
                  className="absolute left-0 top-full z-20 mt-2 w-56 origin-top-left rounded-xl bg-white p-2 shadow-xl ring-1 ring-black/5"
                >
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-right text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                    onClick={handleDelete}
                  >
                    <Trash2 className="size-5" />
                    <span>Delete for me</span>
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-right text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
                    onClick={handleDelete}
                  >
                    <UserX className="size-5" />
                    <span>Delete for all</span>
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-right text-sm font-semibold text-[#1a3b5c] transition-colors hover:bg-gray-100"
                    onClick={handleClearAll}
                  >
                    <XCircle className="size-5" />
                    <span>Clear all notifications</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <h3 className="text-right text-[22px] font-bold text-white md:text-[26px]">
          {notification.title}
        </h3>
      </div>

      <div className="flex flex-col p-6 md:p-8">
        {/* Smaller, more focused message box */}
        <div className="mb-6 ml-auto w-full md:max-w-[90%]">
          <p
            className="text-right text-[18px] leading-relaxed text-[#1a3b5c] md:text-[20px]"
            dir="rtl"
          >
            {notification.message}
          </p>
        </div>

        {/* Sender/Recipient Info */}
        <div
          className="mt-2 flex flex-wrap items-center justify-end gap-x-6 text-[15px] font-bold text-[#1a3b5c] md:text-[17px]"
          dir="rtl"
        >
          <div className="flex items-center gap-2">
            <span className="opacity-80">المرسل:</span>
            <span>{senderName}</span>
          </div>
          <div className="hidden h-4 w-px bg-[#1a3b5c]/20 md:block" />
          <div className="flex items-center gap-2">
            <span className="opacity-80">المستقبل:</span>
            <span>{recipientName}</span>
          </div>
          <div className="hidden h-4 w-px bg-[#1a3b5c]/20 md:block" />
          <div className="flex items-center gap-2">
            <span className="opacity-80">التاريخ:</span>
            <span className="font-normal">
              {new Date(notification.createdAt).toLocaleDateString("ar-SA")}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
