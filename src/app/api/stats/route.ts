import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

// Force dynamic — this route is never statically rendered
export const dynamic = 'force-dynamic';

// ── Smart Caching Strategy for /api/stats ──
// Same as /api/league: CDN caches 10s, browser never caches, Surrogate-Key for targeted purge.
// Admin mutations that affect standings/scores call revalidateTag('league-data').

const STATS_CACHE_HEADERS = {
  'Cache-Control': 'public, s-maxage=10, stale-while-revalidate=30, max-age=0',
  'Surrogate-Key': 'league-data',
  'Vary': 'Accept-Encoding',
};

const STATS_CACHE_HEADERS_SHORT = {
  'Cache-Control': 'public, s-maxage=5, stale-while-revalidate=15, max-age=0',
  'Surrogate-Key': 'league-data',
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const division = searchParams.get('division') || 'male';

  // Find seasons for the SPECIFIC division requested
  // Male and Female are separate seasons with separate clubs, matches, tournaments
  const allSeasons = await db.season.findMany({
    where: { division, status: { in: ['active', 'completed'] } },
    orderBy: { number: 'desc' },
  });

  // Use the latest season for this division as the primary reference
  const season = allSeasons[0];

  if (!season) {
    return NextResponse.json({ hasData: false, division }, {
      headers: STATS_CACHE_HEADERS_SHORT,
    });
  }

  // Find the latest season for this division that actually has clubs
  // This handles the case where a new Season is active but has no clubs yet,
  // while a previous season (completed) has clubs that should still be visible
  const seasonWithClubs = await db.season.findFirst({
    where: {
      division,
      id: { in: allSeasons.map(s => s.id) },
      clubs: { some: {} },
    },
    orderBy: { number: 'desc' },
  });
  // Use the season that has clubs for all club/league-related queries, fall back to latest season
  const activeSeasonId = seasonWithClubs?.id || season.id;
  const seasonForClubs = seasonWithClubs || season;

  // Run ALL independent queries in parallel
  const [
    activeTournament,
    totalPlayers,
    seasonDonations,
    topPlayers,
    clubs,
    recentMatches,
    upcomingMatches,
    playoffMatches,
    tournaments,
    leagueMatches,
  ] = await Promise.all([
    // Active/recent tournament — use activeSeasonId for consistency with clubs
    db.tournament.findFirst({
      where: { seasonId: activeSeasonId },
      orderBy: { weekNumber: 'desc' },
      include: {
        teams: { include: { teamPlayers: { include: { player: true } } } },
        matches: { include: { team1: true, team2: true, mvpPlayer: true } },
        participations: { include: { player: true } },
        donations: true,
      },
    }),

    // Total players
    db.player.count({ where: { division, isActive: true } }),

    // ALL approved donations for the season — use activeSeasonId for consistency
    db.donation.findMany({
      where: { seasonId: activeSeasonId, status: 'approved' },
    }),

    // Top players leaderboard — show all active players for landing page roster
    db.player.findMany({
      where: { division, isActive: true },
      orderBy: [{ points: 'desc' }, { totalWins: 'desc' }],
    }),

    // Clubs standings — use the season that actually has clubs
    db.club.findMany({
      where: { seasonId: activeSeasonId },
      orderBy: [{ points: 'desc' }, { gameDiff: 'desc' }],
      include: { _count: { select: { members: true } }, season: { select: { name: true, division: true } } },
    }),

    // Recent matches — use activeSeasonId for consistency with clubs
    db.leagueMatch.findMany({
      where: { seasonId: activeSeasonId, status: 'completed' },
      orderBy: { week: 'desc' },
      take: 3,
      include: { club1: true, club2: true },
    }),

    // Upcoming matches
    db.leagueMatch.findMany({
      where: { seasonId: activeSeasonId, status: 'upcoming' },
      orderBy: { week: 'asc' },
      take: 3,
      include: { club1: true, club2: true },
    }),

    // Playoff matches
    db.playoffMatch.findMany({
      where: { seasonId: activeSeasonId },
      include: { club1: true, club2: true },
      orderBy: { round: 'asc' },
    }),

    // Tournaments list — use activeSeasonId for consistency with clubs/league data
    db.tournament.findMany({
      where: { seasonId: activeSeasonId },
      orderBy: { weekNumber: 'asc' },
      include: {
        _count: { select: { teams: true, participations: true } },
        teams: {
          where: { isWinner: true },
          include: { teamPlayers: { include: { player: true } } },
        },
        participations: {
          where: { isMvp: true },
          include: { player: true },
        },
      },
    }),

    // All league matches grouped by week — use activeSeasonId for consistency
    db.leagueMatch.findMany({
      where: { seasonId: activeSeasonId },
      orderBy: [{ week: 'asc' }],
      include: { club1: true, club2: true },
    }),
  ]);

  // ── Fallback logo resolution for clubs ──
  // Same pattern as /api/league — if a club in the current season has no logo,
  // fall back to the most recent logo from any season with the same club name.
  const clubsNeedingLogo = clubs.filter((c: { logo: string | null }) => !c.logo);
  if (clubsNeedingLogo.length > 0) {
    const clubNames = clubsNeedingLogo.map((c: { name: string }) => c.name);
    const fallbackClubs = await db.club.findMany({
      where: {
        name: { in: clubNames },
        logo: { not: null },
      },
      select: { name: true, logo: true },
    });
    const logoLookup = new Map<string, string>();
    for (const fb of fallbackClubs) {
      if (!logoLookup.has(fb.name) && fb.logo) {
        logoLookup.set(fb.name, fb.logo);
      }
    }
    for (const club of clubs) {
      if (!club.logo && logoLookup.has(club.name)) {
        club.logo = logoLookup.get(club.name)!;
      }
    }
  }

  // ── Fallback bannerImage resolution ──
  const clubsNeedingBanner = clubs.filter((c: { bannerImage: string | null }) => !c.bannerImage);
  if (clubsNeedingBanner.length > 0) {
    const clubNames = clubsNeedingBanner.map((c: { name: string }) => c.name);
    const fallbackClubs = await db.club.findMany({
      where: {
        name: { in: clubNames },
        bannerImage: { not: null },
      },
      select: { name: true, bannerImage: true },
    });
    const bannerLookup = new Map<string, string>();
    for (const fb of fallbackClubs) {
      if (!bannerLookup.has(fb.name) && fb.bannerImage) {
        bannerLookup.set(fb.name, fb.bannerImage);
      }
    }
    for (const club of clubs) {
      if (!club.bannerImage && bannerLookup.has(club.name)) {
        club.bannerImage = bannerLookup.get(club.name)!;
      }
    }
  }

  // ── Compute derived values in-memory (no extra DB queries) ──

  // Total prize pool — filter weekly donations
  const totalPrizePool = seasonDonations
    .filter(d => d.type === 'weekly')
    .reduce((sum, d) => sum + d.amount, 0);

  // Season donation total
  const seasonDonationTotal = seasonDonations.reduce((sum, d) => sum + d.amount, 0);

  // Top donors — computed in-memory from seasonDonations instead of groupBy query
  const donorAccum = new Map<string, { totalAmount: number; donationCount: number }>();
  for (const d of seasonDonations) {
    const entry = donorAccum.get(d.donorName) ?? { totalAmount: 0, donationCount: 0 };
    donorAccum.set(d.donorName, {
      totalAmount: entry.totalAmount + d.amount,
      donationCount: entry.donationCount + 1,
    });
  }
  const topDonors = Array.from(donorAccum.entries())
    .map(([donorName, data]) => ({
      donorName,
      _sum: { amount: data.totalAmount },
      _count: { id: data.donationCount },
    }))
    .sort((a, b) => b._sum.amount - a._sum.amount)
    .slice(0, 5);

  // Completed tournaments — filtered in-memory from already-fetched list
  const completedTournaments = tournaments.filter(t => t.status === 'completed');

  // Weekly champions — derived from completedTournaments (no new query)
  const weeklyChampions = completedTournaments.map(t => {
    const winnerTeam = t.teams[0]; // Only 1 winning team
    const mvpParticipation = t.participations.find(p => p.isMvp); // Admin-assigned MVP
    const mvpPlayer = mvpParticipation?.player;
    return {
      weekNumber: t.weekNumber,
      tournamentName: t.name,
      prizePool: t.prizePool,
      completedAt: t.completedAt,
      winnerTeam: winnerTeam ? {
        name: winnerTeam.name,
        players: winnerTeam.teamPlayers.map(tp => ({
          id: tp.player.id,
          gamertag: tp.player.gamertag,
          avatar: tp.player.avatar,
          tier: tp.player.tier,
          points: tp.player.points,
          totalWins: tp.player.totalWins,
          totalMvp: tp.player.totalMvp,
          streak: tp.player.streak,
          matches: tp.player.matches,
        })),
      } : null,
      mvp: mvpPlayer ? { id: mvpPlayer.id, gamertag: mvpPlayer.gamertag, avatar: mvpPlayer.avatar, tier: mvpPlayer.tier, totalMvp: mvpPlayer.totalMvp, points: mvpPlayer.points } : null,
    };
  });

  // Season progress — 1 season = 10 weeks (fixed)
  const SEASON_TOTAL_WEEKS = 10;
  const completedWeeks = tournaments.filter(t => t.status === 'completed').length;

  // MVP Hall of Fame — computed in-memory from tournament participations instead of a separate query
  const mvpHallOfFame = completedTournaments
    .flatMap(t =>
      t.participations.map(p => ({
        _sortKey: p.createdAt as Date,
        id: p.player.id,
        gamertag: p.player.gamertag,
        avatar: p.player.avatar,
        tier: p.player.tier,
        totalMvp: p.player.totalMvp,
        points: p.player.points,
        totalWins: p.player.totalWins,
        streak: p.player.streak,
        weekNumber: t.weekNumber,
        tournamentName: t.name,
        prizePool: t.prizePool,
      }))
    )
    .sort((a, b) => +b._sortKey - +a._sortKey)
    .map(({ _sortKey, ...rest }) => rest);

  return NextResponse.json({
    hasData: true,
    division,
    season,
    seasonForClubs, // Season that has clubs — used by admin club management
    activeTournament,
    totalPlayers,
    totalPrizePool,
    seasonDonationTotal,
    topPlayers,
    clubs,
    recentMatches,
    upcomingMatches,
    playoffMatches,
    tournaments,
    weeklyChampions,
    leagueMatches,
    topDonors,
    mvpHallOfFame,
    seasonProgress: {
      totalWeeks: SEASON_TOTAL_WEEKS,
      completedWeeks,
      percentage: SEASON_TOTAL_WEEKS > 0 ? Math.round((completedWeeks / SEASON_TOTAL_WEEKS) * 100) : 0,
    },
  }, {
    headers: STATS_CACHE_HEADERS,
  });
}
