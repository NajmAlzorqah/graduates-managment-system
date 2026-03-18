import SettingsClient from "@/components/student/settings-client";
import { getStudentSettings } from "@/lib/actions/student-settings";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function StudentSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const settings = await getStudentSettings();
  if (!settings) redirect("/login");

  return <SettingsClient initialSettings={settings} />;
}
