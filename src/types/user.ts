export type UserRole = "STUDENT" | "ADMIN" | "STAFF";

export type User = {
  id: string;
  name: string | null;
  email: string;
  academicId: string;
  nameAr: string | null;
  isApproved: boolean;
  role: UserRole;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
};
