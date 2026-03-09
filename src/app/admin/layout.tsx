import LogoutButton from "@/components/ui/logout-button";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-3 shadow-sm dark:border-gray-700 dark:bg-gray-900">
        <span className="text-sm font-semibold text-[#1a3b5c] dark:text-white">
          Admin Portal
        </span>
        <LogoutButton />
      </header>
      {/* TODO: Add admin sidebar from Figma design */}
      <main className="flex-1">{children}</main>
    </div>
  );
}
