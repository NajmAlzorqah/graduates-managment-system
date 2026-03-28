export type GraduationFormStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "NEEDS_CONFIRMATION"
  | "APPROVED"
  | "REJECTED";

export type GraduationForm = {
  id: string;
  userId: string;
  status: GraduationFormStatus;
  submittedAt: Date | null;
  reviewedById: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};
