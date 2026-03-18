import StudentBottomNav from "@/components/student/student-bottom-nav";
import LogoutButton from "@/components/ui/logout-button";
import StudentRefresh from "@/components/student/student-refresh";
import { auth } from "@/lib/auth";
import { getUnreadNotificationsCount } from "@/lib/actions/student";

export default async function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const unreadCount = session?.user?.id 
    ? await getUnreadNotificationsCount() 
    : 0;

  return (
    <div className="min-h-screen bg-[#1a3b5c]">
      <StudentRefresh />
      {/* Constrain to mobile-like width; centers on desktop */}
      <div className="relative max-w-[430px] mx-auto min-h-screen flex flex-col pb-[78px]">
        <div className="pointer-events-none absolute inset-x-0 top-4 z-40 flex justify-start px-3">
          <LogoutButton className="pointer-events-auto" />
        </div>
        <main className="flex-1">{children}</main>
      </div>
      {/* Fixed bottom navigation */}
      <StudentBottomNav unreadCount={unreadCount} />
    </div>
  );
}
