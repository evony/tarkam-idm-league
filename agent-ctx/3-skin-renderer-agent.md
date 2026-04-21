# Task 3 - Skin Renderer Components

## Agent: skin-renderer-agent

## Summary
Created the skin renderer components and utility functions for the TazosView IDM League skin system.

## Files Created

### 1. `/src/lib/skin-utils.ts`
Utility functions and type definitions for the skin system:

- **Types**: `SkinColors` (CSS color values for frame, name, badge, border, glow), `PlayerSkinWithDetails` (full skin data for rendering)
- **SKIN_TYPES constant**: Defines all 4 skin types with their icon, displayName, priority, and duration:
  - 🥇 Champion (Gold Crown) — priority 4, weekly
  - ⭐ MVP (Platinum Star) — priority 3, weekly
  - 💎 Host (Emerald Luxury) — priority 2, permanent
  - ❤️ Donor (Maroon Heart) — priority 1, permanent
- **DEFAULT_SKIN_COLORS**: Complete color schemes for each skin type using CSS color strings (not Tailwind classes) for inline style compatibility
- **parseSkinColors()**: Safely parse colorClass JSON from database
- **resolveSkinColors()**: Parse with fallback to DEFAULT_SKIN_COLORS
- **parseColorStops()**: Parse pipe-separated gradient colors
- **parseBadgeColors()**: Parse "bg|text" badge color format
- **buildGradient()**: Build CSS linear-gradient from color stops
- **getPrimarySkin()**: Get highest priority skin from list
- **sortSkinsByPriority()**: Sort skins by priority (highest first)
- **isSkinExpired()**: Check if a skin has expired
- **filterActiveSkins()**: Filter out expired skins
- **getSkinTypeDefinition()**: Get SKIN_TYPES entry by type string

### 2. `/src/components/idm/skin-renderer.tsx`
5 composable skin renderer components:

- **SkinBadge({ skin, size? })**: Displays skin icon with optional label
  - `sm` (default): Just the emoji icon (14px)
  - `md`: Icon + short label (first word) with colored pill background
  - `lg`: Icon + full displayName with colored pill background
  - All sizes use inline styles from parsed colorClass for reliability

- **SkinBadgesRow({ skins })**: Shows all owned skins sorted by priority
  - Sorts by priority descending
  - Each badge shown as small colored circle with emoji
  - Uses ARIA group role for accessibility

- **SkinAvatarFrame({ skin, children })**: Wraps avatar with skin frame
  - When skin provided: adds ring + glow shadow with pulse animation
  - When null: renders children normally (no frame)
  - Glow uses `.skin-glow-animate` CSS class for subtle breathing effect

- **SkinName({ skin, children })**: Wraps player name with gradient
  - When skin provided: applies CSS gradient from name color stops with shimmer animation
  - Uses `.skin-name-animate` for animated gradient text
  - When null: renders children normally

- **SkinCardBorder({ skin, children })**: Wraps card with skin border
  - When skin provided: adds animated gradient border using mask-composite trick
  - Includes subtle glow shadow overlay
  - Uses `.skin-border-shimmer` animation for flowing border effect
  - When null: renders children normally

### 3. Updated `/src/app/globals.css`
Added skin system CSS animations:

- `@keyframes skin-glow-pulse`: Breathing opacity for avatar frame glow (2.5s)
- `.skin-glow-animate`: Applied to avatar frame glow layers
- `@keyframes skin-border-shimmer`: Flowing gradient for card borders (3s)
- `.skin-border-shimmer::before`: Animated border background
- `@keyframes skin-name-shimmer`: Flowing gradient for name text (3s)
- `.skin-name-animate`: Applied to gradient name text
- Reduced motion support: All skin animations disabled for `prefers-reduced-motion`

## Design Decisions

1. **Inline styles over Tailwind classes**: Since skin colors come from the database (colorClass JSON), Tailwind JIT cannot scan them at build time. All dynamic colors use inline CSS styles for guaranteed rendering.

2. **CSS color format for colorClass**: The colorClass JSON stores actual CSS color values (hex, rgba) instead of Tailwind class names. This ensures colors work regardless of Tailwind's JIT scanner.

3. **Pipe-separated format**: Gradient color stops and badge colors use pipe (`|`) separation for compact JSON storage: `"#fde047|#f59e0b|#eab308"` for gradient stops, `"rgba(234,179,8,0.2)|#fde047"` for badge bg|text.

4. **Graceful fallbacks**: All components render normally when skin is null (no skin) or when colorClass parsing fails (falls back to DEFAULT_SKIN_COLORS).

## Lint & Server
- Lint: clean (zero errors)
- Dev server: running without errors
