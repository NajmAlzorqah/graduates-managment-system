import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import type { UploadDocumentInput } from "@/lib/validations/document";
import type { Document } from "@/types/document";

const UPLOADS_DIR = join(process.cwd(), "uploads");

function toDocument(d: {
  id: string;
  userId: string;
  documentType: string;
  label: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: string;
  reviewedById: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}): Document {
  return {
    id: d.id,
    userId: d.userId,
    documentType: d.documentType as Document["documentType"],
    label: d.label,
    fileName: d.fileName,
    filePath: d.filePath,
    fileSize: d.fileSize,
    mimeType: d.mimeType,
    status: d.status as Document["status"],
    reviewedById: d.reviewedById,
    reviewedAt: d.reviewedAt,
    rejectionReason: d.rejectionReason,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
  };
}

export async function getDocumentsByStudent(
  userId: string,
): Promise<Document[]> {
  const docs = await prisma.document.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
  return docs.map(toDocument);
}

export async function createDocument(
  userId: string,
  data: UploadDocumentInput,
  file: { name: string; buffer: Buffer; mimeType: string },
): Promise<Document> {
  const userDir = join(UPLOADS_DIR, userId);
  await mkdir(userDir, { recursive: true });

  const safeFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = join(userDir, safeFileName);

  await writeFile(filePath, file.buffer);

  const doc = await prisma.document.create({
    data: {
      userId,
      documentType: data.documentType,
      label: data.label,
      fileName: file.name,
      filePath: `uploads/${userId}/${safeFileName}`,
      fileSize: file.buffer.byteLength,
      mimeType: file.mimeType,
      status: "PENDING",
    },
  });

  return toDocument(doc);
}

export async function updateDocumentStatus(
  docId: string,
  status: "ACCEPTED" | "REJECTED",
  reviewerId: string,
  rejectionReason?: string,
): Promise<Document> {
  const doc = await prisma.document.update({
    where: { id: docId },
    data: {
      status,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
      rejectionReason: status === "REJECTED" ? (rejectionReason ?? null) : null,
    },
  });
  return toDocument(doc);
}

export async function deleteDocument(docId: string): Promise<void> {
  const doc = await prisma.document.findUniqueOrThrow({ where: { id: docId } });
  const fullPath = join(process.cwd(), doc.filePath);

  await rm(fullPath, { force: true });
  await prisma.document.delete({ where: { id: docId } });
}

export async function getDocumentFile(
  docId: string,
): Promise<{ buffer: Buffer; fileName: string; mimeType: string }> {
  const doc = await prisma.document.findUniqueOrThrow({ where: { id: docId } });
  const fullPath = join(process.cwd(), doc.filePath);
  const buffer = await readFile(fullPath);

  return { buffer, fileName: doc.fileName, mimeType: doc.mimeType };
}
