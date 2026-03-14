"use client";

import type { AdminChartData } from "@/types/admin";
import { motion } from "framer-motion";

type AdminChartsProps = {
  totalUsersByMonth: AdminChartData[];
  trafficByWebsite: AdminChartData[];
  trafficByLocation: AdminChartData[];
  trafficByDevice: AdminChartData[];
};

export default function AdminCharts({
  totalUsersByMonth,
  trafficByWebsite,
  trafficByLocation,
  trafficByDevice,
}: AdminChartsProps) {
  const maxUserValue = Math.max(...totalUsersByMonth.map((d) => d.value), 1);
  const maxDeviceValue = Math.max(...trafficByDevice.map((d) => d.value), 1);

  return (
    <div className="mt-8 rounded-[40px] bg-white p-8 shadow-xl">
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
        {/* Total Users Line Chart */}
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-[#1a3b5c]">
              Total Users
            </h3>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="size-3 rounded-full bg-[#ffb354]" />
                <span>This year</span>
              </div>
            </div>
          </div>
          <div className="relative h-64 w-full">
            <svg
              viewBox="0 0 400 200"
              className="h-full w-full overflow-visible"
              aria-label="User growth chart"
            >
              {[0, 50, 100, 150].map((y) => (
                <line
                  key={y}
                  x1="0"
                  y1={y}
                  x2="400"
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth="1"
                />
              ))}
              <motion.path
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                d={totalUsersByMonth
                  .map((d, i) => {
                    const x = (i * 400) / (totalUsersByMonth.length - 1);
                    const y = 200 - (d.value / maxUserValue) * 150;
                    return `${i === 0 ? "M" : "L"}${x},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#ffb354"
                strokeWidth="3"
              />
            </svg>
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              {totalUsersByMonth.map((d) => (
                <span key={d.name}>{d.name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Traffic by Website */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-semibold text-[#1a3b5c]">
            Traffic by Website
          </h3>
          <div className="flex flex-col gap-4">
            {trafficByWebsite.map((site) => (
              <div key={site.name} className="flex items-center gap-4">
                <span className="w-20 text-sm text-[#1a3b5c]">{site.name}</span>
                <div className="h-2 flex-1 rounded-full bg-gray-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${site.value}%` }}
                    className="h-full rounded-full bg-[#1a3b5c]"
                  />
                </div>
                <span className="w-10 text-right text-xs text-gray-400">
                  {site.value}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic by Location */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-semibold text-[#1a3b5c]">
            Traffic by Location
          </h3>
          <div className="flex items-center justify-center gap-8">
            <div className="relative size-48">
              <svg viewBox="0 0 100 100" className="size-full -rotate-90">
                {trafficByLocation.map((loc, i) => {
                  const total = trafficByLocation.reduce(
                    (acc, curr) => acc + curr.value,
                    0,
                  );
                  const strokeDasharray = 251;
                  const strokeDashoffset =
                    strokeDasharray -
                    (loc.value / (total || 1)) * strokeDasharray;
                  const colors = ["#1a3b5c", "#ffb354", "#a0bce8", "#e5e7eb"];
                  return (
                    <circle
                      key={loc.name}
                      cx="50"
                      cy="50"
                      r="40"
                      fill="transparent"
                      stroke={colors[i % colors.length]}
                      strokeWidth="20"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="size-20 rounded-full bg-white" />
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {trafficByLocation.map((loc, i) => {
                const colors = [
                  "bg-[#1a3b5c]",
                  "bg-[#ffb354]",
                  "bg-[#a0bce8]",
                  "bg-gray-200",
                ];
                return (
                  <div key={loc.name} className="flex items-center gap-3">
                    <span
                      className={`size-3 rounded-full ${colors[i % colors.length]}`}
                    />
                    <span className="text-sm text-[#1a3b5c]">{loc.name}</span>
                    <span className="text-sm font-semibold">{loc.value}%</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Traffic by Device */}
        <div className="flex flex-col gap-6">
          <h3 className="text-xl font-semibold text-[#1a3b5c]">
            Traffic by Device
          </h3>
          <div className="flex h-48 items-end justify-between gap-4">
            {trafficByDevice.map((device, i) => (
              <div
                key={device.name}
                className="flex flex-1 flex-col items-center gap-2"
              >
                <motion.div
                  initial={{ height: 0 }}
                  animate={{
                    height: `${(device.value / maxDeviceValue) * 100}%`,
                  }}
                  className={`w-full rounded-lg ${i % 2 === 0 ? "bg-[#ffb354]" : "bg-[#1a3b5c]"}`}
                />
                <span className="text-xs text-gray-400">{device.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
