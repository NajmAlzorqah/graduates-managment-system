"use client";

import type { NotificationTemplate } from "@prisma/client";
import { Search, SlidersHorizontal, Settings2 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import type { StudentWithSteps } from "@/types/student";
import CertificateDetailsModal from "./certificate-details-modal";
import CertificateStatusCard from "./certificate-status-card";
import UpdateStatusModal from "./update-status-modal";
import ManageMajorsModal from "./manage-majors-modal";

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
  const [isMajorsModalOpen, setIsMajorsModalOpen] = useState(false);
  const [filterMajor, setFilterMajor] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [availableMajors, setAvailableMajors] = useState<string[]>([]);

  const fetchMajors = async () => {
    try {
      const res = await fetch("/api/majors");
      if (res.ok) {
        const data = await res.json();
        setAvailableMajors(data.map((m: any) => m.name));
      }
    } catch (error) {
      console.error("Failed to fetch majors:", error);
    }
  };

  useEffect(() => {
    fetchMajors();
  }, []);

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

  const getStatusLabel = (status: string | null) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "in-progress":
        return "قيد المعالجة";
      case "completed":
        return "مكتمل";
      default:
        return "الحالة";
    }
  };

  return (
    <div className="w-full">
      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
        {/* Filters on Left */}
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto order-2 md:order-1">
          {/* Status Filter (Existing Dropdown moved and updated) */}
          <div className="relative group w-full md:w-auto">
            <button
              type="button"
              className="bg-[#ffb755] text-[#1a3b5c] rounded-full px-8 py-4 flex items-center justify-center gap-3 text-xl font-bold shadow-[0_4px_12px_rgba(255,183,85,0.2)] hover:bg-[#ffb755]/90 transition-all w-full min-w-[180px]"
            >
              <span>{getStatusLabel(filterStatus)}</span>
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

            <div className="absolute left-0 mt-3 w-64 bg-white rounded-[30px] shadow-2xl border border-[#e5e7eb] py-4 hidden group-hover:block z-[100]">
              <p className="text-right px-6 py-2 text-sm font-bold text-[#1a3b5c]/40 uppercase tracking-wider">
                تصفية حسب الحالة
              </p>
              <button
                type="button"
                onClick={() => setFilterStatus(null)}
                className="w-full text-right px-6 py-3 hover:bg-[#ffb755]/10 text-[#1a3b5c] font-bold transition-colors"
              >
                الكل
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("pending")}
                className="w-full text-right px-6 py-3 hover:bg-[#ffb755]/10 text-[#1a3b5c] font-bold transition-colors"
              >
                قيد الانتظار
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("in-progress")}
                className="w-full text-right px-6 py-3 hover:bg-[#ffb755]/10 text-[#1a3b5c] font-bold transition-colors"
              >
                قيد المعالجة
              </button>
              <button
                type="button"
                onClick={() => setFilterStatus("completed")}
                className="w-full text-right px-6 py-3 hover:bg-[#ffb755]/10 text-[#1a3b5c] font-bold transition-colors"
              >
                مكتمل
              </button>
            </div>
          </div>

          {/* New Major Filter */}
          <div className="relative group w-full md:w-auto">
            <button
              type="button"
              className="bg-[#ffb755] text-[#1a3b5c] rounded-full px-8 py-4 flex items-center justify-center gap-3 text-xl font-bold shadow-[0_4px_12px_rgba(255,183,85,0.2)] hover:bg-[#ffb755]/90 transition-all w-full min-w-[180px]"
            >
              <span className="truncate max-w-[150px]">{filterMajor || "التخصص"}</span>
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

            <div className="absolute left-0 mt-3 w-72 bg-white rounded-[30px] shadow-2xl border border-[#e5e7eb] py-4 hidden group-hover:block z-[100]">
              <div className="flex items-center justify-between px-6 py-2 border-b border-gray-100 mb-2">
                <p className="text-sm font-bold text-[#1a3b5c]/40 uppercase tracking-wider">
                  التخصصات
                </p>
                <button
                  onClick={() => setIsMajorsModalOpen(true)}
                  className="p-1 hover:bg-gray-100 rounded-lg transition-colors text-[#1a3b5c]/60 hover:text-[#1a3b5c]"
                  title="إدارة التخصصات"
                >
                  <Settings2 className="w-5 h-5" />
                </button>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                <button
                  type="button"
                  onClick={() => setFilterMajor(null)}
                  className="w-full text-right px-6 py-3 hover:bg-[#ffb755]/10 text-[#1a3b5c] font-bold transition-colors"
                >
                  الكل
                </button>
                {availableMajors.map((major) => (
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
        </div>

        {/* Search Bar on Right */}
        <div className="relative flex-1 w-full group order-1 md:order-2">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a3b5c]/40 w-6 h-6 transition-colors group-focus-within:text-[#ffb755]" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white rounded-full py-5 pr-14 pl-6 text-xl font-bold text-[#1a3b5c] shadow-[0_4px_12px_rgba(0,0,0,0.05)] border-none focus:ring-2 focus:ring-[#ffb755] placeholder:text-[#1a3b5c]/40 transition-all"
          />
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
      <ManageMajorsModal
        isOpen={isMajorsModalOpen}
        onClose={() => setIsMajorsModalOpen(false)}
        onMajorsChange={(majors) => {
          setAvailableMajors(majors);
          // If the currently filtered major was deleted, reset filter
          if (filterMajor && !majors.includes(filterMajor)) {
            setFilterMajor(null);
          }
        }}
      />
    </div>
  );
}

