"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";
import StaffNotificationCard from "@/components/staff/staff-notification-card";
import type { NotificationWithUsers } from "@/types/notification";

type NotificationsPageClientProps = {
  incomingNotifications: NotificationWithUsers[];
  outgoingNotifications: NotificationWithUsers[];
};

function SearchIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-[#1a3b5c]/60"
      role="img"
      aria-label="Search"
    >
      <title>Search</title>
      <circle
        cx="11"
        cy="11"
        r="7"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M20 20L17 17"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="Chevron Down"
    >
      <title>Chevron Down</title>
      <path
        d="M6 9L12 15L18 9"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}


export default function NotificationsPageClient({
  incomingNotifications,
  outgoingNotifications,
}: NotificationsPageClientProps) {
  const [activeTab, setActiveTab] = useState<"incoming" | "outgoing">(
    "outgoing",
  );
  const [searchQuery, setSearchQuery] = useState("");

  const filteredNotifications = (
    activeTab === "incoming" ? incomingNotifications : outgoingNotifications
  ).filter(
    (n) =>
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.user.nameAr?.includes(searchQuery) ||
      n.sentBy?.nameAr?.includes(searchQuery),
  );

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header Section */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Search Bar */}
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <SearchIcon />
            </div>
            <input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 pl-12 pr-4 rounded-full bg-white text-[#1a3b5c] text-lg font-bold placeholder:text-[#1a3b5c]/60 focus:outline-none shadow-sm"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4">
            <Link href="/staff/notifications/new">
              <button
                type="button"
                className="h-12 px-8 rounded-full bg-[#ffb755] text-white text-lg font-bold shadow-md hover:bg-[#ffa030] transition-colors"
              >
                send new
              </button>
            </Link>
            <div className="relative group">
              <button
                type="button"
                className="h-12 px-6 rounded-full bg-[#ffb755] text-white text-lg font-bold flex items-center gap-2 shadow-md hover:bg-[#ffa030] transition-colors"
              >
                All
                <ChevronDownIcon />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-[#1a3b5c]/10 pb-2">
        <button
          onClick={() => setActiveTab("outgoing")}
          className={`px-4 py-2 text-xl font-bold transition-all relative ${
            activeTab === "outgoing"
              ? "text-[#1a3b5c]"
              : "text-[#1a3b5c]/60 hover:text-[#1a3b5c]/80"
          }`}
        >
          Outgoing
          {activeTab === "outgoing" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-[-2px] left-0 right-0 h-1 bg-[#ffb755] rounded-full"
            />
          )}
        </button>
        <button
          onClick={() => setActiveTab("incoming")}
          className={`px-4 py-2 text-xl font-bold transition-all relative ${
            activeTab === "incoming"
              ? "text-[#1a3b5c]"
              : "text-[#1a3b5c]/60 hover:text-[#1a3b5c]/80"
          }`}
        >
          Incoming
          {activeTab === "incoming" && (
            <motion.div
              layoutId="activeTab"
              className="absolute bottom-[-2px] left-0 right-0 h-1 bg-[#ffb755] rounded-full"
            />
          )}
        </button>
      </div>

      {/* Notifications List */}
      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <StaffNotificationCard
                key={notification.id}
                notification={notification}
              />
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20 text-[#1a3b5c]/60 text-xl font-medium"
            >
              No notifications found
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
