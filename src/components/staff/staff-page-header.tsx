"use client";

import { usePathname } from "next/navigation";

const PAGE_TITLES: Record<string, string> = {
  "/staff": "Home",
  "/staff/students": "New Accounts",
  "/staff/certificates": "Certificate Status",
  "/staff/notifications": "Notifications",
  "/staff/reports": "Reports",
  "/staff/settings": "Settings",
};

function getTitle(pathname: string): string {
  // Exact match first
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  // Prefix match (for nested routes)
  for (const [key, title] of Object.entries(PAGE_TITLES)) {
    if (key !== "/staff" && pathname.startsWith(`${key}/`)) return title;
  }
  return "Staff";
}

export default function StaffPageHeader() {
  const pathname = usePathname();
  const title = getTitle(pathname);

  return (
    <h1 className="text-center text-[24px] font-bold leading-none text-white md:text-[32px] xl:text-[40px]">
      {title}
    </h1>
  );
}
