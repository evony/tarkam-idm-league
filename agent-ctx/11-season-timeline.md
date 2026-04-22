# Task 11 — Season Timeline Component

## Task Description
Create a visual Season Timeline component for the IDM League landing page that shows the progression of seasons.

## What Was Done

### 1. API Endpoint: `/src/app/api/seasons/timeline/route.ts`
- GET /api/seasons/timeline
- Returns chronological season data (ordered by number ascending)
- Includes: id, name, number, status, startDate, endDate, tournamentCount, playerCount, championClub (name + logo)
- CDN caching: s-maxage=10, stale-while-revalidate=30
- Graceful empty data handling and error handling

### 2. Component: `/src/components/idm/landing/season-timeline.tsx`
- Visual horizontal timeline with season nodes
- Status-coded nodes: gold (completed), cyan (active), gray (upcoming)
- Champion club display with ClubLogoImage for completed seasons
- Active season pulse/glow effects
- Responsive: horizontal scroll on mobile, centered layout on desktop
- @tanstack/react-query with 30s staleTime
- SectionHeader with Calendar icon, "Perjalanan Liga" title
- Loading skeleton and empty state with AnimatedEmptyState
- Legend at bottom

### 3. Integration: `/src/components/idm/landing-page.tsx`
- Added Calendar import and SeasonTimeline import
- Placed between StatsTicker and AboutSection
- Added 'timeline' to sectionIds, desktop nav, mobile nav

### 4. CSS Animations: `/src/app/globals.css`
- timeline-node-enter: Fade up + scale entrance
- timeline-pulse-glow: Expanding/fading pulse ring
- timeline-active-glow: Pulsing box-shadow glow
- timeline-line-draw: Clip-path line drawing animation
- All respect prefers-reduced-motion

## Verification
- `bun run lint` — zero errors
- API tested: /api/seasons/timeline returns 200 with 2 seasons
- Landing page loads (200)
- Dev server compiles successfully
