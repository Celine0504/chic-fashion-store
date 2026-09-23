import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

const googleClientId = process.env.AUTH_GOOGLE_ID || process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.AUTH_GOOGLE_SECRET || process.env.GOOGLE_CLIENT_SECRET;

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
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

        try {
          if (prisma && typeof prisma.user?.findUnique === "function") {
            if (rawLogin.includes("@")) {
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
          }
        } catch (dbErr) {
          console.warn("Prisma user lookup error:", dbErr.message);
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