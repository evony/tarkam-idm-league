import { db } from '@/lib/db';
import { withNeonRetry } from '@/lib/db-resilience';
import { NextResponse } from 'next/server';

// Force dynamic rendering — prevent Next.js/Vercel from caching this API response
// This ensures club logos and other data are always fresh after CMS updates
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
  // Get all seasons (active + completed) — League is unified, not per-division
  // Completed seasons still have champion data that must be displayed
  const seasons = await withNeonRetry(() => db.season.findMany({
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
    return NextResponse.json({ hasData: false, reason: 'no_season' });
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
    const playersWithAvatars = await withNeonRetry(() => db.player.findMany({
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

  // Find the season with clubs for display — fall back to any season that has clubs
  // This handles the case where the latest season (e.g., Season 2) has no clubs yet,
  // but a previous season (e.g., Season 1) has clubs and data
  const seasonWithClubs = await withNeonRetry(() => db.season.findFirst({
    where: {
      id: { in: seasons.map(s => s.id) },
      clubs: { some: {} },
    },
    orderBy: { number: 'desc' },
  }));

  const activeSeasonId = seasonWithClubs?.id || season.id;

  // All clubs — use the season that actually has clubs
  const allClubs = await withNeonRetry(() => db.club.findMany({
    where: { seasonId: activeSeasonId },
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

  // If no clubs exist anywhere, league hasn't started — still return ligaChampion
  if (allClubs.length === 0) {
    return NextResponse.json({
      hasData: false,
      reason: 'no_clubs',
      season: { id: season.id, name: season.name },
      ligaChampion, // ALWAYS return champion data even when no clubs in current season
    });
  }

  // All league matches — use activeSeasonId (the season with clubs)
  const leagueMatches = await withNeonRetry(() => db.leagueMatch.findMany({
    where: { seasonId: activeSeasonId },
    orderBy: [{ week: 'asc' }],
    include: {
      club1: true,
      club2: true,
    },
  }));

  // All playoff matches
  const playoffMatches = await withNeonRetry(() => db.playoffMatch.findMany({
    where: { seasonId: activeSeasonId },
    include: {
      club1: true,
      club2: true,
    },
    orderBy: { round: 'asc' },
  }));

  // Top players across all divisions — show all active players for roster display
  const topPlayers = await withNeonRetry(() => db.player.findMany({
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
  const mvpCandidates = await withNeonRetry(() => db.participation.findMany({
    where: {
      isMvp: true,
      tournament: { seasonId: activeSeasonId, status: 'completed' },
    },
    include: { player: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  }));

  // Detect pre-season state: clubs exist but no matches played yet
  const isPreSeason = allClubs.length > 0 && leagueMatches.length === 0;

  return NextResponse.json({
    hasData: true,
    preSeason: isPreSeason,
    season: { id: season.id, name: season.name },
    ligaChampion,
    clubs: allClubs.map(c => ({
      id: c.id,
      name: c.name,
      logo: c.logo,
      bannerImage: c.bannerImage,
      division: c.division,
      wins: c.wins,
      losses: c.losses,
      points: c.points,
      gameDiff: c.gameDiff,
      memberCount: c._count.members,
      members: c.members.map(m => ({
        id: m.player.id,
        gamertag: m.player.gamertag,
        name: m.player.gamertag, // Use gamertag as display name for profile modal
        division: m.player.division,
        tier: m.player.tier,
        points: m.player.points,
        role: m.role,
        avatar: m.player.avatar,
      })),
    })),
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
    headers: {
      // Prevent CDN caching — ensure fresh data after CMS updates (logo, etc.)
      'Cache-Control': 'no-store, max-age=0',
    },
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
    }, { status: 200 }); // Return 200 so React Query doesn't treat it as an error
  }
}
