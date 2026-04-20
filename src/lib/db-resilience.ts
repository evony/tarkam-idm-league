/**
 * Neon Cold Start Resilience Utilities
 * 
 * Neon PostgreSQL databases auto-suspend after inactivity.
 * The first query after wake-up can take 1-3 seconds and may fail.
 * These utilities add retry logic to handle cold starts gracefully.
 */

// Neon cold start retry wrapper — retries DB queries that fail due to cold start
export async function withNeonRetry<T>(fn: () => Promise<T>, retries = 2): Promise<T> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isConnectionError = 
        error?.code === 'ECONNRESET' ||
        error?.code === 'ETIMEDOUT' ||
        error?.code === '57P03' || // PostgreSQL: database is starting up
        error?.code === '08006' || // PostgreSQL: connection failure
        error?.code === '08003' || // PostgreSQL: connection does not exist
        error?.message?.includes('connection') ||
        error?.message?.includes('timeout') ||
        error?.message?.includes('ECONNREFUSED') ||
        error?.message?.includes('database is starting up');
      
      if (isConnectionError && attempt < retries) {
        // Wait before retry (exponential backoff for Neon cold start)
        const delay = 1000 * Math.pow(2, attempt);
        console.warn(`[Neon Retry] Attempt ${attempt + 1} failed, retrying in ${delay}ms...`, error?.message);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw new Error('Max Neon retries exceeded');
}

// Wrapper for API route handlers that need DB resilience
export function withDbResilience(handler: () => Promise<Response>): () => Promise<Response> {
  return async () => {
    try {
      return await handler();
    } catch (error: any) {
      console.error('[API DB Error]:', error?.message || error);
      return new Response(
        JSON.stringify({ 
          error: 'Database temporarily unavailable', 
          reason: 'db_error',
          message: 'Neon database is warming up. Please refresh in a few seconds.' 
        }),
        { 
          status: 200, // Return 200 so React Query doesn't treat it as a permanent error
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  };
}
