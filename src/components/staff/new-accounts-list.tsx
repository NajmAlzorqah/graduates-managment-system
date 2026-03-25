"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Student } from "@/types/student";
import PendingStudentCard from "./pending-student-card";

interface NewAccountsListProps {
  students: Student[];
  majors: string[];
}

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

function UserAddIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5 shrink-0"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-8 8c0-3.31 3.582-6 8-6s8 2.69 8 6H4Z" />
      <path d="M19 3v2h-2v2h2v2h2V7h2V5h-2V3h-2Z" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 12 8"
      className="h-3 w-3 shrink-0 pointer-events-none"
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

export default function NewAccountsList({
  students,
  majors,
}: NewAccountsListProps) {
  const [query, setQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");

  useEffect(() => {
    // Clear the new students badge when this page is visited
    fetch("/api/staff/clear-new-students-badge", { method: "POST" }).catch(
      (err) => console.error("Failed to clear new students badge", err),
    );
  }, []);

  const filtered = useMemo(() => {
    let result = students;
    if (selectedMajor) {
      result = result.filter((s) => s.department === selectedMajor);
    }
    if (query.trim()) {
      const q = query.toLowerCase();
      result = result.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.email.toLowerCase().includes(q) ||
          s.academicId.toLowerCase().includes(q),
      );
    }
    return result;
  }, [students, query, selectedMajor]);

  const emptyMessage =
    students.length === 0
      ? "لا توجد حسابات جديدة"
      : selectedMajor && !query.trim()
        ? `لا توجد حسابات في تخصص "${selectedMajor}"`
        : "لا توجد نتائج للبحث";

  return (
    <div className="flex flex-col gap-4 md:gap-6">
      {/* Toolbar row */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Search bar */}
        <div className="relative w-full sm:max-w-[420px]">
          <div className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#1a3b5c]/65">
            <SearchIcon />
          </div>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search..."
            className="h-[52px] w-full rounded-[29px] border-0 bg-white pl-12 pr-4 text-[#1a3b5c] placeholder-[#1a3b5c]/65 shadow-[0_4px_4px_rgba(0,0,0,0.12)] focus:outline-none focus:ring-2 focus:ring-[#1a3b5c]/20 md:text-lg"
          />
        </div>

        {/* Action buttons */}
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          {/* Create new account — navigates to the create page */}
          <Link
            href="/staff/students/create"
            className="flex items-center gap-2 rounded-[62px] bg-[#ffb755] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-[#f0a535] md:px-5 md:text-base"
          >
            <UserAddIcon />
            <span dir="rtl">إنشاء حساب جديد</span>
          </Link>

          {/* Major filter dropdown */}
          <div className="relative flex items-center">
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="appearance-none cursor-pointer rounded-[62px] bg-[#ffb755] py-3 pl-5 pr-9 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/40 md:text-base"
              aria-label="تصفية حسب التخصص"
            >
              <option value="">الكل</option>
              {majors.map((major) => (
                <option key={major} value={major}>
                  {major}
                </option>
              ))}
            </select>
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white">
              <ChevronDownIcon />
            </span>
          </div>
        </div>
      </div>

      {/* Cards list */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16">
          <svg
            viewBox="0 0 24 24"
            className="mb-4 h-12 w-12 text-[#1a3b5c]/30"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M9.5 11a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm7 2a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2 18.2C2 15.88 4.12 14 6.75 14h5.5c2.63 0 4.75 1.88 4.75 4.2V20a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1zm12 1.8v-1.2c0-1.22-.33-2.32-.94-3.23a6.7 6.7 0 0 1 2.69-.57h1.5c2.07 0 3.75 1.49 3.75 3.33V20z" />
          </svg>
          <p className="text-center text-[#1a3b5c]/60 md:text-lg" dir="rtl">
            {emptyMessage}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:gap-4 xl:gap-5">
          {filtered.map((student) => (
            <PendingStudentCard key={student.id} student={student} />
          ))}
        </div>
      )}
    </div>
  );
}
