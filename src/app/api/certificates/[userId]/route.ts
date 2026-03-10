import { NextResponse } from "next/server";
import {
  deleteCertificate,
  getCertificateFile,
  uploadCertificate,
} from "@/lib/api/certificates";
import { auth } from "@/lib/auth";
import { uploadCertificateSchema } from "@/lib/validations/certificate";

type Params = { params: Promise<{ userId: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userId } = await params;

  // Students can download their own certificate; staff/admin any
  if (session.user.role === "STUDENT" && session.user.id !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const file = await getCertificateFile(userId);
  if (!file) {
    return NextResponse.json(
      { error: "Certificate not found" },
      { status: 404 },
    );
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.fileName)}"`,
    },
  });
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;

  // Validate userId format
  const parsed = uploadCertificateSchema.safeParse({ userId });
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const certificate = await uploadCertificate(
    userId,
    { name: file.name, buffer, mimeType: file.type },
    session.user.id,
  );

  return NextResponse.json(certificate, { status: 201 });
}

export async function DELETE(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "ADMIN" && session.user.role !== "STAFF") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId } = await params;
  await deleteCertificate(userId);
  return NextResponse.json({ success: true });
}
