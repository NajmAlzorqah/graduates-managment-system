import type { Session } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

const config = {
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: Replace with real authentication logic using Prisma
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        return null;
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({
      session,
      token,
    }: {
      session: Session;
      token: { sub?: string };
    }) {
      if (token?.sub && session.user) {
        (session.user as { id?: string }).id = token.sub;
      }
      return session;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(config);
