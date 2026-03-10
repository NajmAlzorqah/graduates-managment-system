export type DocumentType =
  | "PASSPORT"
  | "PERSONAL_PHOTO"
  | "HIGH_SCHOOL_CERT"
  | "NATIONAL_ID"
  | "OTHER";

export type DocumentStatus = "PENDING" | "ACCEPTED" | "REJECTED";

export type Document = {
  id: string;
  userId: string;
  documentType: DocumentType;
  label: string;
  fileName: string;
  filePath: string;
  fileSize: number;
  mimeType: string;
  status: DocumentStatus;
  reviewedById: string | null;
  reviewedAt: Date | null;
  rejectionReason: string | null;
  createdAt: Date;
  updatedAt: Date;
};
