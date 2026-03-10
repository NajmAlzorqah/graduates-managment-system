import { NextResponse } from "next/server";
import { createDocument, getDocumentsByStudent } from "@/lib/api/documents";
import { auth } from "@/lib/auth";
import { uploadDocumentSchema } from "@/lib/validations/document";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Students can view their own documents; staff/admin can view any
  if (session.user.role === "STUDENT" && session.user.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const documents = await getDocumentsByStudent(id);
  return NextResponse.json(documents);
}

export async function POST(request: Request, { params }: Params) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Only the student themselves can upload documents
  if (session.user.role === "STUDENT" && session.user.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  // Staff/admin can also upload on behalf of students

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "File is required" }, { status: 400 });
  }

  const parsed = uploadDocumentSchema.safeParse({
    documentType: formData.get("documentType"),
    label: formData.get("label"),
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const document = await createDocument(id, parsed.data, {
    name: file.name,
    buffer,
    mimeType: file.type,
  });

  return NextResponse.json(document, { status: 201 });
}
