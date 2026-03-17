import { prisma } from "@/lib/prisma";
import type {
  CreateStudentInput,
  UpdateStudentInput,
  UpdateStudentProfileInput,
} from "@/lib/validations/student";
import type {
  Student,
  StudentBasicInfo,
  StudentWithProfile,
  StudentWithSteps,
} from "@/types/student";

const stepStatusMap = {
  COMPLETED: "completed",
  IN_PROGRESS: "in-progress",
  PENDING: "pending",
} as const;

export async function getStudentsWithCertSteps(
  excludeCompleted = true,
): Promise<StudentWithSteps[]> {
  const users = await prisma.user.findMany({
    where: { role: "STUDENT", isApproved: true },
    include: {
      studentProfile: true,
      graduationForm: true,
      certificateSteps: { orderBy: { order: "asc" } },
      documents: true,
    },
    orderBy: { createdAt: "desc" },
  });

  const allStudents = users.map((u) => ({
    id: u.id,
    name: u.name,
    nameAr: u.nameAr,
    nameEn: u.nameEn,
    major: u.studentProfile?.major ?? null,
    steps: u.certificateSteps.map((s) => ({
      id: s.id,
      label: s.label,
      status: stepStatusMap[s.status],
    })),
    graduationFormSubmitted: !!u.graduationForm,
    documents: u.documents.map((d) => ({
      id: d.id,
      label: d.label,
      documentType: d.documentType,
      filePath: d.filePath,
      status: d.status.toLowerCase(),
    })),
  }));

  if (excludeCompleted) {
    return allStudents.filter((s) =>
      s.steps.some((step) => step.status !== "completed"),
    );
  }

  return allStudents;
}

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
    "تعبئة استمارة التخرج",
    "مراجعة البيانات وتأكيدها",
    "اعتماد التخرج",
    "رفع الشهادة للتعليم العالي",
    "المصادقة النهائية",
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

export async function createStaffUser(data: {
  name: string;
  email: string;
  academicId: string;
  password: string;
  nameAr?: string;
}): Promise<{
  id: string;
  name: string | null;
  email: string;
  academicId: string;
}> {
  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      academicId: data.academicId,
      nameAr: data.nameAr ?? null,
      passwordHash,
      role: "STAFF",
      isApproved: true,
    },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    academicId: user.academicId,
  };
}

export async function getStaffUsers(): Promise<
  {
    id: string;
    name: string | null;
    nameAr: string | null;
  }[]
> {
  const users = await prisma.user.findMany({
    where: { role: "STAFF" },
    select: {
      id: true,
      name: true,
      nameAr: true,
    },
    orderBy: { nameAr: "asc" },
  });

  return users;
}

export async function getStudentsBasicInfo(): Promise<StudentBasicInfo[]> {
  const users = await prisma.user.findMany({
    where: { role: "STUDENT", isApproved: true },
    select: {
      id: true,
      name: true,
      nameAr: true,
      academicId: true,
      studentProfile: {
        select: { major: true, graduationYear: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    nameAr: u.nameAr,
    academicId: u.academicId,
    major: u.studentProfile?.major ?? null,
    graduationYear: u.studentProfile?.graduationYear ?? null,
  }));
}

export async function getAllApprovedStudentIds(): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: { role: "STUDENT", isApproved: true },
    select: { id: true },
  });
  return users.map((u) => u.id);
}

export async function getStudentIdsByFilter(
  major?: string,
  graduationYear?: number,
): Promise<string[]> {
  const users = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      isApproved: true,
      studentProfile: {
        ...(major ? { major } : {}),
        ...(graduationYear ? { graduationYear } : {}),
      },
    },
    select: { id: true },
  });
  return users.map((u) => u.id);
}
