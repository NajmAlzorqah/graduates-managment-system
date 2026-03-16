"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  CheckCircle2,
  Circle,
  Clock,
  User as UserIcon,
  X,
} from "lucide-react";
import type { StudentWithSteps } from "@/types/student";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  student: StudentWithSteps | null;
};

export default function CertificateDetailsModal({
  isOpen,
  onClose,
  student,
}: Props) {
  if (!student) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-[#ececec] rounded-[40px] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="bg-[#1a3b5c] p-6 text-white flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="hover:bg-white/10 p-1 rounded-full transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <h2 className="text-2xl font-bold font-arabic" dir="rtl">
                تفاصيل تتبع الشهادة
              </h2>
            </div>

            <div className="p-8 overflow-y-auto custom-scrollbar">
              {/* Student Profile Card */}
              <div
                className="bg-white rounded-[35px] p-6 mb-8 shadow-sm flex items-center gap-6 text-right"
                dir="rtl"
              >
                <div className="w-20 h-20 rounded-full bg-[#ffb755]/20 flex items-center justify-center shrink-0">
                  <UserIcon className="w-10 h-10 text-[#1a3b5c]" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#1a3b5c]">
                    {student.nameAr || student.name}
                  </h3>
                  <p className="text-xl text-[#1a3b5c]/70 font-bold">
                    {student.major}
                  </p>
                </div>
              </div>

              {/* Timeline */}
              <div className="relative" dir="rtl">
                {/* Vertical Line */}
                <div className="absolute right-6 top-0 bottom-0 w-1 bg-[#1a3b5c]/10 rounded-full" />

                <div className="space-y-12 relative">
                  {student.steps.map((step) => (
                    <div key={step.id} className="flex gap-6 items-start">
                      {/* Status Icon */}
                      <div
                        className={[
                          "w-12 h-12 rounded-full flex items-center justify-center shrink-0 z-10 border-4 border-[#ececec]",
                          step.status === "completed"
                            ? "bg-[#ffb755] text-[#1a3b5c]"
                            : "bg-white text-[#1a3b5c]/30 border-[#1a3b5c]/10",
                        ].join(" ")}
                      >
                        {step.status === "completed" ? (
                          <CheckCircle2 className="w-6 h-6" />
                        ) : (
                          <Circle className="w-6 h-6 fill-current" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 bg-white rounded-3xl p-5 shadow-sm">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="text-lg font-bold text-[#1a3b5c]">
                            {step.label}
                          </h4>
                          <span
                            className={[
                              "px-3 py-1 rounded-full text-xs font-bold",
                              step.status === "completed"
                                ? "bg-green-100 text-green-700"
                                : "bg-blue-100 text-blue-700",
                            ].join(" ")}
                          >
                            {step.status === "completed"
                              ? "مكتمل"
                              : "قيد الانتظار"}
                          </span>
                        </div>

                        <div className="flex items-center gap-4 mt-4 text-[#1a3b5c]/50 text-sm">
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>سيتم التحديث عند الاعتماد</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
