import ManageStudentsList from "@/components/staff/manage-students-list";
import { getStudents } from "@/lib/api/students";

export default async function ManageStudentsPage() {
  const students = await getStudents();

  const majors = [
    ...new Set(students.map((s) => s.department).filter(Boolean)),
  ].sort() as string[];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold text-[#1a3b5c] font-arabic" dir="rtl">
          إدارة الطلاب
        </h1>
        <p className="text-[#1a3b5c]/60 font-medium font-arabic" dir="rtl">
          عرض وحذف الطلاب المسجلين في النظام
        </p>
      </div>

      <ManageStudentsList students={students} majors={majors} />
    </div>
  );
}
