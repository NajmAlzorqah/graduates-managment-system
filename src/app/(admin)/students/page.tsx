import { getStudents } from "@/lib/api/students";

export default async function StudentsPage() {
  const students = await getStudents();

  return (
    <div className="space-y-6 p-4 md:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">Students</h1>
      <p className="text-sm text-foreground/60">
        {students.length} students loaded from mock data — replace with Figma
        design
      </p>
    </div>
  );
}
