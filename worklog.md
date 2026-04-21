---
Task ID: 1
Agent: main
Task: Implement skin/achievement system with donor badge persistence

Work Log:
- Read and analyzed entire codebase: prisma schema, skin-utils, skin-renderer, admin-skin-panel, player-card, login modal, stats API, account APIs
- Updated Prisma schema: added `donorBadgeCount Int @default(0)` to Account model
- Ran `bun run db:push` successfully to sync schema
- Updated skin-utils.ts: changed host duration from 'permanent' to 'weekly', added `getDonorBadgeConfig()` and `shouldShowDonorBadge()` helper functions
- Updated types: added `donorBadgeCount` to PlayerSkinInfo (stats.ts) and PlayerSkinData (store.ts), added `donorBadgeCount` to PlayerAccount interface
- Updated skin seed route: changed host to weekly, updated donor description to mention permanent heart badge
- Updated skin award API: when awarding donor skin, increments `donorBadgeCount` on Account; returns updated count
- Updated stats API: includes donorBadgeCount in skinMap entries; adds virtual `donor_badge` entry for players with expired donor skin but permanent heart badges
- Updated account login API: includes donorBadgeCount, adds virtual donor_badge when skin expired but badges exist
- Updated account session API: same as login
- Updated skins/my API: includes donorBadgeCount, virtual donor_badge entry
- Updated skins/player/[accountId] API: includes donorBadgeCount, virtual donor_badge entry
- Updated skins/holders API: includes donorBadgeCount for donor skin holders
- Updated skin-renderer.tsx: added `DonorHeartBadge` component with pulse glow animation for 5+ donations; `SkinBadgesRow` now renders permanent donor heart badges
- Added CSS animation `donor-heart-pulse` with keyframes for pulse + glow effect on 5+ donation hearts
- Updated admin-skin-panel.tsx: all skins shown as "Weekly", added donor badge indicator in catalog, shows donorBadgeCount in holder list, donor award shows "Badge ❤️ tetap permanen" note
- Updated unified-login-modal.tsx: skin info now shows "(1 minggu)" for all skins and "(1 minggu, badge ❤️ permanen!)" for donor

Stage Summary:
- Penyewa (💎 Host) skin duration changed from permanent to weekly (1 week)
- Donatur (❤️ Donor) skin duration changed from permanent to weekly (1 week)
- Donor heart badges are now permanent — persist after skin expires
- 1-4 donations: small heart badge (❤️)
- 5+ donations: bigger heart badge with pulse glow animation
- All APIs updated to include donorBadgeCount and virtual donor_badge entries
- Frontend updated to show permanent heart badges in SkinBadgesRow
- CSS animation added for donor heart pulse effect
