import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "@/lib/prisma";
import type { Certificate } from "@/types/certificate";

const UPLOADS_DIR = join(process.cwd(), "uploads");

export async function getCertificate(
  userId: string,
): Promise<Certificate | null> {
  const cert = await prisma.certificate.findUnique({ where: { userId } });
  if (!cert) return null;

  return {
    id: cert.id,
    userId: cert.userId,
    fileName: cert.fileName,
    filePath: cert.filePath,
    uploadedById: cert.uploadedById,
    createdAt: cert.createdAt,
  };
}

export async function uploadCertificate(
  userId: string,
  file: { name: string; buffer: Buffer; mimeType: string },
  staffId: string,
): Promise<Certificate> {
  const certDir = join(UPLOADS_DIR, userId, "certificates");
  await mkdir(certDir, { recursive: true });

  const safeFileName = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
  const filePath = join(certDir, safeFileName);

  await writeFile(filePath, file.buffer);

  const relativePath = `uploads/${userId}/certificates/${safeFileName}`;

  const cert = await prisma.certificate.upsert({
    where: { userId },
    create: {
      userId,
      fileName: file.name,
      filePath: relativePath,
      uploadedById: staffId,
    },
    update: {
      fileName: file.name,
      filePath: relativePath,
      uploadedById: staffId,
    },
  });

  return {
    id: cert.id,
    userId: cert.userId,
    fileName: cert.fileName,
    filePath: cert.filePath,
    uploadedById: cert.uploadedById,
    createdAt: cert.createdAt,
  };
}

export async function deleteCertificate(userId: string): Promise<void> {
  const cert = await prisma.certificate.findUnique({ where: { userId } });
  if (!cert) return;

  const fullPath = join(process.cwd(), cert.filePath);
  await rm(fullPath, { force: true });
  await prisma.certificate.delete({ where: { userId } });
}

export async function getCertificateFile(
  userId: string,
): Promise<{ buffer: Buffer; fileName: string; mimeType: string } | null> {
  const cert = await prisma.certificate.findUnique({ where: { userId } });
  if (!cert) return null;

  const fullPath = join(process.cwd(), cert.filePath);
  const buffer = await readFile(fullPath);

  return { buffer, fileName: cert.fileName, mimeType: "application/pdf" };
}
