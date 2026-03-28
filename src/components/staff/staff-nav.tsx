"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type StaffNavProps = {
  staffName: string;
  staffDepartment: string;
};

type StaffNavIconName =
  | "home"
  | "students"
  | "user-plus"
  | "certificate"
  | "notification"
  | "reports"
  | "settings";

type StaffNavItem = {
  id: string;
  label: string;
  href: string;
  icon: StaffNavIconName;
};

const STAFF_NAV_ITEMS: StaffNavItem[] = [
  { id: "home", label: "Home", href: "/staff", icon: "home" },
  {
    id: "new-students",
    label: "New students",
    href: "/staff/students",
    icon: "user-plus",
  },
  {
    id: "manage-students",
    label: "Manage students",
    href: "/staff/manage-students",
    icon: "students",
  },
  {
    id: "certificate-status",
    label: "Certificate status",
    href: "/staff/certificates",
    icon: "certificate",
  },
  {
    id: "notifications",
    label: "Notifications",
    href: "/staff/notifications",
    icon: "notification",
  },
  { id: "reports", label: "Reports", href: "/staff/reports", icon: "reports" },
  {
    id: "settings",
    label: "Settings",
    href: "/staff/settings",
    icon: "settings",
  },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/staff") {
    return pathname === "/staff";
  }
  return pathname.startsWith(href);
}

function StaffNavIcon({
  icon,
  active,
}: {
  icon: StaffNavIconName;
  active: boolean;
}) {
  const color = active ? "#ffffff" : "#1a3b5c";

  if (icon === "home") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-7 xl:size-9"
        fill={color}
      >
        <path d="M12.91 2.18a1.4 1.4 0 0 0-1.82 0L2.2 9.7a1.37 1.37 0 0 0 .9 2.4h1.47v7.12A2.8 2.8 0 0 0 7.37 22h9.26a2.8 2.8 0 0 0 2.8-2.79v-7.12h1.47a1.37 1.37 0 0 0 .9-2.4z" />
      </svg>
    );
  }

  if (icon === "user-plus") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-7 xl:size-9"
        fill={color}
      >
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-8 8c0-3.31 3.582-6 8-6s8 2.69 8 6H4Z" />
        <path d="M19 3v2h-2v2h2v2h2V7h2V5h-2V3h-2Z" />
      </svg>
    );
  }

  if (icon === "students") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-7 xl:size-9"
        fill={color}
      >
        <path d="M9.5 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm7 2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2 18.2C2 15.88 4.12 14 6.75 14h5.5c2.63 0 4.75 1.88 4.75 4.2V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm12 1.8v-1.2c0-1.22-.33-2.32-.94-3.23a6.7 6.7 0 0 1 2.69-.57h1.5c2.07 0 3.75 1.49 3.75 3.33V20z" />
      </svg>
    );
  }

  if (icon === "certificate") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-7 xl:size-9"
        fill={color}
      >
        <path d="M11.1 2.45a1.3 1.3 0 0 1 1.8 0l1.31 1.22 1.78-.2a1.3 1.3 0 0 1 1.4 1.15l.16 1.8 1.53.92a1.3 1.3 0 0 1 .46 1.73l-.77 1.63.77 1.63a1.3 1.3 0 0 1-.46 1.73l-1.53.92-.16 1.8a1.3 1.3 0 0 1-1.4 1.15l-1.78-.2-1.31 1.22a1.3 1.3 0 0 1-1.8 0l-1.31-1.22-1.78.2a1.3 1.3 0 0 1-1.4-1.15l-.16-1.8-1.53-.92a1.3 1.3 0 0 1-.46-1.73l.77-1.63-.77-1.63a1.3 1.3 0 0 1 .46-1.73l1.53-.92.16-1.8a1.3 1.3 0 0 1 1.4-1.15l1.78.2zM12 8.1a3.9 3.9 0 1 0 0 7.8 3.9 3.9 0 0 0 0-7.8Z" />
      </svg>
    );
  }

  if (icon === "notification") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-7 xl:size-9"
        fill={color}
      >
        <path d="M12 2a6.7 6.7 0 0 0-6.7 6.7v2.56c0 .77-.3 1.51-.84 2.05l-1.2 1.21a1.2 1.2 0 0 0 .85 2.05h15.78a1.2 1.2 0 0 0 .85-2.05l-1.2-1.2a2.9 2.9 0 0 1-.84-2.06V8.7A6.7 6.7 0 0 0 12 2Zm0 20a3 3 0 0 0 2.78-1.9h-5.56A3 3 0 0 0 12 22Z" />
      </svg>
    );
  }

  if (icon === "reports") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-7 xl:size-9"
        fill={color}
      >
        <path d="M4 2.8h12.2a2.2 2.2 0 0 1 2.2 2.2v3h1.6A2.2 2.2 0 0 1 22.2 10v11.2a2.2 2.2 0 0 1-2.2 2.2H7.8a2.2 2.2 0 0 1-2.2-2.2v-3H4a2.2 2.2 0 0 1-2.2-2.2V5A2.2 2.2 0 0 1 4 2.8Zm1.6 3.4v8.6h10V6.2Zm3 3.1h4.2v1.5H8.6zm0 3.2h6.2V14H8.6ZM9 18.8h9.8V10h-1.4v6a2.2 2.2 0 0 1-2.2 2.2H9Z" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-7 xl:size-9"
      fill={color}
    >
      <path d="M10.94 2.88a1.2 1.2 0 0 1 2.12 0l.8 1.56a8.55 8.55 0 0 1 1.7.7l1.66-.53a1.2 1.2 0 0 1 1.42.55l1.28 2.22a1.2 1.2 0 0 1-.24 1.5l-1.2 1.15c.04.3.06.6.06.9s-.02.6-.06.9l1.2 1.15a1.2 1.2 0 0 1 .24 1.5l-1.28 2.22a1.2 1.2 0 0 1-1.42.55l-1.66-.53a8.5 8.5 0 0 1-1.7.7l-.8 1.56a1.2 1.2 0 0 1-2.12 0l-.8-1.56a8.5 8.5 0 0 1-1.7-.7l-1.66.53a1.2 1.2 0 0 1-1.42-.55L4.08 16.6a1.2 1.2 0 0 1 .24-1.5l1.2-1.15a7.3 7.3 0 0 1-.06-.9c0-.3.02-.6.06-.9l-1.2-1.15a1.2 1.2 0 0 1-.24-1.5l1.28-2.22a1.2 1.2 0 0 1 1.42-.55l1.66.53c.54-.3 1.1-.53 1.7-.7Zm1.06 6.67a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z" />
    </svg>
  );
}

