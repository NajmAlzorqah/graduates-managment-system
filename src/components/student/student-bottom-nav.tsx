"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    id: "home",
    label: "home",
    href: "/student",
    icon: "home",
  },
  {
    id: "notifications",
    label: "notification",
    href: "/student/notifications",
    icon: "bell",
  },
  {
    id: "settings",
    label: "settings",
    href: "/student/settings",
    icon: "settings",
  },
  {
    id: "profile",
    label: "profile",
    href: "/student/profile",
    icon: "user",
  },
] as const;

type IconName = (typeof navItems)[number]["icon"];

function NavIcon({ icon, active }: { icon: IconName; active: boolean }) {
  const color = active ? "white" : "#1a3b5c";
  const size = active ? 26 : 22;

  switch (icon) {
    case "home":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={color}
          aria-hidden="true"
        >
          <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
        </svg>
      );
    case "bell":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={color}
          aria-hidden="true"
        >
          <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5S10.5 3.17 10.5 4v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
        </svg>
      );
    case "settings":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={color}
          aria-hidden="true"
        >
          <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
        </svg>
      );
    case "user":
      return (
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill={color}
          aria-hidden="true"
        >
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
        </svg>
      );
  }
}

export default function StudentBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      aria-label="Student navigation"
    >
      <div className="mx-auto max-w-[430px]">
        <div className="rounded-t-[34px] bg-[#f7f7f7] shadow-[0_-6px_34px_rgba(0,0,0,0.12)]">
          <div className="flex h-[84px] items-end px-4 pb-4">
            {navItems.map((item) => {
              const isActive =
                item.href === "/student"
                  ? pathname === "/student"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  aria-label={item.label}
                  className="flex flex-col items-center flex-1 gap-1 relative"
                >
                  <div
                    className={[
                      "z-10 flex items-center justify-center rounded-full",
                      "transition-all duration-500 ease-[cubic-bezier(0.2,0.9,0.2,1)]",
                      isActive
                        ? "h-[62px] w-[62px] -translate-y-7 bg-[#f4b24d] shadow-[0_10px_20px_rgba(0,0,0,0.2)] ring-[5px] ring-[#1a3b5c]"
                        : "h-10 w-10 translate-y-2 bg-transparent opacity-60 hover:opacity-100",
                    ].join(" ")}
                  >
                    <NavIcon icon={item.icon} active={isActive} />
                  </div>
                  <span
                    className={[
                      "absolute text-[12px] font-medium transition-all duration-300",
                      isActive
                        ? "bottom-[-18px] font-bold text-[#1a3b5c] opacity-100"
                        : "bottom-[4px] font-semibold text-[#1a3b5c] opacity-60",
                    ].join(" ")}
                  >
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
