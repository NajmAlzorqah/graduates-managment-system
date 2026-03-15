import { prisma } from "@/lib/prisma";
import type { StudentReport } from "@/types/admin";

export type ReportFilters = {
  search?: string;
  major?: string;
  graduationYear?: number;
  certificateStatus?: string;
};

export async function getReports(
  filters: ReportFilters = {},
): Promise<StudentReport[]> {
  const { search, major, graduationYear, certificateStatus } = filters;

  const users = await prisma.user.findMany({
    where: {
      role: "STUDENT",
      isApproved: true,
      AND: [
        search
          ? {
              OR: [
                { nameAr: { contains: search, mode: "insensitive" } },
                { academicId: { contains: search } },
              ],
            }
          : {},
        major ? { studentProfile: { major } } : {},
        graduationYear ? { studentProfile: { graduationYear } } : {},
      ],
    },
    include: {
      studentProfile: true,
      certificateSteps: { orderBy: { order: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  const reports: StudentReport[] = users.map((u) => {
    // Determine certificate status:
    // We take the label of the first step that is not COMPLETED.
    // If all are COMPLETED, we say "مكتمل"
    const currentStep =
      u.certificateSteps.find((s) => s.status !== "COMPLETED") ||
      u.certificateSteps[u.certificateSteps.length - 1];

    let statusLabel = currentStep?.label || "غير معروف";
    if (u.certificateSteps.every((s) => s.status === "COMPLETED")) {
      statusLabel = "تمت المصادقة";
    }

    return {
      id: u.id,
      nameAr: u.nameAr,
      email: u.email,
      academicId: u.academicId,
      major: u.studentProfile?.major ?? null,
      graduationYear: u.studentProfile?.graduationYear ?? null,
      certificateStatus: statusLabel,
    };
  });

  // Client-side filter for certificateStatus if provided (since it's computed)
  if (certificateStatus) {
    return reports.filter((r) => r.certificateStatus === certificateStatus);
  }

  return reports;
}

export async function getReportFilters() {
  const majors = await prisma.studentProfile.findMany({
    where: { major: { not: null } },
    distinct: ["major"],
    select: { major: true },
  });

  const graduationYears = await prisma.studentProfile.findMany({
    where: { graduationYear: { not: null } },
    distinct: ["graduationYear"],
    select: { graduationYear: true },
  });

  const steps = await prisma.certificateStep.findMany({
    distinct: ["label"],
    select: { label: true },
  });

  return {
    majors: majors.map((m) => m.major as string),
    graduationYears: graduationYears.map((y) => y.graduationYear as number),
    certificateStatuses: [...steps.map((s) => s.label), "تمت المصادقة"],
  };
}
