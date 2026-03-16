"use client";

import type { NotificationTemplate } from "@prisma/client";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
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
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

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

      const completedSteps = s.steps.filter((st) => st.status === "completed").length;
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
        <div className="relative flex-1 w-full">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a3b5c]/40 w-6 h-6" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-full py-4 pr-12 pl-6 text-xl font-bold text-[#1a3b5c] shadow-sm border-none focus:ring-2 focus:ring-[#ffb755] placeholder:text-[#1a3b5c]/40"
          />
        </div>

        <div className="relative group w-full md:w-auto">
          <button
            type="button"
            className="bg-[#ffb755] text-white rounded-full px-8 py-4 flex items-center justify-center gap-3 text-2xl font-bold shadow-[inset_0_4px_4px_rgba(0,0,0,0.25)] hover:bg-[#ffb755]/90 transition-all w-full"
          >
            <Filter className="w-8 h-8" />
            <span>التخصص</span>
          </button>

          {/* Simple Dropdown for Major Filter */}
          <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e5e7eb] py-2 hidden group-hover:block z-20">
            <button
              type="button"
              onClick={() => setFilterMajor(null)}
              className="w-full text-right px-4 py-2 hover:bg-[#f3f4f6] text-[#1a3b5c] font-bold"
            >
              الكل
            </button>
            {majors.map((major) => (
              <button
                key={major}
                type="button"
                onClick={() => setFilterMajor(major)}
                className="w-full text-right px-4 py-2 hover:bg-[#f3f4f6] text-[#1a3b5c] font-bold"
              >
                {major}
              </button>
            ))}
          </div>
        </div>

        <div className="relative group w-full md:w-auto">
          <button
            type="button"
            className="bg-[#1a3b5c] text-white rounded-full px-8 py-4 flex items-center justify-center gap-3 text-2xl font-bold shadow-[inset_0_4px_4px_rgba(0,0,0,0.25)] hover:bg-[#1a3b5c]/90 transition-all w-full"
          >
            <SlidersHorizontal className="w-8 h-8" />
            <span>الحالة</span>
          </button>

          <div className="absolute left-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-[#e5e7eb] py-2 hidden group-hover:block z-20">
            {[
              { label: "الكل", value: null },
              { label: "قيد الانتظار", value: "pending" },
              { label: "قيد المعالجة", value: "in-progress" },
              { label: "مكتمل", value: "completed" },
            ].map((status) => (
              <button
                key={status.label}
                type="button"
                onClick={() => setFilterStatus(status.value)}
                className="w-full text-right px-4 py-2 hover:bg-[#f3f4f6] text-[#1a3b5c] font-bold"
              >
                {status.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Students List ── */}
      <div className="space-y-4 pb-12">
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
          <div className="bg-white rounded-[45px] p-12 text-center">
            <SlidersHorizontal className="w-16 h-16 text-[#1a3b5c]/10 mx-auto mb-4" />
            <p className="text-[#1a3b5c] text-2xl font-bold font-arabic">
              لا يوجد طلاب يطابقون بحثك
            </p>
          </div>
        )}
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
