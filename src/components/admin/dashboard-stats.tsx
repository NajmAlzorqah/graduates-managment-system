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
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {items.map((item, index) => (
        <div
          key={index}
          className={`${item.bgColor} flex h-32 flex-col items-center justify-center rounded-[20px] p-4 shadow-lg sm:h-40 sm:p-6`}
        >
          <div className="flex w-full items-center justify-between gap-2">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-white/20 sm:size-14">
              <span className="[&>svg]:size-6 sm:[&>svg]:size-8">
                {item.icon}
              </span>
            </div>
            <span className="text-right text-sm font-bold text-[#1a3b5c] sm:text-lg lg:text-xl">
              {item.label}
            </span>
          </div>
          <div className="mt-2 flex size-14 items-center justify-center rounded-full bg-[#1a3b5c] text-xl font-bold text-white sm:mt-4 sm:size-20 sm:text-3xl">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  );
  }

