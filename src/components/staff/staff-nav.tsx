"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type StaffNavProps = {
  staffName: string;
  staffDepartment: string;
};

type StaffNavIconName =
  | "home"
  | "students"
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
  const color = active ? "#f4b24d" : "currentColor";

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
    <div className="flex size-[112px] items-center justify-center rounded-full bg-[#1a3b5c] shadow-[0_8px_18px_rgba(0,0,0,0.2)] xl:size-[149px]">
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="size-[70px] xl:size-[96px]"
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

  return (
    <>
      <aside className="hidden w-[300px] shrink-0 bg-[#ececec] pb-10 lg:flex lg:flex-col xl:w-[362px]">
        <div className="flex flex-col items-center px-6 pt-10 xl:pt-12">
          <StaffUserAvatar />
          <p
            className="mt-3 text-center text-[24px] leading-none font-bold text-[#1a3b5c]"
            dir="rtl"
          >
            {staffName}
          </p>
          <p
            className="mt-2 text-center text-[20px] leading-none text-[#355474]"
            dir="rtl"
          >
            {staffDepartment}
          </p>
        </div>

        <nav
          className="mt-7 flex flex-col gap-3 pr-4 xl:mt-9"
          aria-label="Staff navigation"
        >
          {STAFF_NAV_ITEMS.map((item) => {
            const active = isActivePath(pathname, item.href);

            return (
              <Link
                key={item.id}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "group relative flex min-h-[84px] items-center gap-4 rounded-l-[34px] px-5 py-[15px] xl:min-h-[99px] xl:py-4",
                  "text-[27px] font-medium leading-none transition-all duration-300 ease-out xl:text-[35px]",
                  active
                    ? "translate-x-0 bg-[#1a3b5c] text-white shadow-[0_8px_20px_rgba(0,0,0,0.18)]"
                    : "text-[#1a3b5c] hover:translate-x-1 hover:bg-[#dbe4ec]",
                ].join(" ")}
              >
                <span className="flex shrink-0 items-center justify-center text-inherit transition-colors duration-300">
                  <StaffNavIcon icon={item.icon} active={active} />
                </span>
                <span
                  className="text-[27px] xl:text-[35px]"
                  style={{ fontWeight: 320 }}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <nav
        className="mb-5 flex gap-2 overflow-x-auto pb-1 lg:hidden"
        aria-label="Staff navigation"
      >
        {STAFF_NAV_ITEMS.map((item) => {
          const active = isActivePath(pathname, item.href);

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={[
                "flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold",
                "transition-all duration-300 ease-out",
                active
                  ? "bg-[#1a3b5c] text-white shadow-[0_8px_18px_rgba(0,0,0,0.2)]"
                  : "bg-white text-[#1a3b5c] hover:-translate-y-0.5 hover:bg-[#dbe4ec]",
              ].join(" ")}
            >
              <span className="size-5">
                <StaffNavIcon icon={item.icon} active={active} />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
