import { prisma } from "@/lib/prisma";
import type {
  CreateStaffUserInput,
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
  NEEDS_VERIFICATION: "needs-verification",
  MODIFIED: "modified",
  REJECTED: "rejected",
} as const;

export async function getStudentsWithCertSteps(
  excludeCompleted = true,
): Promise<StudentWithSteps[]> {
  const users = await prisma.user.findMany({
    where: { role: "STUDENT", isApproved: true },
    include: {
      studentProfile: {
        include: { majorRelation: true },
      },
      graduationForm: true,
      certificateSteps: { orderBy: { order: "asc" } },
      documents: { orderBy: { createdAt: "desc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const allStudents = users.map((u) => ({
    id: u.id,
    name: u.name,
    nameAr: u.nameAr,
    major: u.studentProfile?.majorRelation?.name ?? u.studentProfile?.major ?? null,
    phone: u.studentProfile?.phone ?? null,
    studentCardNumber: u.studentProfile?.studentCardNumber ?? null,
    graduationYear: u.studentProfile?.graduationYear ?? null,
    steps: u.certificateSteps.map((s) => ({
      id: s.id,
      label: s.label,
      status: stepStatusMap[s.status as keyof typeof stepStatusMap],
    })),
    graduationFormSubmitted: !!u.graduationForm,
    graduationFormStatus: u.graduationForm?.status ?? null,
    graduationFormId: u.graduationForm?.id ?? null,
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
    include: { 
      studentProfile: {
        include: { majorRelation: true }
      } 
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    academicId: u.academicId,
    department: u.studentProfile?.majorRelation?.name ?? u.studentProfile?.major ?? "",
    status: u.isApproved ? ("active" as const) : ("suspended" as const),
    avatarUrl: u.image,
  }));
}

export async function getStudentById(
  id: string,
): Promise<StudentWithProfile | null> {
  const user = await prisma.user.findUnique({
    where: { id, role: "STUDENT" },
    include: { 
      studentProfile: {
        include: { majorRelation: true }
      } 
    },
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
    image: user.image,
    profile: user.studentProfile
      ? {
          studentCardNumber: user.studentProfile.studentCardNumber,
          major: user.studentProfile.majorRelation?.name ?? user.studentProfile.major,
          graduationYear: user.studentProfile.graduationYear,
          phone: user.studentProfile.phone,
        }
      : null,
  };
}

export async function createStudent(
  data: CreateStudentInput,
): Promise<StudentWithProfile> {
  const { password, major, studentCardNumber, graduationYear, ...userData } =
    data;

  // Validate major if provided
  if (major) {
    const majorExists = await prisma.major.findUnique({
      where: { name: major },
    });
    if (!majorExists) {
      throw new Error(`التخصص "${major}" غير موجود في النظام`);
    }
  }

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
      name: userData.name || null,
      email: userData.email || `${userData.academicId}@grads.system`,
      academicId: userData.academicId,
      nameAr: userData.nameAr,
      passwordHash,
      role: "STUDENT",
      isApproved: false,
      studentProfile: {
        create: {
          major: major ?? null,
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
    include: { 
      studentProfile: {
        include: { majorRelation: true }
      } 
    },
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
    image: user.image,
    profile: user.studentProfile
      ? {
          studentCardNumber: user.studentProfile.studentCardNumber,
          major: user.studentProfile.majorRelation?.name ?? user.studentProfile.major,
          graduationYear: user.studentProfile.graduationYear,
          phone: user.studentProfile.phone,
        }
      : null,
  };
}

export async function updateStudent(
  id: string,
  userData: UpdateStudentInput,
  profileData?: UpdateStudentProfileInput,
): Promise<StudentWithProfile | null> {
  // Validate major if provided in profileData
  if (profileData?.major) {
    const majorExists = await prisma.major.findUnique({
      where: { name: profileData.major },
    });
    if (!majorExists) {
      throw new Error(`التخصص "${profileData.major}" غير موجود في النظام`);
    }
  }

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
    include: { 
      studentProfile: {
        include: { majorRelation: true }
      } 
    },
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
    image: user.image,
    profile: user.studentProfile
      ? {
          studentCardNumber: user.studentProfile.studentCardNumber,
          major: user.studentProfile.majorRelation?.name ?? user.studentProfile.major,
          graduationYear: user.studentProfile.graduationYear,
          phone: user.studentProfile.phone,
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
    include: { 
      studentProfile: {
        include: { majorRelation: true }
      } 
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name ?? "",
    email: u.email,
    academicId: u.academicId,
    department: u.studentProfile?.majorRelation?.name ?? u.studentProfile?.major ?? "",
    status: "suspended" as const,
    avatarUrl: u.image,
  }));
}

export async function createStaffUser(data: CreateStaffUserInput): Promise<{
  id: string;
  name: string | null;
  email: string;
  academicId: string;
}> {
  const bcrypt = await import("bcryptjs");
  const passwordHash = await bcrypt.hash(data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: data.name || null,
      email: data.email || `${data.academicId}@grads.system`,
      academicId: data.academicId,
      nameAr: data.nameAr,
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
        include: { majorRelation: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map((u) => ({
    id: u.id,
    name: u.name,
    nameAr: u.nameAr,
    academicId: u.academicId,
    major: u.studentProfile?.majorRelation?.name ?? u.studentProfile?.major ?? null,
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
  status?: "active" | "graduated",
): Promise<string[]> {
  const where: any = {
    role: "STUDENT",
    isApproved: true,
    studentProfile: {
      ...(major ? { major } : {}),
      ...(graduationYear ? { graduationYear } : {}),
    },
  };

  if (status === "active") {
    where.certificateSteps = {
      some: { status: { in: ["PENDING", "IN_PROGRESS"] } },
    };
  } else if (status === "graduated") {
    where.certificateSteps = {
      none: { status: { in: ["PENDING", "IN_PROGRESS"] } },
    };
  }

  const users = await prisma.user.findMany({
    where,
    select: { id: true },
  });
  return users.map((u) => u.id);
}

export async function getFilteredStudentsCount(filter: {
  major?: string;
  graduationYear?: number;
  status?: "active" | "graduated" | "all";
}): Promise<number> {
  const where: any = {
    role: "STUDENT",
    isApproved: true,
    studentProfile: {
      ...(filter.major ? { major: filter.major } : {}),
      ...(filter.graduationYear
        ? { graduationYear: filter.graduationYear }
        : {}),
    },
  };

  if (filter.status === "active") {
    where.certificateSteps = {
      some: { status: { in: ["PENDING", "IN_PROGRESS"] } },
    };
  } else if (filter.status === "graduated") {
    where.certificateSteps = {
      none: { status: { in: ["PENDING", "IN_PROGRESS"] } },
    };
  }

  return prisma.user.count({ where });
}
