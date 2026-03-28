import bcrypt from "bcryptjs";
import type { Session } from "next-auth";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { loginSchema } from "@/lib/validations/auth";
import type { UserRole } from "@/types/user";

const config = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        academicId: { label: "Academic ID", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { academicId, password } = parsed.data;

        const user = await prisma.user.findUnique({
          where: { academicId },
        });
        if (!user) return null;
        if (!(await bcrypt.compare(password, user.passwordHash))) return null;
        if (!user.isApproved) return null;

        return {
          id: user.id,
          name: user.name,
          nameAr: user.nameAr,
          role: user.role,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: { role?: UserRole; nameAr?: string | null };
    }) {
      if (user?.role) {
        token.role = user.role;
      }
      if (user?.nameAr) {
        token.nameAr = user.nameAr;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT & { role?: UserRole; nameAr?: string | null };
    }) {
      if (session.user) {
        (session.user as { id?: string; role?: UserRole }).id = token.sub;
        (session.user as { id?: string; role?: UserRole }).role = token.role;
        (session.user as { nameAr?: string | null }).nameAr = token.nameAr;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
