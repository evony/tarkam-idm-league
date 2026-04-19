import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// SQLite environment — use PrismaClient directly (no adapter needed)
// The OKnih version supports PostgreSQL/Neon with PrismaPg adapter,
// but this environment only uses SQLite.
function createPrismaClient() {
  return new PrismaClient()
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
