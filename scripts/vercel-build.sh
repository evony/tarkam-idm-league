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

echo "[vercel-build] DATABASE_URL starts with: ${DB_URL:0:20}..."

if [[ "$DB_URL" == postgresql://* ]] || [[ "$DB_URL" == postgres://* ]]; then
  echo "[vercel-build] 🔀 PostgreSQL detected — swapping schema provider..."

  # Replace sqlite → postgresql
  sed -i 's/provider = "sqlite"/provider = "postgresql"/' "$SCHEMA_FILE"

  # Add directUrl line after url line (for Neon pooled connection)
  if ! grep -q 'directUrl' "$SCHEMA_FILE"; then
    sed -i '/url.*=.*env("DATABASE_URL")/a\  directUrl = env("DIRECT_DATABASE_URL")' "$SCHEMA_FILE"
  fi

  echo "[vercel-build] ✅ Schema swapped to PostgreSQL"
  cat "$SCHEMA_FILE" | head -10

  echo "[vercel-build] Running prisma generate..."
  npx prisma generate

  echo "[vercel-build] Running prisma db push (sync schema to Neon)..."
  # db push ensures Neon schema matches our Prisma schema.
  # It only ADDS missing columns/tables — safe, won't delete data.
  npx prisma db push --skip-generate 2>&1 || {
    echo "[vercel-build] ⚠️  prisma db push failed (non-fatal, continuing build)"
  }
else
  echo "[vercel-build] 📦 SQLite detected — keeping schema as-is"
  echo "[vercel-build] Running prisma generate..."
  npx prisma generate
fi

echo "[vercel-build] Running next build..."
npx next build

echo "[vercel-build] ✅ Build complete!"
