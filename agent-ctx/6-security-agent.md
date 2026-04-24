# Task 6 - Security Agent

## Task: Sanitize error responses across API routes to prevent information leakage

## Summary
Created `/src/lib/api-error.ts` utility and fixed 10 catch blocks across 8 API route files that were leaking `error.message` to clients. In production, all 500 errors now return a generic message ("Terjadi kesalahan server") instead of exposing database schema, file paths, or internal state.

## Files Changed
1. **Created** `/src/lib/api-error.ts` — `getSafeErrorMessage()` and `errorResponse()` utilities
2. **Modified** `/src/app/api/generate-avatar/route.ts` — Sanitized catch block
3. **Modified** `/src/app/api/seed/route.ts` — Sanitized catch block
4. **Modified** `/src/app/api/seed-demo/route.ts` — Sanitized GET + POST catch blocks
5. **Modified** `/src/app/api/demo-champions/route.ts` — Sanitized catch block
6. **Modified** `/src/app/api/sync/route.ts` — Sanitized POST + GET catch blocks
7. **Modified** `/src/app/api/clubs/update-logos/route.ts` — Sanitized catch block
8. **Modified** `/src/app/api/tournaments/[id]/score/route.ts` — Sanitized 500 catch block (preserved 400/404 business-logic messages)
9. **Modified** `/src/app/api/tournaments/[id]/finalize/route.ts` — Sanitized catch block

## Key Design Decisions
- Business-logic error messages (400/404 responses like "Match already completed", "Match not found") are intentionally left unsanitized — they are user-facing domain messages, not internal details
- `console.error` statements preserved — server-side logging is safe and valuable for debugging
- `getSafeErrorMessage()` checks `process.env.NODE_ENV` to return real messages in development and generic fallback in production
