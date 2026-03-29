import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const majors = await prisma.major.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(majors);
}

export async function POST(req: Request) {
  const session = await auth();
  if (
    !session?.user?.role ||
    !["ADMIN", "STAFF"].includes(session.user.role)
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { name } = await req.json();
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const major = await prisma.major.create({
      data: { name },
    });

    return NextResponse.json(major);
  } catch (error: any) {
    if (error.code === "P2002") {
      return new NextResponse("Major already exists", { status: 400 });
    }
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
