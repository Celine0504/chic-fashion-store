import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: "/account",
    error: "/account",
  },
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Invalid credentials.");
        }

        const rawLogin = credentials.email.trim();
        let user = null;

        if (rawLogin.includes('@')) {
          user = await prisma.user.findUnique({
            where: { email: rawLogin.toLowerCase() },
          });
        } else {
          let phoneClean = rawLogin.replace(/[\s\-\(\)]/g, "");
          if (!phoneClean.startsWith("+91")) {
            if (phoneClean.startsWith("91") && phoneClean.length === 12) {
              phoneClean = `+${phoneClean}`;
            } else {
              phoneClean = `+91${phoneClean}`;
            }
          }
          user = await prisma.user.findUnique({
            where: { phoneNumber: phoneClean },
          });
        }

        if (!user) {
          throw new Error("No user found.");
        }

        if (!user.password) {
          throw new Error("GoogleAccountNoPassword");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error("Incorrect password.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email || user.phoneNumber,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
      }
      return session;
    },
  },
});