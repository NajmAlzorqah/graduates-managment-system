import type { StaffHomeStats } from "@/types/staff";
import { FileCheck, Hourglass, ClipboardCheck } from "lucide-react";

type DashboardStatsProps = {
  stats: StaffHomeStats;
};

export default function DashboardStats({ stats }: DashboardStatsProps) {
  const items = [
    {
      label: "شهادات مصادق عليها",
      value: stats.certificatesApprovedCount,
      icon: <FileCheck className="size-8 text-[#1a3b5c]" />,
      bgColor: "bg-[#ffb354]",
    },
    {
      label: "شهادات قيد التجهيز",
      value: stats.certificatesUnderReviewCount,
      icon: <Hourglass className="size-8 text-[#1a3b5c]" />,
      bgColor: "bg-[#ffb354]",
    },
    {
      label: "شهادات تم تسليمها",
      value: stats.certificatesDeliveredCount,
      icon: <ClipboardCheck className="size-8 text-[#1a3b5c]" />,
      bgColor: "bg-[#ffb354]",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {items.map((item, index) => (
        <div
          key={index}
          className={`${item.bgColor} flex h-40 flex-col items-center justify-center rounded-[20px] p-6 shadow-lg`}
        >
          <div className="flex w-full items-center justify-between">
            <div className="flex size-14 items-center justify-center rounded-lg bg-white/20">
              {item.icon}
            </div>
            <span className="text-xl font-bold text-[#1a3b5c]">
              {item.label}
            </span>
          </div>
          <div className="mt-4 flex size-20 items-center justify-center rounded-full bg-[#1a3b5c] text-3xl font-bold text-white">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
}
