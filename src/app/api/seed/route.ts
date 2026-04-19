import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/api-auth';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const force = searchParams.get('force') === 'true';

  if (force) {
    const authResult = await requireAdmin(request);
    if (authResult instanceof NextResponse) return authResult;
  } else {
    const seasonCount = await db.season.count();
    if (seasonCount > 0) {
      return NextResponse.json({ success: true, message: 'Database already has seasons — seeding skipped' });
    }
  }

  try {
    // Clear existing data (respect foreign key order)
    await db.playerAchievement.deleteMany();
    await db.playerPoint.deleteMany();
    await db.teamPlayer.deleteMany();
    await db.match.deleteMany();
    await db.team.deleteMany();
    await db.participation.deleteMany();
    await db.tournamentPrize.deleteMany();
    await db.donation.deleteMany();
    await db.clubMember.deleteMany();
    await db.leagueMatch.deleteMany();
    await db.playoffMatch.deleteMany();
    await db.club.deleteMany();
    await db.tournament.deleteMany();
    await db.player.deleteMany();
    await db.season.deleteMany();

    // ======== SEASONS ========
    const maleSeason = await db.season.create({
      data: {
        name: 'IDM League Season 1 - Male',
        number: 1,
        division: 'male',
        status: 'active',
        startDate: new Date('2025-01-06'),
      },
    });

    const femaleSeason = await db.season.create({
      data: {
        name: 'IDM League Season 1 - Female',
        number: 1,
        division: 'female',
        status: 'active',
        startDate: new Date('2025-01-06'),
      },
    });

    // ======== MALE PLAYERS (all points = 0) ========
    const maleData = [
      { gamertag: 'AbdnZ', club: 'MAXIMOUS' },
      { gamertag: 'afi', club: 'MAXIMOUS' },
      { gamertag: 'Afroki', club: 'SOUTHERN' },
      { gamertag: 'Airuen', club: 'AVENUE' },
      { gamertag: 'Armors', club: 'SOUTHERN' },
      { gamertag: 'astro', club: 'MAXIMOUS' },
      { gamertag: 'Bambang', club: 'MAXIMOUS' },
      { gamertag: 'Boby', club: 'MAXIMOUS' },
      { gamertag: 'CARAOSEL', club: 'ORPHIC' },
      { gamertag: 'cepz', club: 'SALVADOR' },
      { gamertag: 'chand', club: 'MAXIMOUS' },
      { gamertag: 'chikoo', club: 'SENSEI' },
      { gamertag: 'Chrollo', club: 'EUPHORIC' },
      { gamertag: 'DUUL', club: 'PARANOID' },
      { gamertag: 'Dylee', club: 'SENSEI' },
      { gamertag: 'Earth', club: 'MAXIMOUS' },
      { gamertag: 'fyy', club: 'GYMSHARK' },
      { gamertag: 'Georgie', club: 'ALQA' },
      { gamertag: 'ipinnn', club: 'GYMSHARK' },
      { gamertag: 'Jave', club: 'RESTART' },
      { gamertag: 'janskie', club: 'SOUTHERN' },
      { gamertag: 'jugger', club: 'GYMSHARK' },
      { gamertag: 'justice', club: 'EUPHORIC' },
      { gamertag: 'Kageno', club: 'AVENUE' },
      { gamertag: 'KIERAN', club: 'MAXIMOUS' },
      { gamertag: 'KIRA', club: 'SOUTHERN' },
      { gamertag: 'Life', club: 'SALVADOR' },
      { gamertag: 'marimo', club: 'SECRETS' },
      { gamertag: 'montiel', club: 'PARANOID' },
      { gamertag: 'Oura', club: 'SALVADOR' },
      { gamertag: 'Ren', club: 'MAXIMOUS' },
      { gamertag: 'RIVALDO', club: 'EUPHORIC' },
      { gamertag: 'RONALD', club: 'MAXIMOUS' },
      { gamertag: 'rusel', club: 'GYMSHARK' },
      { gamertag: 'sheraid', club: 'MAXIMOUS' },
      { gamertag: 'sting', club: 'MAXIMOUS' },
      { gamertag: 'tazos', club: 'GYMSHARK' },
      { gamertag: 'tonsky', club: 'MAXIMOUS' },
      { gamertag: 'Vankless', club: 'SOUTHERN' },
      { gamertag: 'VBBOY', club: 'AVENUE' },
      { gamertag: 'VICKY', club: 'MAXIMOUS' },
      { gamertag: 'Vriskey_', club: 'EUPHORIC' },
      { gamertag: 'WHYSON', club: 'RESTART' },
      { gamertag: 'XIAOPEI', club: 'CROWN' },
      { gamertag: 'yay', club: 'MAXIMOUS' },
      { gamertag: 'ziafu', club: 'MYSTERY' },
      { gamertag: 'ZABYER', club: 'JASMINE' },
      { gamertag: 'zmz', club: 'ALQA' },
      { gamertag: 'ZORO', club: 'PARANOID' },
      { gamertag: 'zico', club: 'EUPHORIC' },
    ];

    // ======== FEMALE PLAYERS (all points = 0) ========
    const femaleData = [
      { gamertag: 'Afrona', club: 'SOUTHERN' },
      { gamertag: 'AiTan', club: 'PARANOID' },
      { gamertag: 'arcalya', club: 'SOUTHERN' },
      { gamertag: 'cami', club: 'MAXIMOUS' },
      { gamertag: 'cheeyaqq', club: 'SECRETS' },
      { gamertag: 'ciki_w', club: 'TOGETHER' },
      { gamertag: 'damncil', club: 'EUPHORIC' },
      { gamertag: 'dysa', club: 'RESTART' },
      { gamertag: 'Elvareca', club: 'EUPHORIC' },
      { gamertag: 'evony', club: 'GYMSHARK' },
      { gamertag: 'Eive', club: 'PSALM' },
      { gamertag: 'Indy', club: 'MAXIMOUS' },
      { gamertag: 'irazz', club: 'PARANOID' },
      { gamertag: 'kacee', club: 'MAXIMOUS' },
      { gamertag: 'Liz', club: 'SOUTHERN' },
      { gamertag: 'meatry', club: 'YAKUZA' },
      { gamertag: 'mishelle', club: 'PARANOID' },
      { gamertag: 'moy', club: 'YAKUZA' },
      { gamertag: 'reptil', club: 'SOUTHERN' },
      { gamertag: 's_melin', club: 'Plat R' },
      { gamertag: 'skylin', club: 'EUPHORIC' },
      { gamertag: 'Veronicc', club: 'PARANOID' },
      { gamertag: 'Vion', club: 'QUEEN' },
      { gamertag: 'weywey', club: 'RNB' },
      { gamertag: 'yaaay', club: 'YAKUZA' },
      { gamertag: 'yoonabi', club: 'PARANOID' },
    ];

    // Create players — all stats zeroed
    const malePlayers: Record<string, string> = {};
    for (const p of maleData) {
      const player = await db.player.create({
        data: {
          name: p.gamertag,
          gamertag: p.gamertag,
          division: 'male',
          tier: 'B',
          points: 0,
          totalWins: 0,
          totalMvp: 0,
          streak: 0,
          maxStreak: 0,
          matches: 0,
          isActive: true,
          city: '',
          registrationStatus: 'approved',
        },
      });
      malePlayers[p.gamertag] = player.id;
    }

    const femalePlayers: Record<string, string> = {};
    for (const p of femaleData) {
      const player = await db.player.create({
        data: {
          name: p.gamertag,
          gamertag: p.gamertag,
          division: 'female',
          tier: 'B',
          points: 0,
          totalWins: 0,
          totalMvp: 0,
          streak: 0,
          maxStreak: 0,
          matches: 0,
          isActive: true,
          city: '',
          registrationStatus: 'approved',
        },
      });
      femalePlayers[p.gamertag] = player.id;
    }

    // ======== CLUBS — all stats zeroed ========
    const maleClubNames = [...new Set(maleData.map(p => p.club))].sort((a, b) => a.localeCompare(b));
    const femaleClubNames = [...new Set(femaleData.map(p => p.club))].sort((a, b) => a.localeCompare(b));

    const maleClubs: Record<string, string> = {};
    for (const clubName of maleClubNames) {
      const club = await db.club.create({
        data: {
          name: clubName,
          division: 'male',
          seasonId: maleSeason.id,
          wins: 0,
          losses: 0,
          points: 0,
          gameDiff: 0,
        },
      });
      maleClubs[clubName] = club.id;
    }

    const femaleClubs: Record<string, string> = {};
    for (const clubName of femaleClubNames) {
      const club = await db.club.create({
        data: {
          name: clubName,
          division: 'female',
          seasonId: femaleSeason.id,
          wins: 0,
          losses: 0,
          points: 0,
          gameDiff: 0,
        },
      });
      femaleClubs[clubName] = club.id;
    }

    // ======== CLUB MEMBERSHIPS ========
    // Players are already sorted alphabetically in maleData/femaleData
    // First player in each club becomes captain
    const maleClubFirstPlayer: Record<string, boolean> = {};
    for (const p of maleData) {
      const isFirst = !maleClubFirstPlayer[p.club];
      maleClubFirstPlayer[p.club] = true;
      await db.clubMember.create({
        data: {
          clubId: maleClubs[p.club],
          playerId: malePlayers[p.gamertag],
          role: isFirst ? 'captain' : 'member',
        },
      });
    }

    const femaleClubFirstPlayer: Record<string, boolean> = {};
    for (const p of femaleData) {
      const isFirst = !femaleClubFirstPlayer[p.club];
      femaleClubFirstPlayer[p.club] = true;
      await db.clubMember.create({
        data: {
          clubId: femaleClubs[p.club],
          playerId: femalePlayers[p.gamertag],
          role: isFirst ? 'captain' : 'member',
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Database seeded with IDM League data (all points zeroed, sorted alphabetically)',
      stats: {
        malePlayers: maleData.length,
        femalePlayers: femaleData.length,
        maleClubs: maleClubNames.length,
        femaleClubs: femaleClubNames.length,
      },
    });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('Seed error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
