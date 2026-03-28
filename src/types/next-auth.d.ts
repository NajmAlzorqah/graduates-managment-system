import type { UserRole } from "@/types/user";
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    role?: UserRole;
    nameAr?: string | null;
  }
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      nameAr?: string | null;
      email?: string | null;
      image?: string | null;
      role?: UserRole;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: UserRole;
    nameAr?: string | null;
  }
}
