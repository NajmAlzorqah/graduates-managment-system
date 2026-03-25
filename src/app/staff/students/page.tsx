import NewAccountsList from "@/components/staff/new-accounts-list";
import { markNewStudentsAsSeen } from "@/lib/actions/staff";
import { getUnapprovedStudents } from "@/lib/api/students";

export default async function StaffStudentsPage() {
  await markNewStudentsAsSeen();
  const students = await getUnapprovedStudents();

  const majors = [
    ...new Set(students.map((s) => s.department).filter(Boolean)),
  ].sort();

  return <NewAccountsList students={students} majors={majors} />;
}
