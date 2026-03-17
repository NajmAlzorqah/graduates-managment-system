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
      className="bg-[#ffb755] rounded-[35px] p-5 mb-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-none flex flex-col md:flex-row items-center gap-5"
    >
      {/* ── Left side: Buttons ── */}
      <div className="flex flex-col gap-2.5 w-full md:w-48 order-3 md:order-1">
        {student.graduationFormSubmitted && (
          <button
            type="button"
            onClick={() => onViewDetails(student)}
            className="bg-[#1a3b5c] text-white rounded-[15px] py-2.5 text-lg font-bold shadow-[inset_0_4px_4px_rgba(0,0,0,0.2)] hover:bg-[#1a3b5c]/90 transition-all font-arabic"
          >
            عرض التفاصيل
          </button>
        )}
        <button
          type="button"
          onClick={() => onUpdateStatus(student)}
          className="bg-[#1a3b5c] text-white rounded-[15px] py-2.5 text-lg font-bold shadow-[inset_0_4px_4px_rgba(0,0,0,0.2)] hover:bg-[#1a3b5c]/90 transition-all font-arabic flex items-center justify-center gap-2"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            className="w-5 h-5"
          >
            <path
              d="M19 9l-7 7-7-7"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          تحديث الحالة
        </button>
      </div>

      {/* ── Middle: Progress Tracker ── */}
      <div className="flex-1 flex items-center justify-center order-2 py-2">
        <div className="flex items-center">
          {student.steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              {/* Circle */}
              <div
                title={step.label}
                className={[
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-[3px]",
                  step.status === "completed"
                    ? "bg-[#ffb755] border-[#1a3b5c]"
                    : "bg-white border-[#1a3b5c]",
                ].join(" ")}
              >
                {step.status === "completed" && (
                  <CheckIcon className="w-6 h-6 text-[#1a3b5c]" />
                )}
              </div>
              {/* Connector line */}
              {index < student.steps.length - 1 && (
                <div className="h-[3px] w-5 sm:w-10 bg-[#1a3b5c]" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ── Right side: Info ── */}
      <div className="flex items-center gap-5 w-full md:w-auto order-1 md:order-3 justify-end text-right">
        <div className="flex flex-col items-end">
          <p className="text-[#1a3b5c] text-[22px] font-bold font-arabic leading-tight">
            {student.nameAr || student.name}
          </p>
          <p className="text-[#1a3b5c] text-[18px] font-bold font-arabic opacity-70">
            {student.major}
          </p>
        </div>
        <div className="w-[80px] h-[80px] rounded-full bg-white flex items-center justify-center shrink-0 border-none shadow-sm overflow-hidden">
          <User className="w-10 h-10 text-[#1a3b5c]/30" />
        </div>
      </div>
    </motion.div>
  );
}
