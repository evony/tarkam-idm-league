// Fix DATABASE_URL BEFORE importing PrismaClient — system env may override
// the .env file with a SQLite path, but we need PostgreSQL (Neon).
const _envUrl = process.env.DATABASE_URL || '';
const _directUrl = process.env.DIRECT_DATABASE_URL || '';
if (_envUrl.startsWith('file:') && _directUrl.startsWith('postgresql://')) {
  process.env.DATABASE_URL = _directUrl;
}

import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient() {
  return new PrismaClient()
}

export const db =
  globalForPrisma.prisma ??
  createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db
