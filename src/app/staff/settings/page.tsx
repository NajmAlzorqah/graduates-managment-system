import SettingsForm from "@/components/staff/settings-form";
import { getStaffSettings } from "@/lib/actions/staff";

export default async function StaffSettingsPage() {
  const settings = await getStaffSettings();

  return (
    <div className="mx-auto w-full max-w-[1120px]">
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
