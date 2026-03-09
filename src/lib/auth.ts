import type { Session } from "next-auth";
import NextAuth from "next-auth";
import type { JWT } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import { loginSchema } from "@/lib/validations/auth";
import type { UserRole } from "@/types/user";

// ---------------------------------------------------------------------------
// MOCK user store — swap the body of `authorize` for a real Prisma call later
// ---------------------------------------------------------------------------
const MOCK_USERS = [
  {
    id: "1",
    name: "Admin User",
    academicId: "admin",
    password: "admin", // TODO: use hashed passwords (bcrypt) in production
    role: "ADMIN" as UserRole,
  },
  {
    id: "2",
    name: "Student User",
    academicId: "student",
    password: "student", // TODO: use hashed passwords (bcrypt) in production
    role: "STUDENT" as UserRole,
  },
  {
    id: "3",
    name: "Staff User",
    academicId: "staff",
    password: "staff", // TODO: use hashed passwords (bcrypt) in production
    role: "STAFF" as UserRole,
  },
];

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

        // TODO: replace with Prisma lookup:
        // const user = await prisma.user.findUnique({ where: { academicId } });
        // if (!user || !(await bcrypt.compare(password, user.passwordHash))) return null;
        const user = MOCK_USERS.find(
          (u) => u.academicId === academicId && u.password === password,
        );
        if (!user) return null;

        return { id: user.id, name: user.name, role: user.role };
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }: { token: JWT; user?: { role?: UserRole } }) {
      if (user?.role) {
        token.role = user.role;
      }
      return token;
    },
    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT & { role?: UserRole };
    }) {
      if (session.user) {
        (session.user as { id?: string; role?: UserRole }).id = token.sub;
        (session.user as { id?: string; role?: UserRole }).role = token.role;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
