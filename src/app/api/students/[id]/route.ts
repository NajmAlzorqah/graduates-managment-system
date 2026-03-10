import { NextResponse } from "next/server";
import {
  deleteStudent,
  getStudentById,
  updateStudent,
} from "@/lib/api/students";
import { auth } from "@/lib/auth";
import {
  updateStudentProfileSchema,
  updateStudentSchema,
} from "@/lib/validations/student";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}

export async function PUT(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body: unknown = await request.json();

  const { profile: profileBody, ...userBody } =
    (body as Record<string, unknown>) ?? {};

  const parsedUser = updateStudentSchema.safeParse(userBody);
  if (!parsedUser.success) {
    return NextResponse.json(
      { error: parsedUser.error.flatten() },
      { status: 400 },
    );
  }

  let profileData:
    | undefined
    | ReturnType<typeof updateStudentProfileSchema.parse>;
  if (profileBody) {
    const parsedProfile = updateStudentProfileSchema.safeParse(profileBody);
    if (!parsedProfile.success) {
      return NextResponse.json(
        { error: parsedProfile.error.flatten() },
        { status: 400 },
      );
    }
    profileData = parsedProfile.data;
  }

  const student = await updateStudent(id, parsedUser.data, profileData);
  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  await deleteStudent(id);
  return NextResponse.json({ success: true });
}
