import { prisma } from "@/lib/prisma";
import type {
  CreateStudentInput,
  UpdateStudentInput,
  UpdateStudentProfileInput,
} from "@/lib/validations/student";
import type { Student, StudentWithProfile } from "@/types/student";

export async function getStudents(): Promise<Student[]> {
  const users = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { studentProfile: true },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    academicId: u.academicId,
    department: u.studentProfile?.major ?? "",
    status: u.isApproved ? ("active" as const) : ("suspended" as const),
  }));
}

export async function getStudentById(
  id: string,
): Promise<StudentWithProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id, role: "STUDENT" },
    include: { studentProfile: true },
  });
  if (!user) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    academicId: user.academicId,
    nameAr: user.nameAr,
    isApproved: user.isApproved,
    role: "STUDENT",
    createdAt: user.createdAt,
    profile: user.studentProfile
      ? {
          studentCardNumber: user.studentProfile.studentCardNumber,
          major: user.studentProfile.major,
          graduationYear: user.studentProfile.graduationYear,
        }
      : null,
  };
}

export async function createStudent(
  data: CreateStudentInput,
): Promise<StudentWithProfile> {
  const { password, major, studentCardNumber, graduationYear, ...userData } =
    data;
  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(password, 12);

  const defaultStepLabels = [
    "تعبئة الاستمارة",
    "التأكد من بيانات الاستمارة",
    "ارسال الشهادة للتعليم العالي",
    "المصادقة على الشهادة",
  ];

  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      academicId: userData.academicId,
      nameAr: userData.nameAr,
      passwordHash,
      role: "STUDENT",
      isApproved: false,
      studentProfile: {
        create: {
          major: major ?? "",
          studentCardNumber: studentCardNumber ?? null,
          graduationYear: graduationYear ?? null,
        },
      },
      certificateSteps: {
        create: defaultStepLabels.map((label, i) => ({
          label,
          order: i + 1,
          status: "PENDING",
        })),
      },
    },
    include: { studentProfile: true },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    academicId: user.academicId,
    nameAr: user.nameAr,
    isApproved: user.isApproved,
    role: "STUDENT",
    createdAt: user.createdAt,
    profile: user.studentProfile
      ? {
          studentCardNumber: user.studentProfile.studentCardNumber,
          major: user.studentProfile.major,
          graduationYear: user.studentProfile.graduationYear,
        }
      : null,
  };
}

export async function updateStudent(
  id: string,
  userData: UpdateStudentInput,
  profileData?: UpdateStudentProfileInput,
): Promise<StudentWithProfile | null> {
  const user = await prisma.user.update({
    where: { id },
    data: {
      ...userData,
      ...(profileData
        ? {
            studentProfile: {
              upsert: {
                create: profileData,
                update: profileData,
              },
            },
          }
        : {}),
    },
    include: { studentProfile: true },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    academicId: user.academicId,
    nameAr: user.nameAr,
    isApproved: user.isApproved,
    role: "STUDENT",
    createdAt: user.createdAt,
    profile: user.studentProfile
      ? {
          studentCardNumber: user.studentProfile.studentCardNumber,
          major: user.studentProfile.major,
          graduationYear: user.studentProfile.graduationYear,
        }
      : null,
  };
}

export async function deleteStudent(id: string): Promise<void> {
  await prisma.user.delete({ where: { id } });
}

export async function approveStudent(
  id: string,
): Promise<StudentWithProfile | null> {
  return updateStudent(id, { isApproved: true });
}

export async function getUnapprovedStudents(): Promise<Student[]> {
  const users = await prisma.user.findMany({
    where: { role: "STUDENT", isApproved: false },
    include: { studentProfile: true },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    academicId: u.academicId,
    department: u.studentProfile?.major ?? "",
    status: "suspended" as const,
  }));
}
