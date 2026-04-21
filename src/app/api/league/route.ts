import { db } from '@/lib/db';
import { withDbRetry } from '@/lib/db-resilience';
import { NextResponse } from 'next/server';

// Force dynamic — this route is never statically rendered
export const dynamic = 'force-dynamic';

// ── Smart Caching Strategy for /api/league ──
//
// Vercel has 3 cache layers: Data Cache, CDN (Edge Network), Browser cache.
// We use a BALANCED approach instead of nuclear no-cache:
//
// 1. CDN Cache: 10s + stale-while-revalidate=30
//    → Normal visitors get fast cached responses (hit Neon DB less)
//    → Stale responses are served while CDN revalidates in background
//
// 2. Browser Cache: max-age=0 (never cache in browser)
//    → Browser always re-requests, but CDN still serves cached if fresh
//
// 3. Surrogate-Key: 'league-data'
//    → Admin mutations call revalidateTag('league-data') to PURGE CDN instantly
//    → After admin updates logo/score, next visitor gets fresh data
//
// 4. Cloudinary images: cached by Cloudinary CDN (separate, not affected)
//
// Result: Fast for visitors, instant updates after admin changes.

/** Shared cache headers for all /api/league responses */
const LEAGUE_CACHE_HEADERS = {
  // s-maxage=10: Vercel CDN caches for 10 seconds (fast for normal visitors)
  // stale-while-revalidate=30: Serve stale while revalidating in background
  // max-age=0: Browser NEVER caches (always re-requests, but CDN may serve cached)
  // Surrogate-Key: Allows targeted CDN purge via revalidateTag('league-data')
  'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30, max-age=0',
  'Surrogate-Key': 'league-data',
  'Vary': 'Accept-Encoding',  // Don't split cache by irrelevant headers
};

const LEAGUE_CACHE_HEADERS_SHORT = {
  // Shorter cache for error/fallback responses
  'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15, max-age=0',
  'Surrogate-Key': 'league-data',
};