function StaffUserAvatar() {
  return (
    <div className="flex h-[112px] w-[112px] items-center justify-center rounded-full bg-[#1a3b5c] ring-[6px] ring-[#1a3b5c] xl:h-[149px] xl:w-[149px] xl:ring-[8px]">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[70px] w-[70px] xl:h-[96px] xl:w-[96px]"
        fill="#ffffff"
      >
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.64 0-8.4 2.9-8.4 6.48A1.52 1.52 0 0 0 5.12 22h13.76a1.52 1.52 0 0 0 1.52-1.52C20.4 16.9 16.64 14 12 14Z" />
      </svg>
    </div>
  );
}

export default function StaffNav({
  staffName,
  staffDepartment,
}: StaffNavProps) {
  const pathname = usePathname();
  const [newStudentsCount, setNewStudentsCount] = useState(0);

  useEffect(() => {
    if (pathname === "/staff/students") {
      setNewStudentsCount(0);
    }
  }, [pathname]);

  useEffect(() => {
    async function fetchCount() {
      // If we are on the page, don't fetch or just set to 0 if we want it to stay clear
      // Actually, if we want new ones to appear even when on the page, we should fetch.
      // But the prompt says "clear when opens".
      try {
        const res = await fetch("/api/staff/new-students-count");
        if (res.ok) {
          const data = await res.json();
          // If we are currently on the students page, we assume the user is "seeing" them.
          if (pathname === "/staff/students") {
            setNewStudentsCount(0);
          } else {
            setNewStudentsCount(data.count || 0);
          }
        }
      } catch (error) {
        console.error("Failed to fetch new students count", error);
      }
    }

    fetchCount();
    const interval = setInterval(fetchCount, 5000); // Poll every 5 seconds for "real-time" feel
    return () => clearInterval(interval);
  }, [pathname]);

  return (
    <>
      {/* ── Desktop sidebar ── */}
      <aside
        className={[
          "hidden shrink-0 bg-white lg:flex lg:flex-col",
          "w-[260px] xl:w-[362px]",
          "h-full",
        ].join(" ")}
      >
        {/* Avatar + name */}
        <div className="flex flex-col items-center px-6 pb-6 pt-8 xl:pb-8 xl:pt-12">
          <StaffUserAvatar />
          <p
            className="mt-4 text-center text-[20px] font-bold leading-snug text-[#1a3b5c] xl:mt-5 xl:text-[24px]"
            dir="rtl"
          >
            {staffName}
          </p>
          <p
            className="mt-1 text-center text-[16px] leading-snug text-[#1a3b5c] xl:text-[20px]"
            dir="rtl"
          >
            {staffDepartment}
          </p>
        </div>

        {/* Nav items */}
        <nav
          className="flex flex-1 flex-col gap-2 overflow-y-auto pr-0 xl:gap-3"
          aria-label="Staff navigation"
        >
          {STAFF_NAV_ITEMS.map((item, index) => {
            const active = isActivePath(pathname, item.href);
            const isNewStudents = item.id === "new-students";

            return (
              <motion.div
                key={item.id}
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{
                  duration: 0.4,
                  delay: index * 0.07,
                  ease: "easeOut",
                }}
              >
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "group relative flex min-h-[84px] items-center gap-4 pl-5 pr-0 py-3",
                    "xl:min-h-[99px] xl:pl-6",
                    "text-[22px] font-light leading-none transition-all duration-300 ease-out xl:text-[28px]",
                    "rounded-l-none",
                    active
                      ? [
                          "bg-[#1a3b5c] text-white",
                          "shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
                          // The pill extends beyond the sidebar's right edge so it looks flush
                          "mr-[-1px] rounded-l-[40px]",
                        ].join(" ")
                      : "text-[#1a3b5c] hover:bg-[#eef3f7] rounded-l-[40px] mr-[-1px]",
                  ].join(" ")}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center xl:h-9 xl:w-9">
                    <StaffNavIcon icon={item.icon} active={active} />
                  </span>
                  <span className="flex flex-1 items-center justify-between gap-2 pr-4 text-[22px] xl:text-[28px]">
                    {item.label}
                    {isNewStudents && newStudentsCount > 0 && (
                      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-red-500 px-2 text-[16px] font-bold text-white shadow-sm xl:h-8 xl:min-w-8 xl:text-[20px]">
                        {newStudentsCount}
                      </span>
                    )}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </aside>

      {/* ── Mobile / tablet top scrollable nav ── */}
      <nav
        className="flex gap-2 overflow-x-auto pb-1 lg:hidden"
        aria-label="Staff navigation"
      >
        {STAFF_NAV_ITEMS.map((item, index) => {
          const active = isActivePath(pathname, item.href);
          const isNewStudents = item.id === "new-students";

          return (
            <motion.div
              key={item.id}
              initial={{ y: -16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{
                duration: 0.3,
                delay: index * 0.05,
                ease: "easeOut",
              }}
            >
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold",
                  "transition-all duration-300 ease-out",
                  active
                    ? "bg-[#1a3b5c] text-white shadow-[0_6px_16px_rgba(0,0,0,0.2)]"
                    : "bg-white/10 text-white hover:bg-white/20",
                ].join(" ")}
              >
                <span className="flex h-5 w-5 items-center justify-center">
                  <StaffNavIcon icon={item.icon} active={active} />
                </span>
                <span className="flex items-center gap-1.5">
                  {item.label}
                  {isNewStudents && newStudentsCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[11px] font-bold text-white">
                      {newStudentsCount}
                    </span>
                  )}
                </span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </>
  );
}
