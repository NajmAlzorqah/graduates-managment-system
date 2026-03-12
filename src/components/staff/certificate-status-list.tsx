"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { updateStepStatusAction } from "@/lib/actions/staff-students";
import type { CertificateStep, StudentWithSteps } from "@/types/student";

type CertificateStatusListProps = {
  students: StudentWithSteps[];
  majors: string[];
};

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 44 45"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 3C10.611 3 3 10.611 3 20C3 29.389 10.611 37 20 37C29.389 37 37 29.389 37 20C37 10.611 29.389 3 20 3ZM0 20C0 8.954 8.954 0 20 0C31.046 0 40 8.954 40 20C40 31.046 31.046 40 20 40C8.954 40 0 31.046 0 20Z"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M34.657 34.243L43.707 43.293L41.293 45.707L32.243 36.657L34.657 34.243Z"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M3 6h18v2H3V6zm6 12h6v-2H9v2zm12-7H3v2h18v-2z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 12 8"
      className="pointer-events-none h-3 w-3 shrink-0"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1 1.5L6 6.5L11 1.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StudentAvatar() {
  return (
    <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-full bg-[#1a3b5c] md:h-[100px] md:w-[100px] xl:h-[131px] xl:w-[131px]">
      <svg
        viewBox="0 0 24 24"
        className="h-10 w-10 md:h-14 md:w-14 xl:h-[84px] xl:w-[84px]"
        fill="#ffffff"
        aria-hidden="true"
      >
        <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.64 0-8.4 2.9-8.4 6.48A1.52 1.52 0 0 0 5.12 22h13.76a1.52 1.52 0 0 0 1.52-1.52C20.4 16.9 16.64 14 12 14Z" />
      </svg>
    </div>
  );
}

function StepIndicator({
  step,
  isLast,
}: {
  step: CertificateStep;
  isLast: boolean;
}) {
  const isCompleted = step.status === "completed";
  return (
    <div className="relative flex flex-1 items-center">
      {!isLast && (
        <div
          className="absolute left-1/2 top-1/2 h-0.5 w-full -translate-y-1/2"
          style={{
            background: isCompleted
              ? "linear-gradient(to left, #1a3b5c, #1a3b5c)"
              : "linear-gradient(to left, #d1d5db, #d1d5db)",
          }}
        />
      )}
      <div
        className={`relative z-10 flex h-6 w-6 items-center justify-center rounded-full ${
          isCompleted ? "bg-[#1a3b5c]" : "bg-gray-300"
        }`}
      >
        {isCompleted && (
          <svg
            className="h-4 w-4 text-white"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M5 13l4 4L19 7"
            />
          </svg>
        )}
      </div>
    </div>
  );
}

function StudentCertificateCard({ student }: { student: StudentWithSteps }) {
  const [isPending, startTransition] = useTransition();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleUpdateStatus = (stepId: string, status: string) => {
    startTransition(async () => {
      const result = await updateStepStatusAction(stepId, status);
      if (result.success) {
        toast.success("تم تحديث الحالة بنجاح");
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-3xl bg-white p-4 shadow-lg md:p-6"
    >
      <div className="flex flex-col items-center gap-4 md:flex-row">
        <div className="flex flex-1 flex-col items-center text-center md:items-start md:text-right">
          <p className="text-lg font-bold text-[#1a3b5c] md:text-xl">
            {student.nameAr || student.name}
          </p>
          <p className="text-sm text-gray-500 md:text-base">{student.major}</p>
        </div>
        <div className="flex w-full flex-1 items-center justify-around">
          {student.steps.map((step, i) => (
            <StepIndicator
              key={step.id}
              step={step}
              isLast={i === student.steps.length - 1}
            />
          ))}
        </div>
        <div className="shrink-0">
          <StudentAvatar />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            {student.steps.map((step) => (
              <div
                key={step.id}
                className="flex items-center justify-between border-b py-2"
              >
                <p>{step.label}</p>
                <select
                  value={step.status}
                  onChange={(e) => handleUpdateStatus(step.id, e.target.value)}
                  disabled={isPending}
                  className="rounded border-gray-300"
                >
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 flex justify-center gap-4">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="rounded-full bg-[#1a3b5c] px-6 py-2 text-white"
        >
          {isExpanded ? "إخفاء التفاصيل" : "عرض التفاصيل"}
        </button>
        <button
          type="button"
          onClick={() => setIsExpanded(true)}
          className="rounded-full bg-[#1a3b5c] px-6 py-2 text-white"
        >
          تحديث الحالة
        </button>
      </div>
    </motion.div>
  );
}

export default function CertificateStatusList({
  students,
  majors,
}: CertificateStatusListProps) {
  const [query, setQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");

  const filteredStudents = useMemo(() => {
    let result = students;
    if (selectedMajor) {
      result = result.filter((s) => s.major === selectedMajor);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.nameAr?.toLowerCase().includes(q),
      );
    }
    return result;
  }, [students, query, selectedMajor]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="relative w-full md:max-w-sm">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#1a3b5c]/65">
            <SearchIcon />
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="h-[52px] w-full rounded-full border-0 bg-white pl-12 pr-4 text-[#1a3b5c] shadow-md"
          />
        </div>
        <div className="relative">
          <select
            value={selectedMajor}
            onChange={(e) => setSelectedMajor(e.target.value)}
            className="h-[52px] w-full appearance-none rounded-full border-0 bg-[#ffb755] px-6 pr-10 text-white shadow-md"
          >
            <option value="">All Majors</option>
            {majors.map((major) => (
              <option key={major} value={major}>
                {major}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-white">
            <ChevronDownIcon />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <AnimatePresence>
          {filteredStudents.map((student) => (
            <StudentCertificateCard key={student.id} student={student} />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
