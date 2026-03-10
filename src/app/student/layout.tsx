import StudentBottomNav from "@/components/student/student-bottom-nav";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-[#1a3b5c]">
      {/* Constrain to mobile-like width; centers on desktop */}
      <div className="max-w-[430px] mx-auto min-h-screen flex flex-col pb-[78px]">
        <main className="flex-1">{children}</main>
      </div>
      {/* Fixed bottom navigation */}
      <StudentBottomNav />
    </div>
  );
}
