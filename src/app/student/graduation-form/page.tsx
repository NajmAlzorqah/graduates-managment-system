import { redirect } from "next/navigation";
import GraduationFormClient from "@/components/student/graduation-form-client";
import { getStudentHomeData } from "@/lib/api/student-home";
import { auth } from "@/lib/auth";

export default async function GraduationFormPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const { profile } = await getStudentHomeData(session.user.id);

  return <GraduationFormClient userId={session.user.id} profile={profile} />;
}
