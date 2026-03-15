import AdminCharts from "@/components/admin/admin-charts";
import DashboardStats from "@/components/admin/dashboard-stats";
import { getAdminHomeData } from "@/lib/api/admin-home";

export default async function AdminDashboardPage() {
  const {
    stats,
    totalUsersByMonth,
    trafficByWebsite,
    trafficByLocation,
    trafficByDevice,
  } = await getAdminHomeData();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-white/60">Welcome back to the admin portal.</p>
      </div>

      <DashboardStats stats={stats} />

      <AdminCharts
        totalUsersByMonth={totalUsersByMonth}
        trafficByWebsite={trafficByWebsite}
        trafficByLocation={trafficByLocation}
        trafficByDevice={trafficByDevice}
      />
    </div>
  );
}
