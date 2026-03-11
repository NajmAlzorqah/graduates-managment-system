import { redirect } from "next/navigation";
import StaffNav from "@/components/staff/staff-nav";
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

  const staffName = session.user.name ?? "عضو الفريق";

  return (
    <div className="min-h-screen bg-[#1a3b5c]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1400px] lg:gap-0">
        <StaffNav staffName={staffName} staffDepartment="شؤون الخريجين" />

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="flex items-center justify-between gap-4 px-4 py-4 md:px-8 md:py-8 xl:py-10">
            <h1
              className="text-right text-[30px] leading-none font-bold text-white md:text-[36px] xl:text-[40px]"
              dir="rtl"
            >
              اهلا {staffName} !
            </h1>
            <LogoutButton className="shrink-0" />
          </header>

          <main className="flex-1 rounded-t-[28px] bg-[#ececec] p-4 md:rounded-t-[56px] md:p-7 xl:px-6 xl:py-7">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
