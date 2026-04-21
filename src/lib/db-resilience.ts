// ─── DB Resilience Helpers ───
// Utilities for gracefully handling database errors in API routes.
// When DATABASE_URL is misconfigured, db queries reject with a clear error.
// These helpers catch those errors and return appropriate HTTP responses.

import { NextResponse } from 'next/server';

/**
 * Check if an error is a database configuration error
 * (e.g., invalid DATABASE_URL, Prisma can't connect)
 */
export function isDbConfigError(error: unknown): boolean {
  if (error instanceof Error) {
    const msg = error.message || '';
    return (
      msg.includes('Database not configured') ||
      msg.includes('DATABASE_URL') ||
      msg.includes('valid PostgreSQL URL') ||
      error.constructor?.name === 'PrismaClientInitializationError'
    );
  }
  return false;
}

/**
 * Return a 503 Service Unavailable response for DB config errors,
 * or re-throw non-DB errors so they can be handled by the caller.
 */
export function handleDbError(error: unknown): NextResponse | never {
  if (isDbConfigError(error)) {
    return NextResponse.json(
      {
        error: 'Database sedang tidak tersedia',
        hint: 'DATABASE_URL belum dikonfigurasi. Hubungi admin.',
      },
      { status: 503 }
    );
  }
  throw error; // Re-throw non-DB errors
}

/**
 * Retry wrapper for Neon database operations.
 * Neon serverless can have cold starts that cause transient connection errors.
 * This wrapper retries the operation up to `maxRetries` times with exponential backoff.
 * Also handles DB config errors gracefully (returns 503 instead of crashing).
 */
export async function withNeonRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 500
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // If it's a DB config error, don't retry — it won't fix itself
      if (isDbConfigError(error)) {
        throw error;
      }

      // Check if it's a retryable error (connection timeout, etc.)
      const msg = error instanceof Error ? error.message : String(error);
      const isRetryable =
        msg.includes('timeout') ||
        msg.includes('ECONNRESET') ||
        msg.includes('ECONNREFUSED') ||
        msg.includes('connection') ||
        msg.includes('P1001') || // Prisma: Can't reach database server
        msg.includes('P1002');   // Prisma: Database server rejected

      if (!isRetryable || attempt === maxRetries) {
        throw error;
      }

      // Exponential backoff: 500ms, 1000ms, 2000ms...
      const delay = baseDelay * Math.pow(2, attempt);
      console.warn(`[db-resilience] Retry ${attempt + 1}/${maxRetries} after ${delay}ms: ${msg}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
