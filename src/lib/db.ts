// ─── Database Client ───
// Neon PostgreSQL — single source of truth for both sandbox and production.
// Uses DATABASE_URL (pooled) for queries and DIRECT_DATABASE_URL for migrations.
//
// Connection keep-alive: Prevents Neon cold starts during active development
// by pinging the database every 4 minutes (Neon sleeps after 5 min idle).

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  keepAliveInterval: ReturnType<typeof setInterval> | undefined
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    // Neon connection pool config — handle cold starts gracefully
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db

  // Keep-alive ping to prevent Neon cold starts during active dev
  // Pings every 4 minutes (Neon sleeps after 5 min of inactivity)
  if (!globalForPrisma.keepAliveInterval) {
    globalForPrisma.keepAliveInterval = setInterval(async () => {
      try {
        await db.$queryRaw`SELECT 1`
      } catch {
        // Silent fail — next request will reconnect
      }
    }, 4 * 60 * 1000)
  }
}
