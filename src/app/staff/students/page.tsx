import StaffSectionShell from "@/components/staff/staff-section-shell";
import { getUnapprovedStudents } from "@/lib/api/students";

export default async function StaffStudentsPage() {
  const students = await getUnapprovedStudents();

  return (
    <StaffSectionShell
      title="New students"
      subtitle="Students waiting for onboarding and approval"
    >
      <div className="rounded-[24px] bg-white p-5 shadow-[0_10px_28px_rgba(9,26,43,0.08)]">
        <p className="mb-4 text-sm font-semibold text-[#355474]">
          Pending students: {students.length}
        </p>

        <ul className="space-y-3">
          {students.slice(0, 8).map((student) => (
            <li
              key={student.id}
              className="rounded-2xl border border-[#d8e0e8] bg-[#f8fbff] px-4 py-3"
            >
              <p className="font-semibold text-[#1a3b5c]">
                {student.name || "Unnamed student"}
              </p>
              <p className="text-sm text-[#355474]">{student.academicId}</p>
            </li>
          ))}
        </ul>
      </div>
    </StaffSectionShell>
  );
}
