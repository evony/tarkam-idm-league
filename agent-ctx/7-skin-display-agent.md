# Task ID: 7 — Skin Display Agent

## Task: Add skin display to player cards and profiles throughout the TazosView IDM League project

## Work Completed

### 1. Fixed Club Object Rendering Bug
- **player-search.tsx**: Replaced `{player.club.name}` with `clubToString(player.club)` to handle cases where club can be either a string or `{id, name, logo}` object
- **player-quick-search.tsx**: Replaced `{player.club}` and `{player.club.name}` with `clubToString(player.club)` in both the "recently viewed" section and "search results" section
- **dashboard/shared.tsx**: Already uses `clubToString(player.club as any)` — no fix needed
- **player-profile.tsx**: Already uses `clubToString(player.club)` — no fix needed
- **dashboard/dashboard.tsx**: Already uses `clubToString(player.club)` — no fix needed

### 2. Show Skins on Player Cards in Dashboard
- **PlayerCard** (`player-card.tsx`):
  - Added `skins?: PlayerSkinData[]` optional prop
  - Added imports: `SkinBadgesRow`, `SkinAvatarFrame`, `SkinName`, `SkinCardBorder`, `getPrimarySkin`, `PlayerSkinData`
  - When skins are provided: shows `SkinBadgesRow` overlay at top-right of card, wraps gamertag with `SkinName` for gradient text, wraps entire card with `SkinCardBorder` for animated border
  - Champion glow border only shown when there's no primary skin (avoids double border effect)

- **OverviewTab** (`overview-tab.tsx`):
  - Added `useAppStore` import to get `playerAuth`
  - Derived `loggedInPlayerId` and `loggedInSkins` from store
  - Passes `skins` prop to `PlayerCard` only when `p.id === loggedInPlayerId`

- **StandingsTab** (`standings-tab.tsx`):
  - Added `SkinBadgesRow`, `SkinName`, `getPrimarySkin` imports
  - Added `playerAuth` from store
  - In player leaderboard table: highlights logged-in player's row with `bg-idm-gold/5`, wraps their name with `SkinName`, shows `SkinBadgesRow` next to name

### 3. Show Skins on PlayerProfile Modal
- **PlayerProfile** (`player-profile.tsx`):
  - Added `SkinBadgesRow`, `SkinAvatarFrame`, `SkinName`, `getPrimarySkin` imports
  - Checks if viewed player is the logged-in player (`isMe`)
  - Shows `SkinName` gradient on gamertag and `SkinBadgesRow` next to name when viewing own profile

### 4. Show Skins on MyTournamentCard
- **MyTournamentCard** (`my-tournament-card.tsx`):
  - Added `SkinBadgesRow`, `SkinName`, `getPrimarySkin` imports
  - Extracted `loggedInGamertag` and `loggedInSkins` from store
  - Compares searched player's gamertag with logged-in gamertag
  - Shows `SkinName` + `SkinBadgesRow` in all 3 player info sections:
    1. "No active tournament" state
    2. "No team yet" state
    3. Full dashboard with team

### 5. Verification of Existing Skin Display
- **my-account-card.tsx**: Already fully integrated with `SkinAvatarFrame`, `SkinName`, `SkinBadgesRow`, `getPrimarySkin` — no changes needed
- **unified-login-modal.tsx**: Already shows `SkinAvatarFrame`, `SkinName`, `SkinBadgesRow` for the logged-in player — no changes needed

## Files Modified
1. `src/components/idm/player-search.tsx` — Club rendering fix
2. `src/components/idm/player-quick-search.tsx` — Club rendering fix
3. `src/components/idm/player-card.tsx` — Added skins prop + skin rendering
4. `src/components/idm/dashboard/overview-tab.tsx` — Pass skins to PlayerCard
5. `src/components/idm/dashboard/standings-tab.tsx` — Show skins in leaderboard
6. `src/components/idm/player-profile.tsx` — Show skins on own profile
7. `src/components/idm/my-tournament-card.tsx` — Show skins on searched player

## Lint & Build Status
- ESLint: clean (zero errors)
- Dev server: compiles successfully
