import StaffSectionShell from "@/components/staff/staff-section-shell";
import { getStudents } from "@/lib/api/students";

export default async function StaffReportsPage() {
  const students = await getStudents();
  const activeStudents = students.filter(
    (student) => student.status === "active",
  ).length;

  return (
    <StaffSectionShell
      title="Reports"
      subtitle="Quick operational snapshots for graduate affairs"
    >
      <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_28px_rgba(9,26,43,0.08)]">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <article className="rounded-2xl bg-[#f6f9fc] p-4">
            <p className="text-sm text-[#426385]">Total students</p>
            <p className="mt-2 text-3xl font-bold text-[#1a3b5c]">
              {students.length}
            </p>
          </article>

          <article className="rounded-2xl bg-[#f6f9fc] p-4">
            <p className="text-sm text-[#426385]">Active students</p>
            <p className="mt-2 text-3xl font-bold text-[#1a3b5c]">
              {activeStudents}
            </p>
          </article>
        </div>
      </div>
    </StaffSectionShell>
  );
}
