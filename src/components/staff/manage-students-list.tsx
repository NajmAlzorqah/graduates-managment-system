"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { deleteStudentAction } from "@/lib/actions/staff-students";
import type { Student } from "@/types/student";

interface ManageStudentsListProps {
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
      role="img"
    >
      <title>Search</title>
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

function ChevronDownIcon() {
  return (
    <svg
      viewBox="0 0 12 8"
      className="h-3 w-3 shrink-0 pointer-events-none"
      fill="none"
      aria-hidden="true"
      role="img"
    >
      <title>Chevron Down</title>
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

function TrashIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      role="img"
    >
      <title>Delete</title>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

export default function ManageStudentsList({
  students,
  majors,
}: ManageStudentsListProps) {
  const [query, setQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

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

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `هل أنت متأكد من حذف الطالب ${name}؟ سيتم حذف جميع البيانات المتعلقة به.`,
      )
    ) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await deleteStudentAction(id);
      if (res.success) {
        toast.success("تم حذف الطالب بنجاح");
      } else {
        toast.error(res.error);
      }
    } catch {
      toast.error("حدث خطأ أثناء الحذف");
    } finally {
      setDeletingId(null);
    }
  };

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
          {/* Major filter dropdown */}
          <div className="relative flex items-center">
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="appearance-none cursor-pointer rounded-[62px] bg-[#ffb755] py-3 pl-5 pr-9 text-sm font-bold text-white focus:outline-none focus:ring-2 focus:ring-white/40 md:text-base"
              aria-label="تصفية حسب التخصص"
            >
              <option value="">كل التخصصات</option>
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
            {students.length === 0
              ? "لا يوجد طلاب مسجلين"
              : "لا توجد نتائج للبحث"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 md:gap-4 xl:gap-5">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="flex items-center justify-between gap-4 rounded-[35px] bg-[#ffb755] p-5 shadow-[0_4px_12px_rgba(0,0,0,0.08)] border-none md:p-6"
            >
              <div className="flex items-center gap-4 overflow-hidden">
                <div className="h-12 w-12 shrink-0 rounded-full bg-white flex items-center justify-center text-[#1a3b5c] md:h-14 md:w-14">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7 md:h-8 md:w-8"
                    fill="currentColor"
                    role="img"
                    aria-label="Student Icon"
                  >
                    <title>Student Icon</title>
                    <path d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-4.42 0-8 3.58-8 8v2h16v-2c0-4.42-3.58-8-8-8Z" />
                  </svg>
                </div>
                <div
                  className="flex flex-col overflow-hidden text-right"
                  dir="rtl"
                >
                  <h3 className="truncate text-lg font-bold text-[#1a3b5c] md:text-xl">
                    {student.name}
                  </h3>
                  <p className="truncate text-sm font-medium text-[#1a3b5c]/80 md:text-base">
                    {student.department} • {student.academicId}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => handleDelete(student.id, student.name)}
                disabled={deletingId === student.id}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-[#1a3b5c] text-white shadow-[inset_0_4px_4px_rgba(0,0,0,0.2)] transition-all hover:bg-red-600 disabled:opacity-50 md:h-14 md:w-14"
                title="حذف الطالب"
              >
                {deletingId === student.id ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <TrashIcon />
                )}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
