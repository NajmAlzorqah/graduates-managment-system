"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Search } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import AdminNotificationCard from "@/components/admin/admin-notification-card";
import { Input } from "@/components/ui/input";
import type { NotificationWithUsers } from "@/types/notification";

type NotificationsClientProps = {
  initialNotifications: NotificationWithUsers[];
  staffUsers: { id: string; nameAr: string | null; name: string | null }[];
};

export default function AdminNotificationsClient({
  initialNotifications,
  staffUsers,
}: NotificationsClientProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSenderId, setSelectedSenderId] = useState("");

  const filteredNotifications = initialNotifications.filter((n) => {
    // Search query filter
    const matchesSearch =
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.sentBy?.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.user.nameAr?.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    // Detailed filters
    if (filterType === "date" && selectedDate) {
      const nDate = new Date(n.createdAt).toISOString().split("T")[0];
      if (nDate !== selectedDate) return false;
    }

    if (filterType === "sender" && selectedSenderId) {
      if (n.sentById !== selectedSenderId) return false;
    }

    return true;
  });

  return (
    <div className="flex flex-col gap-10 pb-10">
      {/* Page Title - Centered */}
      <div className="w-full text-center">
        <h1 className="text-4xl font-bold text-white md:text-[50px]">
          Notifications
        </h1>
      </div>

      {/* Header controls - Single row with equal wide spacing */}
      <div className="flex w-full flex-col items-center justify-between gap-6 px-4 md:flex-row md:px-10">
        {/* Detailed Filter Dropdown */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setSelectedDate("");
                setSelectedSenderId("");
              }}
              className="h-[52px] min-w-[160px] appearance-none rounded-full bg-[#ffb755] px-6 text-[18px] font-bold text-white shadow-lg outline-none transition-all hover:scale-105"
            >
              <option value="all">Filter: All</option>
              <option value="date">Filter by Date</option>
              <option value="sender">Filter by Sender</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-white" />
          </div>

          {/* Conditional inputs based on filter selection */}
          <AnimatePresence mode="wait">
            {filterType === "date" && (
              <motion.input
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-[52px] rounded-full bg-white px-4 text-[#1a3b5c] shadow-md outline-none"
              />
            )}
            {filterType === "sender" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="relative"
              >
                <select
                  value={selectedSenderId}
                  onChange={(e) => setSelectedSenderId(e.target.value)}
                  className="h-[52px] min-w-[180px] appearance-none rounded-full bg-white px-6 text-[#1a3b5c] shadow-md outline-none"
                >
                  <option value="">Select Staff</option>
                  {staffUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.nameAr || user.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-5 -translate-y-1/2 text-[#1a3b5c]" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Search Bar */}
        <div className="relative w-full max-w-[400px]">
          <Input
            placeholder="Search by title, message or user..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-[52px] rounded-full border-0 bg-white pl-12 pr-6 text-[18px] font-medium text-[#1a3b5c] placeholder:text-[#1a3b5c]/50 focus-visible:ring-2 focus-visible:ring-[#ffb755]"
          />
          <Search className="absolute left-4 top-1/2 size-6 -translate-y-1/2 text-[#ffb755]" />
        </div>

        {/* Send New Button */}
        <Link
          href="/admin/notifications/new"
          className="flex h-[52px] min-w-[180px] items-center justify-center rounded-full bg-[#ffb755] px-8 text-[20px] font-bold text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          send new
        </Link>
      </div>

      {/* Main Content Card Container */}
      <div className="min-h-[600px] rounded-[60px] bg-white/95 p-6 shadow-2xl md:p-10 lg:p-16">
        <div className="mx-auto flex max-w-5xl flex-col gap-8">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
              >
                <AdminNotificationCard notification={notification} />
              </motion.div>
            ))
          ) : (
            <div className="py-20 text-center">
              <p className="text-2xl font-bold text-[#1a3b5c]/40">
                No notifications found
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
