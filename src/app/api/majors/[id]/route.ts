import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
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

    const major = await prisma.major.update({
      where: { id },
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const session = await auth();
  if (
    !session?.user?.role ||
    !["ADMIN", "STAFF"].includes(session.user.role)
  ) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    await prisma.major.delete({
      where: { id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
