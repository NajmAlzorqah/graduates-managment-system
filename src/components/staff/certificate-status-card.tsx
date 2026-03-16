"use client";

import { User } from "lucide-react";
import { motion } from "framer-motion";
import type { StudentWithSteps } from "@/types/student";

type Props = {
  student: StudentWithSteps;
  onUpdateStatus: (student: StudentWithSteps) => void;
  onViewDetails: (student: StudentWithSteps) => void;
};

function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M20 6L9 17L4 12"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function CertificateStatusCard({
  student,
  onUpdateStatus,
  onViewDetails,
}: Props) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="bg-white rounded-[45px] p-6 mb-6 shadow-sm border border-[#e5e7eb] flex flex-col md:flex-row items-center gap-6"
    >
      {/* ── Left side: Buttons ── */}
      <div className="flex flex-col gap-3 w-full md:w-48 order-3 md:order-1">
        <button
          type="button"
          onClick={() => onViewDetails(student)}
          className="bg-[#1a3b5c] text-white rounded-[20px] py-3 text-lg font-bold shadow-[inset_0_4px_4px_rgba(0,0,0,0.25)] hover:bg-[#1a3b5c]/90 transition-colors font-arabic"
        >
          عرض التفاصيل
        </button>
        <button
          type="button"
          onClick={() => onUpdateStatus(student)}
          className="bg-[#1a3b5c] text-white rounded-[20px] py-3 text-lg font-bold shadow-[inset_0_4px_4px_rgba(0,0,0,0.25)] hover:bg-[#1a3b5c]/90 transition-colors font-arabic"
        >
          تحديث الحالة
        </button>
      </div>

      {/* ── Middle: Progress Tracker ── */}
      <div className="flex-1 flex items-center justify-center order-2">
        <div className="flex items-center">
          {student.steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Circle */}
              <div
                title={step.label}
                className={[
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2",
                  step.status === "completed"
                    ? "bg-[#ffb755] border-[#ffb755]"
                    : "bg-white border-[#1a3b5c]",
                ].join(" ")}
              >
                {step.status === "completed" && (
                  <CheckIcon className="w-6 h-6 text-[#1a3b5c]" />
                )}
              </div>
              {/* Connector line */}
              {index < student.steps.length - 1 && (
                <div className="h-[2px] w-8 sm:w-16 bg-[#1a3b5c]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right side: Info ── */}
      <div className="flex items-center gap-4 w-full md:w-auto order-1 md:order-3 justify-end text-right">
        <div className="flex flex-col items-end">
          <p className="text-[#1a3b5c] text-2xl font-bold font-arabic leading-tight">
            {student.nameAr || student.name}
          </p>
          <p className="text-[#1a3b5c]/70 text-xl font-bold font-arabic">
            {student.major}
          </p>
        </div>
        <div className="w-24 h-24 rounded-full bg-[#e5e7eb] flex items-center justify-center shrink-0 border-4 border-[#ffb755]/30">
          <User className="w-12 h-12 text-[#1a3b5c]/40" />
        </div>
      </div>
    </motion.div>
  );
}
