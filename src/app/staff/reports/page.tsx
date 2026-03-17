import StaffReportsTable, {
  type StaffReportRow,
} from "@/components/staff/staff-reports-table";
import {
  getStudents,
  getStudentsBasicInfo,
  getStudentsWithCertSteps,
} from "@/lib/api/students";

export default async function StaffReportsPage() {
  const [students, studentsBasicInfo, studentsWithSteps] = await Promise.all([
    getStudents(),
    getStudentsBasicInfo(),
    getStudentsWithCertSteps(),
  ]);

  const basicInfoById = new Map(
    studentsBasicInfo.map((student) => [student.id, student]),
  );
  const stepsByStudentId = new Map(
    studentsWithSteps.map((student) => [student.id, student.steps]),
  );

  const reports: StaffReportRow[] = students.map((student) => {
    const basicInfo = basicInfoById.get(student.id);
    const steps = stepsByStudentId.get(student.id) ?? [];

    const certificateStatus =
      steps.length === 0 || steps.every((step) => step.status === "pending")
        ? "قيد المصادقة"
        : steps.every((step) => step.status === "completed")
          ? "مكتملة"
          : "قيد الإجراء";

    return {
      id: student.id,
      fullName: basicInfo?.nameAr ?? basicInfo?.name ?? student.name,
      name: basicInfo?.name ?? student.name ?? "-",
      email: student.email,
      academicId: student.academicId,
      department: basicInfo?.major ?? (student.department || "-"),
      graduationYear: basicInfo?.graduationYear?.toString() ?? "-",
      certificateStatus,
    };
  });

  return (
    <section className="-m-4 min-h-full rounded-tl-[32px] bg-[#1a3b5c] p-4 md:-m-6 md:rounded-tl-[48px] md:p-6 xl:-m-8 xl:rounded-tl-[56px] xl:p-8">
      <StaffReportsTable rows={reports} />
    </section>
  );
}
