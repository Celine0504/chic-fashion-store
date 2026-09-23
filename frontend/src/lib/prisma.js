import { PrismaClient } from "@prisma/client";

// In development, Next.js clears the Node.js cache on every edit (Hot Reload).
// We attach PrismaClient to globalThis to prevent opening too many database connections.
const globalForPrisma = globalThis;

if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = "mysql://dummy:dummy@127.0.0.1:3306/chic_fashion_db";
}

let prismaInstance;
try {
  prismaInstance = globalForPrisma.prisma || new PrismaClient();
} catch (e) {
  console.warn("Prisma build-time warning:", e.message);
  prismaInstance = {};
}

export const prisma = prismaInstance;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}