export async function GET() {
  try {
  // Get all seasons (active + completed) — League is unified, not per-division
  // Completed seasons still have champion data that must be displayed
  const seasons = await withDbRetry(() => db.season.findMany({
    where: { status: { in: ['active', 'completed'] } },
    orderBy: { number: 'desc' },
    include: {
      championClub: {
        select: {
          id: true, name: true, logo: true, division: true, points: true, wins: true, losses: true,
          members: {
            include: {
              player: { select: { id: true, gamertag: true, division: true, tier: true, points: true, avatar: true } },
            },
          },
        },
      },
    },
  }));

  if (!seasons || seasons.length === 0) {
    return NextResponse.json({ hasData: false, reason: 'no_season' }, {
      headers: LEAGUE_CACHE_HEADERS_SHORT,
    });
  }

  // Build Liga IDM champion data from the season that has a championClubId
  // Liga IDM is a unified competition — champion is the best club across all divisions
  const championSeason = seasons.find(s => s.championClubId && s.championClub);
  const ligaChampion = championSeason?.championClub ? {
    id: championSeason.championClub.id,
    name: championSeason.championClub.name,
    logo: championSeason.championClub.logo,
    seasonNumber: championSeason.number,
    // Use manually set championSquad if available (from CMS admin), otherwise use all champion club members
    members: (() => {
      // championSquad is stored as JSON string — must parse first
      const rawSquad = championSeason.championSquad;
      const squad: Array<{id: string; gamertag: string; division: string; role: string}> | null =
        rawSquad ? (typeof rawSquad === 'string' ? JSON.parse(rawSquad) : rawSquad as unknown as Array<{id: string; gamertag: string; division: string; role: string}>) : null;
      if (squad && Array.isArray(squad) && squad.length > 0) {
        // Use championSquad — but we need avatars from the Player table
        // (championClub.members only covers ONE division, but squads can be cross-division)
        // We'll resolve avatars asynchronously below after this IIFE
        return squad.map(s => ({
          id: s.id,
          gamertag: s.gamertag,
          division: s.division,
          role: s.role,
          avatar: null as string | null, // Placeholder — will be filled in below
        }));
      }
      // Fallback: use all champion club members (avatars already included)
      return championSeason.championClub.members?.map(m => ({
        id: m.player.id,
        gamertag: m.player.gamertag,
        division: m.player.division,
        role: m.role,
        avatar: m.player.avatar,
      })) || [];
    })()
  } : null;

  // ── Resolve avatars for champion squad members ──
  // championSquad is stored without avatar, so we query Player table directly
  // This handles cross-division squads (e.g., female players in a male club's champion squad)
  if (ligaChampion?.members && ligaChampion.members.some(m => m.avatar === null)) {
    const memberIds = ligaChampion.members.map(m => m.id);
    const playersWithAvatars = await withDbRetry(() => db.player.findMany({
      where: { id: { in: memberIds } },
      select: { id: true, avatar: true },
    }));
    const avatarLookup = new Map(playersWithAvatars.map(p => [p.id, p.avatar]));
    for (const member of ligaChampion.members) {
      if (member.avatar === null) {
        member.avatar = avatarLookup.get(member.id) || null;
      }
    }
  }

  // Use the latest season as the "current" season reference
  const season = seasons[0];

  // ── Get clubs from ALL active/completed seasons ──
  // Liga IDM is a unified competition. Male and Female are separate SEASONS
  // with separate clubs. We must query clubs from ALL seasons, not just one.
  const allSeasonIds = seasons.map(s => s.id);

  // All clubs — from ALL active/completed seasons (both male & female)
  const allClubs = await withDbRetry(() => db.club.findMany({
    where: { seasonId: { in: allSeasonIds } },
    orderBy: [{ points: 'desc' }, { gameDiff: 'desc' }],
    include: {
      _count: { select: { members: true } },
      members: {
        include: {
          player: { select: { id: true, gamertag: true, division: true, tier: true, points: true, avatar: true } },
        },
      },
    },
  }));

  // ── Fallback logo resolution ──
  // Clubs are per-season records. A club might not have a logo in the current season
  // but has one in a previous season. We fall back to the most recent logo for the
  // same club name across ALL seasons.
  const clubsNeedingLogo = allClubs.filter(c => !c.logo);
  if (clubsNeedingLogo.length > 0) {
    const clubNames = clubsNeedingLogo.map(c => c.name);
    const fallbackClubs = await withDbRetry(() => db.club.findMany({
      where: {
        name: { in: clubNames },
        logo: { not: null },
      },
      select: { name: true, logo: true, seasonId: true },
    }));
    // Build lookup: clubName → any non-null logo (just take the first one found)
    const logoLookup = new Map<string, string>();
    for (const fb of fallbackClubs) {
      if (!logoLookup.has(fb.name) && fb.logo) {
        logoLookup.set(fb.name, fb.logo);
      }
    }
    // Apply fallback logos
    for (const club of allClubs) {
      if (!club.logo && logoLookup.has(club.name)) {
        club.logo = logoLookup.get(club.name)!;
      }
    }
  }

  // ── Fallback bannerImage resolution (same pattern) ──
  const clubsNeedingBanner = allClubs.filter(c => !c.bannerImage);
  if (clubsNeedingBanner.length > 0) {
    const clubNames = clubsNeedingBanner.map(c => c.name);
    const fallbackClubs = await withDbRetry(() => db.club.findMany({
      where: {
        name: { in: clubNames },
        bannerImage: { not: null },
      },
      select: { name: true, bannerImage: true },
    }));
    const bannerLookup = new Map<string, string>();
    for (const fb of fallbackClubs) {
      if (!bannerLookup.has(fb.name) && fb.bannerImage) {
        bannerLookup.set(fb.name, fb.bannerImage);
      }
    }
    for (const club of allClubs) {
      if (!club.bannerImage && bannerLookup.has(club.name)) {
        club.bannerImage = bannerLookup.get(club.name)!;
      }
    }
  }

  // If no clubs exist anywhere, league hasn't started — still return ligaChampion
  if (allClubs.length === 0) {
    return NextResponse.json({
      hasData: false,
      reason: 'no_clubs',
      season: { id: season.id, name: season.name },
      ligaChampion, // ALWAYS return champion data even when no clubs in current season
    }, {
      headers: LEAGUE_CACHE_HEADERS_SHORT,
    });
  }

  // All league matches — from ALL seasons
  const leagueMatches = await withDbRetry(() => db.leagueMatch.findMany({
    where: { seasonId: { in: allSeasonIds } },
    orderBy: [{ week: 'asc' }],
    include: {
      club1: true,
      club2: true,
    },
  }));

  // All playoff matches — from ALL seasons
  const playoffMatches = await withDbRetry(() => db.playoffMatch.findMany({
    where: { seasonId: { in: allSeasonIds } },
    include: {
      club1: true,
      club2: true,
    },
    orderBy: { round: 'asc' },
  }));

  // Top players across all divisions — show all active players for roster display
  const topPlayers = await withDbRetry(() => db.player.findMany({
    where: { isActive: true },
    orderBy: [{ points: 'desc' }, { totalWins: 'desc' }],
  }));

  // Stats
  const totalClubs = allClubs.length;
  const totalMatches = leagueMatches.length;
  const completedMatches = leagueMatches.filter(m => m.status === 'completed').length;
  const liveMatches = leagueMatches.filter(m => m.status === 'live').length;
  const weeks = [...new Set(leagueMatches.map(m => m.week))].sort((a: number, b: number) => a - b);
  // Calculate total weeks from match data — not hardcoded
  // Liga IDM schedule depends on funding, not a fixed number of weeks
  const totalWeeks = weeks.length > 0 ? Math.max(...weeks) : 0;

  // MVP candidates
  const mvpCandidates = await withDbRetry(() => db.participation.findMany({
    where: {
      isMvp: true,
      tournament: { seasonId: { in: allSeasonIds }, status: 'completed' },
    },
    include: { player: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  }));

  // Detect pre-season state: clubs exist but no matches played yet
  const isPreSeason = allClubs.length > 0 && leagueMatches.length === 0;

  // ── Deduplicate clubs across seasons/divisions ──
  // Clubs in IDM League are unified entities — a club is NOT "male" or "female".
  // A club belongs to ALL divisions. Even if a club only has members in one
  // division, it's still the same club. We merge same-named clubs into ONE entry.
  const clubMap = new Map<string, {
    id: string;
    name: string;
    logo: string | null;
    bannerImage: string | null;
    wins: number;
    losses: number;
    points: number;
    gameDiff: number;
    memberCount: number;
    members: Array<{ id: string; gamertag: string; name: string; division: string; tier: string; points: number; role: string; avatar: string | null }>;
  }>();

  for (const c of allClubs) {
    const existing = clubMap.get(c.name);
    const clubEntry = {
      id: c.id,
      name: c.name,
      logo: c.logo,
      bannerImage: c.bannerImage,
      wins: c.wins,
      losses: c.losses,
      points: c.points,
      gameDiff: c.gameDiff,
      memberCount: c._count.members,
      members: c.members.map(m => ({
        id: m.player.id,
        gamertag: m.player.gamertag,
        name: m.player.gamertag,
        division: m.player.division,
        tier: m.player.tier,
        points: m.player.points,
        role: m.role,
        avatar: m.player.avatar,
      })),
    };

    if (!existing) {
      clubMap.set(c.name, clubEntry);
    } else {
      // Merge: keep best stats, use logo if available
      existing.wins += c.wins;
      existing.losses += c.losses;
      existing.points += c.points;
      existing.gameDiff += c.gameDiff;
      existing.memberCount += c._count.members;
      // Use the logo from whichever record has one
      if (!existing.logo && c.logo) existing.logo = c.logo;
      if (!existing.bannerImage && c.bannerImage) existing.bannerImage = c.bannerImage;
      // Merge members (avoid duplicates by player id)
      const existingMemberIds = new Set(existing.members.map(m => m.id));
      for (const m of clubEntry.members) {
        if (!existingMemberIds.has(m.id)) {
          existing.members.push(m);
        }
      }
    }
  }

  const dedupedClubs = Array.from(clubMap.values());

  return NextResponse.json({
    hasData: true,
    preSeason: isPreSeason,
    season: { id: season.id, name: season.name },
    ligaChampion,
    clubs: dedupedClubs,
    leagueMatches: leagueMatches.map(m => ({
      id: m.id, week: m.week, score1: m.score1, score2: m.score2,
      status: m.status, format: m.format,
      club1: { id: m.club1.id, name: m.club1.name, logo: m.club1.logo },
      club2: { id: m.club2.id, name: m.club2.name, logo: m.club2.logo },
    })),
    playoffMatches: playoffMatches.map(m => ({
      id: m.id, round: m.round, score1: m.score1, score2: m.score2,
      status: m.status, format: m.format,
      club1: { id: m.club1.id, name: m.club1.name, logo: m.club1.logo },
      club2: { id: m.club2.id, name: m.club2.name, logo: m.club2.logo },
    })),
    topPlayers: topPlayers.map(p => ({
      id: p.id, gamertag: p.gamertag, division: p.division,
      tier: p.tier, points: p.points, totalWins: p.totalWins,
      totalMvp: p.totalMvp, streak: p.streak, avatar: p.avatar,
    })),
    mvpCandidates: mvpCandidates.map(mp => ({
      id: mp.player.id,
      gamertag: mp.player.gamertag,
      tier: mp.player.tier,
      totalMvp: mp.player.totalMvp,
      points: mp.player.points,
      totalWins: mp.player.totalWins,
      streak: mp.player.streak,
      avatar: mp.player.avatar,
      division: mp.player.division,
    })),
    stats: {
      totalClubs,
      totalMatches,
      completedMatches,
      liveMatches,
      totalWeeks,
      playedWeeks: weeks.length,
    },
    teamFormat: {
      size: 5,
      main: 3,
      substitute: 2,
      rule: 'Peserta bebas mix atau tidak mix dari divisi male dan female. Skuad champion dapat memilih anggota dari divisi mana saja.',
    },
  }, {
    headers: LEAGUE_CACHE_HEADERS,
  });

  } catch (error: any) {
    // Neon cold start or connection error — return graceful fallback
    console.error('[/api/league] Error:', error?.message || error);
    return NextResponse.json({
      hasData: false,
      reason: 'db_error',
      error: error?.message || 'Database connection failed',
      // Always attempt to preserve ligaChampion if we got that far
      ligaChampion: null,
    }, {
      status: 200, // Return 200 so React Query doesn't treat it as an error
      headers: LEAGUE_CACHE_HEADERS_SHORT,
    });
  }
}
