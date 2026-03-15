import { prisma } from "@/lib/prisma";
import type { AdminChartData, AdminHomeData } from "@/types/admin";
import { getStaffHomeData } from "./staff-home";

export async function getAdminHomeData(): Promise<AdminHomeData> {
  const staffHomeData = await getStaffHomeData();

  const [users, analytics] = await Promise.all([
    prisma.user.findMany({
      select: { createdAt: true },
      where: { role: "STUDENT" },
    }),
    prisma.analytics.findMany(),
  ]);

  // Process users by month
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const usersByMonthMap = new Map<string, number>();

  for (const user of users) {
    const month = months[user.createdAt.getMonth()];
    usersByMonthMap.set(month, (usersByMonthMap.get(month) || 0) + 1);
  }

  const totalUsersByMonth: AdminChartData[] = months
    .slice(0, 7)
    .map((month) => ({
      name: month,
      value: usersByMonthMap.get(month) || 0,
    }));

  // Process analytics
  const trafficByWebsite = analytics
    .filter((a) => a.type === "TRAFFIC_SOURCE")
    .map((a) => ({ name: a.name, value: a.value }));

  const trafficByLocation = analytics
    .filter((a) => a.type === "LOCATION")
    .map((a) => ({ name: a.name, value: a.value }));

  const trafficByDevice = analytics
    .filter((a) => a.type === "DEVICE")
    .map((a) => ({ name: a.name, value: a.value }));

  // Fallbacks if DB is empty for these new fields
  return {
    stats: staffHomeData.stats,
    totalUsersByMonth,
    trafficByWebsite:
      trafficByWebsite.length > 0
        ? trafficByWebsite
        : [
            { name: "Google", value: 0 },
            { name: "YouTube", value: 0 },
            { name: "Instagram", value: 0 },
          ],
    trafficByLocation:
      trafficByLocation.length > 0
        ? trafficByLocation
        : [
            { name: "United States", value: 0 },
            { name: "Canada", value: 0 },
            { name: "Mexico", value: 0 },
          ],
    trafficByDevice:
      trafficByDevice.length > 0
        ? trafficByDevice
        : [
            { name: "Linux", value: 0 },
            { name: "Mac", value: 0 },
            { name: "iOS", value: 0 },
            { name: "Windows", value: 0 },
            { name: "Android", value: 0 },
          ],
  };
}
