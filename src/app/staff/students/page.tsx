import NewAccountsList from "@/components/staff/new-accounts-list";
import { getUnapprovedStudents } from "@/lib/api/students";

export default async function StaffStudentsPage() {
  const students = await getUnapprovedStudents();

  const majors = [
    ...new Set(students.map((s) => s.department).filter(Boolean)),
  ].sort();

  return <NewAccountsList students={students} majors={majors} />;
}
