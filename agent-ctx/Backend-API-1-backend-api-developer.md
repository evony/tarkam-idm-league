# Task: Backend APIs for Player Dashboard Features

## Summary
Created 4 API endpoints (3 new, 1 enhanced) for TazosView player dashboard features.

## Files Created/Modified

### New Files
1. **`/src/app/api/players/[id]/matches/route.ts`** — Player Match History API
   - Returns ALL matches (league + tournament) for a player
   - League matches found via club membership (ClubMember → LeagueMatch)
   - Tournament matches found via team memberships (TeamPlayer → Match)
   - Calculates win/loss/upcoming result for each match
   - Deduplicates tournament matches

2. **`/src/app/api/players/search/route.ts`** — Player Search API
   - Case-insensitive partial gamertag search via Prisma `contains`
   - Optional division filter
   - 20 result limit
   - Rank calculation by counting players ahead in division leaderboard

3. **`/src/app/api/league-matches/club/route.ts`** — Club Schedule API
   - All league matches for a club in a season
   - Opponent and result (win/loss/upcoming) calculated per match
   - Optional seasonId, falls back to club's own season

### Modified Files
4. **`/src/app/api/league-matches/[id]/route.ts`** — Added GET handler
   - Returns match details with club rosters (members with player info)
   - Preserved existing PUT handler

## Conventions Used
- `export const dynamic = 'force-dynamic'` on all routes
- Cache headers: `Cache-Control: public, s-maxage=10, stale-while-revalidate=30, max-age=0` + `Surrogate-Key: league-data`
- `params: Promise<{ id: string }>` pattern (Next.js 16)
- `import { db } from '@/lib/db'` for Prisma client
- Proper error handling with try/catch and HTTP status codes

## Lint Status
✅ `bun run lint` passes with zero errors
