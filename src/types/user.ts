export type UserRole = "STUDENT" | "ADMIN" | "STAFF";

export type User = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  image: string | null;
};
