"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Trash2, XCircle } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import {
  deleteAllNotificationsAction,
  deleteNotificationAction,
} from "@/lib/actions/staff-notifications";
import {
  getNotificationRecipientName,
  getNotificationSenderName,
} from "@/lib/utils";
import type { NotificationWithUsers } from "@/types/notification";

type AdminNotificationCardProps = {
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

export default function AdminNotificationCard({
  notification,
}: AdminNotificationCardProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (confirm("هل أنت متأكد من حذف هذا الإشعار؟")) {
      setIsDeleting(true);
      const result = await deleteNotificationAction(notification.id);
      if (result.success) {
        toast.success("تم حذف الإشعار");
      } else {
        toast.error(result.error);
        setIsDeleting(false);
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

  const senderName = getNotificationSenderName(notification.sentBy);
  const recipientName = getNotificationRecipientName(notification.user);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`relative flex w-full flex-col overflow-hidden rounded-[24px] bg-[#ffb755] shadow-lg md:rounded-[30px] ${isDeleting ? "opacity-50 grayscale" : ""}`}
    >
      {/* Title Header - White font on slightly darker orange */}
      <div
        className="flex items-center justify-between bg-[#f39c12] px-6 py-4 md:px-8"
        dir="rtl"
      >
        <h3 className="text-right text-[22px] font-bold text-white md:text-[26px]">
          {notification.title}
        </h3>

        {/* Three-dots Menu - Left side visually in RTL */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="flex h-12 w-8 items-center justify-center rounded-full text-white transition-colors hover:bg-white/20 active:bg-white/40"
            aria-label="Actions"
          >
            <ThreeDotsIcon />
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
                    disabled={isDeleting}
                  >
                    <Trash2 className="size-5" />
                    <span>حذف الإشعار</span>
                  </button>
                  <button
                    type="button"
                    className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-right text-sm font-semibold text-[#1a3b5c] transition-colors hover:bg-gray-100"
                    onClick={handleClearAll}
                  >
                    <XCircle className="size-5" />
                    <span>مسح جميع الإشعارات</span>
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
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
