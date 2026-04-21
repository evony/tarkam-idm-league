# Task 2-a: Frontend Developer — Player Search & Match Detail Modal

## Summary
Created Player Search dialog and Match Detail Modal components, plus their API routes, and integrated them into the dashboard.

## Files Created

### 1. `/home/z/my-project/src/components/idm/player-search.tsx`
- **PlayerSearch** component with search dialog
- Props: `division`, `onSelectPlayer`, `open`, `onOpenChange`
- Features:
  - 300ms debounced search input
  - Auto-focus on dialog open
  - Results show avatar, gamertag, tier badge, club name, rank, points, wins, MVP
  - Empty state: "Ketik nama untuk mulai mencari"
  - No results: "Tidak ditemukan" with hint
  - Loading spinner while fetching
  - Clear button on input
  - Uses shadcn/ui Dialog, division theme, ClubLogoImage, TierBadge, getAvatarUrl

### 2. `/home/z/my-project/src/components/idm/match-detail-modal.tsx`
- **MatchDetailModal** component
- Props: `matchId`, `onClose`, `preview`
- Features:
  - Preview data shown while API loads (instant feedback)
  - Week, format, status badges in header
  - Large score display with club logos, Home/Away labels
  - MVP player highlighted with gold
  - Club 1 & Club 2 roster lists with avatars, gamertag, tier, captain badge
  - Win/Loss indicator per club
  - Loading state while fetching match detail
  - Uses shadcn/ui Dialog, division theme, ClubLogoImage, TierBadge, getAvatarUrl

### 3. `/home/z/my-project/src/app/api/players/search/route.ts`
- **GET /api/players/search?q={query}&division={division}**
- Searches by gamertag OR name (case-insensitive, partial match via `contains`)
- Returns top 20 players sorted by points desc
- Includes club info (id, name, logo) from ClubMember relation
- Calculates rank within division using a pre-fetched sorted list
- Returns: `{ players: [{ id, gamertag, division, tier, points, totalWins, totalMvp, avatar, club, rank }] }`

### 4. `/home/z/my-project/src/app/api/league-matches/[id]/route.ts`
- **GET /api/league-matches/{id}**
- Fetches LeagueMatch with both clubs and their members (players)
- Members sorted by role (captain first)
- Attempts to find MVP from tournament matches for the same week/division
- Returns full match detail: `{ id, week, score1, score2, status, format, mvpPlayer, club1: { id, name, logo, members }, club2: { id, name, logo, members } }`

## Files Modified

### 5. `/home/z/my-project/src/components/idm/dashboard/standings-tab.tsx`
- Added `Search` icon import from lucide-react
- Added `PlayerSearch` component import
- Added `useAppStore` import for division
- Added `searchOpen` state
- Added "Cari" search button next to Players/Clubs sub-tabs
- Rendered `<PlayerSearch>` component with open/onOpenChange props
- Removed unused `Image` import

### 6. `/home/z/my-project/src/components/idm/dashboard/matches-tab.tsx`
- Added `MatchDetailModal` component import
- Added `selectedMatchId` and `matchPreview` state
- Made all MatchRow instances clickable (wrapped in clickable div)
  - Completed matches: passes club names, scores, week, status to preview
  - Upcoming matches: passes club names, null scores, week, status to preview
- Made all ClubMatchRow instances clickable (club-filtered view)
  - Correctly determines home/away club names from match data
- Rendered `<MatchDetailModal>` at bottom of component
- Removed unused `Image` import

## Design Decisions
- **Simple UI**: Clean, minimal design following existing patterns. No confusing elements.
- **Indonesian labels**: "Cari Pemain", "Ketik nama kamu...", "Tidak ditemukan", "Memuat detail...", "Pemain:", "Menang"/"Kalah"
- **Division theme**: All components use `useDivisionTheme()` for consistent styling
- **Existing components**: Reuses TierBadge, ClubLogoImage, Badge, Dialog from shadcn/ui
- **Preview pattern**: MatchDetailModal accepts preview data so users see instant feedback while API loads
- **Clickable match rows**: Wrapped in div with cursor-pointer instead of modifying MatchRow props (non-invasive)

## Verification
- `bun run lint` — passes with zero errors
- Player search API tested — returns results correctly with club info
- Match detail API returns 404 for non-existent matches (correct behavior, no league matches in DB yet)
- Dev server running without errors
