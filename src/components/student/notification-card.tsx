"use client";

import { useEffect, useRef, useState } from "react";
import type { NotificationWithUsers } from "@/types/notification";
import { getNotificationSenderName } from "@/lib/utils";

/** Serialized version of Notification (Date → string across the server/client boundary) */
export type SerializedNotification = Omit<NotificationWithUsers, "createdAt"> & {
  createdAt: string;
};

type NotificationCardProps = {
  notification: SerializedNotification;
  onMarkRead: (id: string) => void;
  onDismiss: (id: string) => void;
};

function ThreeDotsIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="9" cy="3" r="1.6" />
      <circle cx="9" cy="9" r="1.6" />
      <circle cx="9" cy="15" r="1.6" />
    </svg>
  );
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

export default function NotificationCard({
  notification,
  onMarkRead,
  onDismiss,
}: NotificationCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    }

    if (showMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMenu]);

  return (
    <div
      className="bg-white rounded-[20px] px-4 pt-3 pb-4 shadow-[inset_0px_4px_4px_rgba(0,0,0,0.25)]"
      dir="rtl"
    >
      {/*
       * RTL flex-row: logical start → physical right, logical end → physical left
       * DOM order: title (start = right) :: three-dot button (end = left)
       */}
      <div className="flex items-start justify-between mb-2">
        <p className="font-arabic font-bold text-lg text-[#ffb755] leading-snug">
          {notification.title}
        </p>
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            className="text-[#1a3b5c]/40 hover:text-[#1a3b5c] transition-colors flex-shrink-0 p-1"
            aria-label="خيارات الإشعار"
            aria-expanded={showMenu}
            onClick={() => setShowMenu((prev) => !prev)}
          >
            <ThreeDotsIcon />
          </button>

          {showMenu && (
            <div className="absolute top-8 left-0 min-w-[120px] bg-white rounded-[12px] shadow-[0_4px_12px_rgba(0,0,0,0.1)] border border-gray-100 py-1.5 z-10 animate-in fade-in zoom-in-95 duration-100">
              <button
                type="button"
                className="w-full flex items-center justify-between px-3 py-2 text-red-500 hover:bg-gray-50 transition-colors gap-2"
                onClick={() => {
                  setShowMenu(false);
                  onDismiss(notification.id);
                }}
              >
                <span className="font-arabic font-semibold text-[15px]">
                  حذف
                </span>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message body */}
      <p className="font-arabic text-[#1a3b5c] text-base leading-relaxed mb-3">
        {notification.message}
      </p>

      {/* View/Show button container */}
      <div className="flex justify-center mb-3">
        <button
          type="button"
          onClick={() => onMarkRead(notification.id)}
          className="bg-[#ffb755] text-white font-arabic font-bold text-base px-10 py-1.5 rounded-full hover:bg-[#e5a547] active:bg-[#d4953e] transition-colors shadow-sm"
        >
          عرض
        </button>
      </div>

      {/*
       * RTL flex-row: sender (start = physical right) :: date (end = physical left)
       */}
      <div className="flex items-center justify-between">
        <p className="font-arabic text-[#ffb755] font-medium text-sm">
          {getNotificationSenderName(notification.sentBy)}
        </p>
        <p className="text-[#ffb755] font-semibold text-sm tabular-nums">
          {formatDate(notification.createdAt)}
        </p>
      </div>
    </div>
  );
}
