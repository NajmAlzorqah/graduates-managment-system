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

export type StudentReport = {
  id: string;
  name: string | null;
  nameAr: string | null;
  email: string;
  academicId: string;
  major: string | null;
  graduationYear: number | null;
  certificateStatus: string;
};
