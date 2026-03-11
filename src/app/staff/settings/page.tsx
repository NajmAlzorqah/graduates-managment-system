import StaffSectionShell from "@/components/staff/staff-section-shell";

export default function StaffSettingsPage() {
  return (
    <StaffSectionShell
      title="Settings"
      subtitle="Manage your dashboard preferences and workflow defaults"
    >
      <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_28px_rgba(9,26,43,0.08)]">
        <p className="text-sm text-[#426385]">
          Additional staff settings controls can be connected here when backend
          options are exposed.
        </p>
      </div>
    </StaffSectionShell>
  );
}
