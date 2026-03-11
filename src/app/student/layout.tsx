import StudentBottomNav from "@/components/student/student-bottom-nav";
import LogoutButton from "@/components/ui/logout-button";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#1a3b5c]">
      {/* Constrain to mobile-like width; centers on desktop */}
      <div className="relative max-w-[430px] mx-auto min-h-screen flex flex-col pb-[78px]">
        <div className="pointer-events-none absolute inset-x-0 top-4 z-40 flex justify-start px-3">
          <LogoutButton className="pointer-events-auto" />
        </div>
        <main className="flex-1">{children}</main>
      </div>
      {/* Fixed bottom navigation */}
      <StudentBottomNav />
    </div>
  );
}
