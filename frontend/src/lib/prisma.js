import { PrismaClient } from "@prisma/client";

// In development, Next.js clears the Node.js cache on every edit (Hot Reload).
// We attach PrismaClient to globalThis to prevent opening too many database connections.
const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}