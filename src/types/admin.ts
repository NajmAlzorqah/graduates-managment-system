import type { StaffHomeStats } from "./staff";

export type AdminChartData = {
  name: string;
  value: number;
};

export type AdminHomeData = {
  stats: StaffHomeStats;
  totalUsersByMonth: AdminChartData[];
  trafficByWebsite: AdminChartData[];
  trafficByLocation: AdminChartData[];
  trafficByDevice: AdminChartData[];
};
