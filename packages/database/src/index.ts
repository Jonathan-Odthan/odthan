import { PrismaClient } from "@prisma/client";

/**
 * Client Prisma singleton.
 * Toutes les applications (web, auto, business, investir, admin, account)
 * importent cette même instance pour partager une base PostgreSQL unique.
 */
declare global {
  // eslint-disable-next-line no-var
  var __odthanPrisma: PrismaClient | undefined;
}

export const prisma =
  global.__odthanPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  global.__odthanPrisma = prisma;
}

export * from "@prisma/client";
