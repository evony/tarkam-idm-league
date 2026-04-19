import { db } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  // Get all seasons (active + completed) — League is unified, not per-division
  // Completed seasons still have champion data that must be displayed
  const seasons = await db.season.findMany({
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
  });

  const season = seasons[0];

  if (!season) {
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
      // Build avatar map from champion club members
      const avatarMap = new Map<string, string | null>();
      for (const m of championSeason.championClub.members || []) {
        avatarMap.set(m.player.id, m.player.avatar);
      }

      const squadRaw = championSeason.championSquad;
      const squad = squadRaw ? (typeof squadRaw === 'string' ? JSON.parse(squadRaw) : squadRaw) as Array<{id: string; gamertag: string; division: string; role: string}> | null : null;
      if (squad && squad.length > 0) {
        // Use championSquad but merge in avatar from club members
        return squad.map(s => ({
          id: s.id,
          gamertag: s.gamertag,
          division: s.division,
          role: s.role,
          avatar: avatarMap.get(s.id) || null,
        }));
      }
      // Fallback: use all champion club members
      return championSeason.championClub.members?.map(m => ({
        id: m.player.id,
        gamertag: m.player.gamertag,
        division: m.player.division,
        role: m.role,
        avatar: m.player.avatar,
      })) || [];
    })()
  } : null;

  // All clubs — League treats clubs as unified entities (mixed male+female members)
  const allClubs = await db.club.findMany({
    where: { seasonId: season.id },
    orderBy: [{ points: 'desc' }, { gameDiff: 'desc' }],
    include: {
      _count: { select: { members: true } },
      members: {
        include: {
          player: { select: { id: true, gamertag: true, division: true, tier: true, points: true, avatar: true } },
        },
      },
    },
  });

  // If no clubs exist yet, league hasn't started — show empty state
  if (allClubs.length === 0) {
    return NextResponse.json({ hasData: false, reason: 'no_clubs', season: { id: season.id, name: season.name } });
  }

  // All league matches
  const leagueMatches = await db.leagueMatch.findMany({
    where: { seasonId: season.id },
    orderBy: [{ week: 'asc' }],
    include: {
      club1: true,
      club2: true,
    },
  });

  // All playoff matches
  const playoffMatches = await db.playoffMatch.findMany({
    where: { seasonId: season.id },
    include: {
      club1: true,
      club2: true,
    },
    orderBy: { round: 'asc' },
  });

  // Top players across all divisions — show all active players for roster display
  const topPlayers = await db.player.findMany({
    where: { isActive: true },
    orderBy: [{ points: 'desc' }, { totalWins: 'desc' }],
  });

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
  const mvpCandidates = await db.participation.findMany({
    where: {
      isMvp: true,
      tournament: { seasonId: season.id, status: 'completed' },
    },
    include: { player: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  // Detect pre-season state: clubs exist but no matches played yet
  const isPreSeason = allClubs.length > 0 && leagueMatches.length === 0;

  // Query champion seasons for all clubs in this season
  const clubIds = allClubs.map(c => c.id);
  const championSeasonRows = await db.season.findMany({
    where: { championClubId: { in: clubIds } },
    select: { id: true, name: true, number: true, championClubId: true },
    orderBy: { number: 'desc' },
  });
  // Build a map: clubId -> championSeasons[]
  const championSeasonsMap = new Map<string, { id: string; name: string; number: number }[]>();
  for (const cs of championSeasonRows) {
    if (cs.championClubId) {
      const arr = championSeasonsMap.get(cs.championClubId) || [];
      arr.push({ id: cs.id, name: cs.name, number: cs.number });
      championSeasonsMap.set(cs.championClubId, arr);
    }
  }

  return NextResponse.json({
    hasData: true,
    preSeason: isPreSeason,
    season: { id: season.id, name: season.name },
    ligaChampion,
    clubs: allClubs.map(c => ({
      id: c.id,
      name: c.name,
      logo: c.logo,
      wins: c.wins,
      losses: c.losses,
      points: c.points,
      gameDiff: c.gameDiff,
      memberCount: c._count.members,
      members: c.members.map(m => ({
        id: m.player.id,
        gamertag: m.player.gamertag,
        division: m.player.division,
        tier: m.player.tier,
        points: m.player.points,
        role: m.role,
        avatar: m.player.avatar,
      })),
      championSeasons: championSeasonsMap.get(c.id) || [],
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
      rule: 'Wajib minimal 1 peserta female. Tim tidak boleh semua male atau semua female.',
    },
  });
}
