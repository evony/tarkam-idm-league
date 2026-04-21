#!/bin/bash
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Vercel Build Script — Auto-swaps Prisma provider for PostgreSQL
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# Local dev (sandbox):  DATABASE_URL=file:... → SQLite (schema stays as-is)
# Vercel (production):  DATABASE_URL=postgresql://... → PostgreSQL (auto-swap)
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

set -e

SCHEMA_FILE="prisma/schema.prisma"
DB_URL="${DATABASE_URL:-}"

echo "[vercel-build] DATABASE_URL starts with: ${DB_URL:0:15}..."

if [[ "$DB_URL" == postgresql://* ]] || [[ "$DB_URL" == postgres://* ]]; then
  echo "[vercel-build] 🔀 PostgreSQL detected — swapping schema provider..."

  # Replace sqlite → postgresql
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' "$SCHEMA_FILE"

  # Add directUrl line after url line (for Neon pooled connection)
  if ! grep -q 'directUrl' "$SCHEMA_FILE"; then
    sed -i '/url.*=.*env("DATABASE_URL")/a\  directUrl = env("DIRECT_DATABASE_URL")' "$SCHEMA_FILE"
  fi

  echo "[vercel-build] ✅ Schema swapped to PostgreSQL"
  echo "[vercel-build] Running prisma generate..."
  npx prisma generate
else
  echo "[vercel-build] 📦 SQLite detected — keeping schema as-is"
fi

echo "[vercel-build] Running next build..."
next build
