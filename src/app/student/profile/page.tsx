import { redirect } from "next/navigation";
import ProfileContent from "@/components/student/profile-content";
import { getStudentById } from "@/lib/api/students";
import { auth } from "@/lib/auth";

export default async function StudentProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const student = await getStudentById(session.user.id);
  if (!student) redirect("/login");

  return (
    <ProfileContent
      nameAr={student.nameAr ?? student.name ?? ""}
      major={student.profile?.major ?? ""}
      email={student.email}
      academicId={student.academicId}
      studentCardNumber={student.profile?.studentCardNumber ?? ""}
    />
  );
}
