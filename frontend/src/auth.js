import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { findUserByEmail } from "@/lib/userStore";

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: {
    strategy: "jwt",
  },
  trustHost: true,
  secret:
    process.env.AUTH_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "chicfashionstoresupersecretkey1234567890",
  pages: {
    signIn: "/account",
    error: "/account",
  },
  providers: [
    Google({
      clientId: googleClientId,
      clientSecret: googleClientSecret,
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
        let user = await findUserByEmail(rawLogin);

        if (!user && !rawLogin.includes("@")) {
          try {
            let phoneClean = rawLogin.replace(/[\s\-\(\)]/g, "");
            if (!phoneClean.startsWith("+91")) {
              if (phoneClean.startsWith("91") && phoneClean.length === 12) {
                phoneClean = `+${phoneClean}`;
              } else {
                phoneClean = `+91${phoneClean}`;
              }
            }
            if (prisma && typeof prisma.user?.findUnique === "function") {
              user = await prisma.user.findUnique({
                where: { phoneNumber: phoneClean },
              });
            }
          } catch (e) {}
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
          id: String(user.id),
          name: user.name,
          email: user.email || user.phoneNumber,
          image: user.image,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user?.email) {
        try {
          if (prisma && typeof prisma.user?.upsert === "function") {
            await prisma.user.upsert({
              where: { email: user.email.toLowerCase() },
              update: {
                name: user.name,
                image: user.image,
              },
              create: {
                email: user.email.toLowerCase(),
                name: user.name,
                image: user.image,
              },
            });
          }
        } catch (dbErr) {
          console.warn("Prisma Google sync skipped (serverless mode):", dbErr.message);
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.picture = user.image;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture;
      }
      return session;
    },
  },
});