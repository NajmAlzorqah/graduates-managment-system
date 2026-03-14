import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/admin-nav";
import LogoutButton from "@/components/ui/logout-button";

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#1a3b5c]">
      <AdminNav adminName={session.user.name || "Admin"} adminRole="ادارة" />
      <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
        <header className="flex h-16 items-center justify-end px-6 lg:h-20">
          <LogoutButton />
        </header>
        <main className="flex-1 px-4 pb-8 md:px-8">{children}</main>
      </div>
    </div>
  );
}
