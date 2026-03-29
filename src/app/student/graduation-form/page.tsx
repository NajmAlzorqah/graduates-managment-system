import { redirect } from "next/navigation";
import GraduationFormClient from "@/components/student/graduation-form-client";
import { getGraduationForm } from "@/lib/api/graduation-forms";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function GraduationFormPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const [form, user, passportDoc] = await Promise.all([
    getGraduationForm(session.user.id),
    prisma.user.findUniqueOrThrow({
      where: { id: session.user.id },
      include: { studentProfile: true },
    }),
    prisma.document.findFirst({
      where: {
        userId: session.user.id,
        documentType: "PASSPORT",
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const profile = {
    id: user.id,
    nameAr: user.nameAr ?? "",
    name: user.name ?? "",
    major: user.studentProfile?.major ?? "IT",
    studentCardNumber: user.studentProfile?.studentCardNumber ?? "",
    graduationYear:
      user.studentProfile?.graduationYear?.toString() ??
      new Date().getFullYear().toString(),
    department: user.studentProfile?.major ?? "",
    phone: user.studentProfile?.phone ?? "",
  };

  return (
    <GraduationFormClient
      userId={session.user.id}
      profile={profile}
      currentForm={form}
      passportDoc={
        passportDoc
          ? {
              id: passportDoc.id,
              filePath: passportDoc.filePath,
              status: passportDoc.status,
            }
          : null
      }
    />
  );
}
