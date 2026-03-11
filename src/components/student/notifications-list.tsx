"use client";

import { useState, useTransition } from "react";
import { Toaster } from "react-hot-toast";
import NotificationCard, {
  type SerializedNotification,
} from "@/components/student/notification-card";
import NotificationDetailsModal from "@/components/student/notification-details-modal";

type NotificationsListProps = {
  initialNotifications: SerializedNotification[];
};

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="17" y1="17" x2="22" y2="22" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M7 10l5 5 5-5H7z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M9 3v1H4v2h1v13a2 2 0 002 2h10a2 2 0 002-2V6h1V4h-5V3H9zm0 5h2v9H9V8zm4 0h2v9h-2V8z" />
    </svg>
  );
}

export default function NotificationsList({
  initialNotifications,
}: NotificationsListProps) {
  const [notifications, setNotifications] =
    useState<SerializedNotification[]>(initialNotifications);
  const [search, setSearch] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal state
  const [selectedNotification, setSelectedNotification] =
    useState<SerializedNotification | null>(null);

  const filtered =
    search.trim() === ""
      ? notifications
      : notifications.filter(
          (n) => n.title.includes(search) || n.message.includes(search),
        );

  function handleMarkRead(id: string) {
    const notif = notifications.find((n) => n.id === id);
    if (notif) setSelectedNotification(notif);

    // Only mark read if unread
    if (notif && !notif.isRead) {
      startTransition(async () => {
        await fetch(`/api/notifications/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isRead: true }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
        );
      });
    }
  }

  function handleDismiss(id: string) {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }

  function handleDeleteAll() {
    startTransition(async () => {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications([]);
    });
  }

  return (
    <div className="flex flex-col min-h-[calc(100dvh-78px)]">
      {/* Page title */}
      <h1
        className="text-white font-arabic font-bold text-4xl text-center pt-10 pb-5"
        dir="rtl"
      >
        الاشعارات
      </h1>

      {/* Filter + Search row — LTR layout: filter button on left, search on right */}
      <div className="flex items-center gap-3 px-4 pb-5">
        {/* Filter button (left) */}
        <button
          type="button"
          className="flex items-center gap-1 bg-[#ffb755] text-white font-arabic font-bold text-sm px-4 py-2 rounded-full flex-shrink-0 shadow-sm"
          aria-label="تصفية الإشعارات"
        >
          <ChevronDownIcon />
          <span>الكل</span>
        </button>

        {/* Search input (right) */}
        <div className="relative flex-1">
          <input
            type="search"
            inputMode="search"
            placeholder="بحث..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            dir="rtl"
            className="w-full bg-white rounded-full pl-9 pr-4 py-2 font-arabic text-sm text-[#1a3b5c] placeholder:text-[#1a3b5c]/55 outline-none focus:ring-2 focus:ring-[#ffb755]/50"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#1a3b5c]/50 pointer-events-none">
            <SearchIcon />
          </span>
        </div>
      </div>

      {/* Notification cards list */}
      <div className="flex flex-col gap-4 px-4 flex-1">
        <Toaster position="top-center" />
        {filtered.length === 0 ? (
          <p className="text-white/50 font-arabic text-center mt-16 text-lg">
            لا توجد إشعارات
          </p>
        ) : (
          filtered.map((notification) => (
            <NotificationCard
              key={notification.id}
              notification={notification}
              onMarkRead={handleMarkRead}
              onDismiss={handleDismiss}
            />
          ))
        )}
      </div>

      {/* Delete All button — shown only when there are notifications */}
      {notifications.length > 0 && (
        <div className="flex justify-end px-4 py-6 mb-20">
          <button
            type="button"
            onClick={handleDeleteAll}
            disabled={isPending}
            className="flex items-center gap-2 bg-[#ffb755] text-[#1a3b5c] font-arabic font-bold text-lg px-6 py-3 rounded-full hover:bg-[#e5a547] active:bg-[#d4953e] transition-colors shadow-md disabled:opacity-60"
          >
            <TrashIcon />
            <span>حذف الكل</span>
          </button>
        </div>
      )}

      {selectedNotification && (
        <NotificationDetailsModal
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </div>
  );
}
