"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminNavProps = {
  adminName: string;
  adminRole: string;
};

type AdminNavIconName = "home" | "notification" | "reports" | "settings";

type AdminNavItem = {
  id: string;
  label: string;
  href: string;
  icon: AdminNavIconName;
};

const ADMIN_NAV_ITEMS: AdminNavItem[] = [
  { id: "home", label: "HOME", href: "/admin", icon: "home" },
  { id: "reports", label: "Reports", href: "/admin/reports", icon: "reports" },
  {
    id: "notifications",
    label: "Notification",
    href: "/admin/notifications",
    icon: "notification",
  },
  {
    id: "settings",
    label: "Settings",
    href: "/admin/settings",
    icon: "settings",
  },
];

function isActivePath(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }
  return pathname.startsWith(href);
}

function AdminNavIcon({
  icon,
  active,
}: {
  icon: AdminNavIconName;
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

function AdminUserAvatar() {
  return (
    <div className="flex h-[112px] w-[112px] items-center justify-center rounded-full bg-white ring-[6px] ring-[#eef3f7] xl:h-[149px] xl:w-[149px] xl:ring-[8px]">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[70px] w-[70px] xl:h-[96px] xl:w-[96px]"
        fill="#1a3b5c"
      >
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.64 0-8.4 2.9-8.4 6.48A1.52 1.52 0 0 0 5.12 22h13.76a1.52 1.52 0 0 0 1.52-1.52C20.4 16.9 16.64 14 12 14Z" />
      </svg>
    </div>
  );
}

export default function AdminNav({ adminName, adminRole }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden h-full w-[260px] shrink-0 flex-col bg-white lg:flex xl:w-[362px]">
        {/* Avatar + name */}
        <div className="flex flex-col items-center px-6 pb-6 pt-8 xl:pb-8 xl:pt-12">
          <AdminUserAvatar />
          <p
            className="mt-4 text-center text-[20px] font-bold leading-snug text-[#1a3b5c] xl:mt-5 xl:text-[24px]"
            dir="rtl"
          >
            {adminName}
          </p>
          <p
            className="mt-1 text-center text-[16px] leading-snug text-[#1a3b5c] xl:text-[20px]"
            dir="rtl"
          >
            {adminRole}
          </p>
        </div>

        {/* Nav items */}
        <nav
          className="flex flex-1 flex-col gap-2 overflow-y-auto pr-0 xl:gap-3"
          aria-label="Admin navigation"
        >
          {ADMIN_NAV_ITEMS.map((item, index) => {
            const active = isActivePath(pathname, item.href);

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
                    "transition-all duration-300 ease-out",
                    active
                      ? [
                          "bg-[#1a3b5c] text-white rounded-l-[40px] mr-[-1px]",
                          "shadow-[0_8px_24px_rgba(0,0,0,0.18)]",
                        ].join(" ")
                      : "text-[#1a3b5c] hover:bg-[#eef3f7] rounded-l-[40px] mr-[-1px]",
                  ].join(" ")}
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center xl:h-9 xl:w-9">
                    <AdminNavIcon icon={item.icon} active={active} />
                  </span>
                  <span className="text-[22px] font-light xl:text-[28px]">
                    {item.label}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </nav>
      </aside>

      {/* Mobile top nav */}
      <nav
        className="flex w-full shrink-0 gap-3 overflow-x-auto border-b border-white/10 bg-[#1a3b5c] px-4 py-3 lg:hidden"
        aria-label="Admin mobile navigation"
      >
        {ADMIN_NAV_ITEMS.map((item, index) => {
          const active = isActivePath(pathname, item.href);

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
                  "flex shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold sm:text-sm",
                  "transition-all duration-300 ease-out whitespace-nowrap",
                  active
                    ? "bg-white text-[#1a3b5c] shadow-lg"
                    : "bg-white/10 text-white hover:bg-white/20",
                ].join(" ")}
              >
                <span className="flex h-4 w-4 shrink-0 items-center justify-center sm:h-5 sm:w-5">
                  <AdminNavIcon icon={item.icon} active={active} />
                </span>
                <span>{item.label}</span>
              </Link>
            </motion.div>
          );
        })}
      </nav>
    </>
  );
}
