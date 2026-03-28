import { redirect } from "next/navigation";
import { Toaster } from "react-hot-toast";
import StaffNav from "@/components/staff/staff-nav";
import StaffPageHeader from "@/components/staff/staff-page-header";
import LogoutButton from "@/components/ui/logout-button";
import { auth } from "@/lib/auth";

export default async function StaffLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  if (session.user.role === "STUDENT") {
    redirect("/student");
  }

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const staffName = session.user.nameAr || session.user.name || "عضو الفريق";

  return (
    <div className="flex h-screen bg-[#1a3b5c]">
      {/* White sidebar — desktop only (lg+) */}
      <div className="hidden lg:block lg:shrink-0">
        <StaffNav staffName={staffName} staffDepartment="شؤون الخريجين" />
      </div>

      {/* Right-side content column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header bar (dark blue) */}
        <header className="flex items-center justify-between gap-4 px-4 py-5 md:px-8 md:py-7 xl:px-10 xl:py-9">
          {/* Spacer to push title to center */}
          <div className="h-10 w-10 shrink-0" aria-hidden="true" />
          <StaffPageHeader />
          <LogoutButton variant="icon" className="shrink-0" />
        </header>

        {/* Main content — light gray rounded top-left corner */}
        <main className="flex-1 overflow-y-auto rounded-tl-[32px] bg-[#ececec] p-4 md:rounded-tl-[48px] md:p-6 xl:rounded-tl-[56px] xl:p-8">
          {/* Mobile top nav — only visible below lg */}
          <div className="mb-4 lg:hidden">
            <StaffNav staffName={staffName} staffDepartment="شؤون الخريجين" />
          </div>
          {children}
        </main>
      </div>

      <Toaster position="top-center" />
    </div>
  );
}
