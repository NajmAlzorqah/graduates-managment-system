import { hash } from "bcryptjs";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createStudentSchema } from "@/lib/validations/student";

export const dynamic = "force-dynamic";

export async function GET() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    include: { studentProfile: true },
  });
  return NextResponse.json(students);
}

export async function POST(request: Request) {
  const body: unknown = await request.json();
  const parsed = createStudentSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const passwordHash = await hash(parsed.data.password, 12);

  const student = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      academicId: parsed.data.academicId,
      passwordHash,
      nameAr: parsed.data.nameAr,
      role: "STUDENT",
      studentProfile: {
        create: {
          major: parsed.data.major,
          studentCardNumber: parsed.data.studentCardNumber,
          graduationYear: parsed.data.graduationYear,
        },
      },
    },
    include: { studentProfile: true },
  });

  return NextResponse.json(student, { status: 201 });
}
