import { redirect } from "next/navigation";
import AdminSettingsForm from "@/components/admin/admin-settings-form";
import { auth } from "@/lib/auth";

export default async function AdminSettingsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/");
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-[32px] font-bold text-white md:text-[40px] lg:text-[48px]">
          Settings
        </h1>
      </div>
      <AdminSettingsForm />
    </div>
  );
}
