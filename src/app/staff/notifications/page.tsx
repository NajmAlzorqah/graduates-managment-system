import StaffSectionShell from "@/components/staff/staff-section-shell";
import { getSystemNotificationStats } from "@/lib/api/notifications";

export default async function StaffNotificationsPage() {
  const { unreadCount, totalCount } = await getSystemNotificationStats();

  return (
    <StaffSectionShell
      title="Notifications"
      subtitle="Monitor system-wide notification traffic"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="rounded-[24px] bg-white p-5 shadow-[0_10px_28px_rgba(9,26,43,0.08)]">
          <p className="text-sm text-[#426385]">Unread notifications</p>
          <p className="mt-2 text-4xl font-bold text-[#1a3b5c]">
            {unreadCount}
          </p>
        </article>

        <article className="rounded-[24px] bg-white p-5 shadow-[0_10px_28px_rgba(9,26,43,0.08)]">
          <p className="text-sm text-[#426385]">Total notifications</p>
          <p className="mt-2 text-4xl font-bold text-[#1a3b5c]">{totalCount}</p>
        </article>
      </div>
    </StaffSectionShell>
  );
}
