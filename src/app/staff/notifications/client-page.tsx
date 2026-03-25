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
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
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
  const [filterType, setFilterType] = useState<"all" | "individual" | "group">(
    "all",
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Grouping logic for "Group" notifications in outgoing tab
  const getFilteredAndGrouped = () => {
    const base =
      activeTab === "incoming" ? incomingNotifications : outgoingNotifications;

    // Filter by search query first
    const filtered = base.filter(
      (n) =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.user.nameAr?.includes(searchQuery) ||
        n.sentBy?.nameAr?.includes(searchQuery),
    );

    if (activeTab === "outgoing") {
      // Group by (title, message, createdAt_rounded) to detect group notifications
      const groups: Record<string, NotificationWithUsers[]> = {};
      filtered.forEach((n) => {
        const timeKey = new Date(n.createdAt).getTime();
        // Allow 2 second window for group creation
        const roundedTime = Math.floor(timeKey / 2000);
        const key = `${n.title}|${n.message}|${roundedTime}`;
        if (!groups[key]) groups[key] = [];
        groups[key].push(n);
      });

      const groupedResult: (NotificationWithUsers & {
        isGroup?: boolean;
        count?: number;
      })[] = [];
      Object.values(groups).forEach((group) => {
        if (group.length > 1) {
          groupedResult.push({
            ...group[0],
            isGroup: true,
            count: group.length,
            user: {
              ...group[0].user,
              nameAr: `مجموعة (${group.length} طلاب)`,
              role: "GROUP",
            },
          });
        } else {
          groupedResult.push(group[0]);
        }
      });

      // Filter by type
      if (filterType === "individual") {
        return groupedResult.filter((n) => !n.isGroup);
      } else if (filterType === "group") {
        return groupedResult.filter((n) => n.isGroup);
      }
      return groupedResult;
    }

    return filtered;
  };

  const displayNotifications = getFilteredAndGrouped();

  const filterLabels = {
    all: "All",
    individual: "Individual",
    group: "Group",
  };

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

            {/* Dynamic Filter Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className="h-12 px-6 rounded-full bg-[#ffb755] text-white text-lg font-bold flex items-center gap-2 shadow-md hover:bg-[#ffa030] transition-colors min-w-[140px] justify-between"
              >
                <span>{filterLabels[filterType]}</span>
                <div
                  className={`transition-transform duration-200 ${isFilterOpen ? "rotate-180" : ""}`}
                >
                  <ChevronDownIcon />
                </div>
              </button>

              <AnimatePresence>
                {isFilterOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setIsFilterOpen(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-20 overflow-hidden"
                    >
                      {(["all", "individual", "group"] as const).map((type) => (
                        <button
                          key={type}
                          onClick={() => {
                            setFilterType(type);
                            setIsFilterOpen(false);
                          }}
                          className={`w-full text-left px-6 py-3 text-lg font-bold transition-colors hover:bg-gray-50 ${
                            filterType === type
                              ? "text-[#ffb755]"
                              : "text-[#1a3b5c]"
                          }`}
                        >
                          {filterLabels[type]}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
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
          {displayNotifications.length > 0 ? (
            displayNotifications.map((notification) => (
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
