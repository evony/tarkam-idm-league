# Task 2-b: Frontend Developer Work Record

## Summary
Added two features to the TazosView IDM League app:
1. **Match History in Player Profile** — Shows league + tournament match history between "Rekor Match" and "Rincian Poin" sections
2. **Club Schedule Filter in Matches Tab** — Dropdown to filter matches by specific club

## Files Modified
1. `/home/z/my-project/src/components/idm/player-profile.tsx` — Added match history section
2. `/home/z/my-project/src/components/idm/dashboard/matches-tab.tsx` — Rewrote with club filter feature
3. `/home/z/my-project/src/components/idm/dashboard/index.tsx` — Added `clubs` prop to MatchesTab

## API Endpoints Used
- `GET /api/players/{id}/matches` — Player match history (league + tournament)
- `GET /api/league-matches/club?clubId={id}&seasonId={id}` — Club schedule filter

## Key Decisions
- Query only enabled when `player.matches > 0` (optimization)
- `staleTime: 30000` for both queries
- Match limit of 10 with "Lihat Semua" toggle
- Club filter uses shadcn/ui Select component
- All labels in Indonesian
- Color coding: green=Menang, red=Kalah, muted=Akan Datang
- Division theme (dt) styling used throughout

## Lint Status
✅ `bun run lint` passed with zero errors
