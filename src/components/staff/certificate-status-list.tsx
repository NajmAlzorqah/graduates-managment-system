"use client";

import type { NotificationTemplate } from "@prisma/client";
import { Search, SlidersHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import type { StudentWithSteps } from "@/types/student";
import CertificateDetailsModal from "./certificate-details-modal";
import CertificateStatusCard from "./certificate-status-card";
import UpdateStatusModal from "./update-status-modal";

type Props = {
  students: StudentWithSteps[];
  templates: NotificationTemplate[];
};

export default function CertificateStatusList({ students, templates }: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStudent, setSelectedStudent] =
    useState<StudentWithSteps | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [filterMajor, setFilterMajor] = useState<string | null>(null);
  const [filterStatus, _setFilterStatus] = useState<string | null>(null);

  const majors = useMemo(() => {
    const allMajors = students.map((s) => s.major).filter(Boolean) as string[];
    return Array.from(new Set(allMajors));
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesSearch =
        s.nameAr?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.major?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesMajor = !filterMajor || s.major === filterMajor;

      const completedSteps = s.steps.filter(
        (st) => st.status === "completed",
      ).length;
      let status = "pending";
      if (completedSteps === s.steps.length) status = "completed";
      else if (completedSteps > 0) status = "in-progress";

      const matchesStatus = !filterStatus || status === filterStatus;

      return matchesSearch && matchesMajor && matchesStatus;
    });
  }, [students, searchQuery, filterMajor, filterStatus]);

  const handleUpdateStatus = (student: StudentWithSteps) => {
    setSelectedStudent(student);
    setIsUpdateModalOpen(true);
  };

  const handleViewDetails = (student: StudentWithSteps) => {
    setSelectedStudent(student);
    setIsDetailsModalOpen(true);
  };

  return (
    <div className="w-full">
      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        <div className="relative flex-1 w-full group">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a3b5c]/40 w-6 h-6 transition-colors group-focus-within:text-[#ffb755]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-full py-5 pr-14 pl-6 text-xl font-bold text-[#1a3b5c] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-none focus:ring-2 focus:ring-[#ffb755] placeholder:text-[#1a3b5c]/40 transition-all"
          />
        </div>

        <div className="relative group w-full md:w-auto">
          <button
            type="button"
            className="bg-[#ffb755] text-[#1a3b5c] rounded-full px-8 py-4 flex items-center justify-center gap-3 text-xl font-bold shadow-[0_4px_12px_rgba(255,183,85,0.2)] hover:bg-[#ffb755]/90 transition-all w-full"
          >
            <span>Filter</span>
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
          </button>

          {/* Simple Dropdown for Major Filter */}
          <div className="absolute left-0 mt-3 w-72 bg-white rounded-[30px] shadow-2xl border border-[#e5e7eb] py-4 hidden group-hover:block z-[100]">
            <p className="text-right px-6 py-2 text-sm font-bold text-[#1a3b5c]/40 uppercase tracking-wider">
              تصفية حسب التخصص
            </p>
            <button
              type="button"
              onClick={() => setFilterMajor(null)}
              className="w-full text-right px-6 py-3 hover:bg-[#ffb755]/10 text-[#1a3b5c] font-bold transition-colors"
            >
              الكل
            </button>
            {majors.map((major) => (
              <button
                key={major}
                type="button"
                onClick={() => setFilterMajor(major)}
                className="w-full text-right px-6 py-3 hover:bg-[#ffb755]/10 text-[#1a3b5c] font-bold transition-colors"
              >
                {major}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Students List Container ── */}
      <div className="bg-white rounded-[40px] p-6 md:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.05)]">
        <div className="space-y-4">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <CertificateStatusCard
                key={student.id}
                student={student}
                onUpdateStatus={handleUpdateStatus}
                onViewDetails={handleViewDetails}
              />
            ))
          ) : (
            <div className="py-20 text-center">
              <div className="w-24 h-24 bg-[#f3f4f6] rounded-full flex items-center justify-center mx-auto mb-6">
                <SlidersHorizontal className="w-12 h-12 text-[#1a3b5c]/20" />
              </div>
              <p className="text-[#1a3b5c] text-3xl font-bold font-arabic">
                لا يوجد طلاب يطابقون بحثك
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Modals ── */}
      <UpdateStatusModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        student={selectedStudent}
        templates={templates}
      />
      <CertificateDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => setIsDetailsModalOpen(false)}
        student={selectedStudent}
      />
    </div>
  );
}
