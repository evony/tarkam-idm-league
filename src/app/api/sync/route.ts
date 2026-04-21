import { db } from '@/lib/db';
import { withDbRetry } from '@/lib/db-resilience';
import { NextResponse } from 'next/server';

/**
 * POST /api/sync
 *
 * One-time sync endpoint to push data from local SQLite to Neon PostgreSQL.
 * Syncs: club logos, player avatars, season champion data.
 *
 * After calling this, all logo/avatar data will be in the production database.
 * Future uploads via admin panel will save directly to Neon — no more sync needed.
 *
 * Body format (optional — uses built-in defaults if not provided):
 * {
 *   "clubLogos": [{ "name": "MAXIMOUS", "division": "male", "logo": "https://..." }],
 *   "playerAvatars": [{ "gamertag": "Bambang", "avatar": "https://..." }],
 *   "seasonChampions": [{ "seasonName": "...", "championClubName": "MAXIMOUS" }]
 * }
 */
export async function POST(request: Request) {
  try {
    let body: {
      clubLogos?: Array<{ name: string; division?: string; logo: string }>;
      playerAvatars?: Array<{ gamertag: string; avatar: string }>;
      seasonChampions?: Array<{ seasonName: string; championClubName: string }>;
    } = {};

    try {
      body = await request.json();
    } catch {
      // No body — use defaults
    }

    const results = {
      clubLogos: { total: 0, updated: 0, details: [] as Array<{ name: string; division: string; count: number }> },
      playerAvatars: { total: 0, updated: 0, details: [] as Array<{ gamertag: string; count: number }> },
      seasonChampions: { total: 0, updated: 0, details: [] as Array<{ seasonName: string; success: boolean }> },
    };

    // ── 1. Sync Club Logos ──
    const clubLogos = body.clubLogos?.length ? body.clubLogos : getDefaultClubLogos();
    results.clubLogos.total = clubLogos.length;

    for (const clubData of clubLogos) {
      const where: { name: string; division?: string } = { name: clubData.name };
      if (clubData.division) {
        where.division = clubData.division;
      }

      const result = await withDbRetry(() => db.club.updateMany({
        where,
        data: { logo: clubData.logo },
      }));

      results.clubLogos.details.push({
        name: clubData.name,
        division: clubData.division || 'all',
        count: result.count,
      });
      if (result.count > 0) results.clubLogos.updated++;
    }

    // ── 2. Sync Player Avatars ──
    const playerAvatars = body.playerAvatars?.length ? body.playerAvatars : getDefaultPlayerAvatars();
    results.playerAvatars.total = playerAvatars.length;

    for (const playerData of playerAvatars) {
      const result = await withDbRetry(() => db.player.updateMany({
        where: { gamertag: playerData.gamertag },
        data: { avatar: playerData.avatar },
      }));

      results.playerAvatars.details.push({
        gamertag: playerData.gamertag,
        count: result.count,
      });
      if (result.count > 0) results.playerAvatars.updated++;
    }

    // ── 3. Sync Season Champion Club ──
    const seasonChampions = body.seasonChampions?.length ? body.seasonChampions : getDefaultSeasonChampions();
    results.seasonChampions.total = seasonChampions.length;

    for (const champData of seasonChampions) {
      // Find the champion club by name
      const championClub = await withDbRetry(() => db.club.findFirst({
        where: { name: champData.championClubName },
        select: { id: true },
      }));

      if (championClub) {
        const result = await withDbRetry(() => db.season.updateMany({
          where: { name: champData.seasonName },
          data: { championClubId: championClub.id },
        }));
        results.seasonChampions.details.push({
          seasonName: champData.seasonName,
          success: result.count > 0,
        });
        if (result.count > 0) results.seasonChampions.updated++;
      } else {
        results.seasonChampions.details.push({
          seasonName: champData.seasonName,
          success: false,
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sync completed',
      results,
    });
  } catch (e: unknown) {
    const error = e as Error;
    console.error('[/api/sync] Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

function getDefaultClubLogos(): Array<{ name: string; division: string; logo: string }> {
  return [
    { name: 'ALQA', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722484/idm/logos/xm73kzny0klrncflhxfj.jpg' },
    { name: 'AVENUE', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722508/idm/logos/j8zw91uiulijp8gf8ugg.webp' },
    { name: 'CROWN', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722530/idm/logos/o1ujmjazgv1nxdpjzkew.webp' },
    { name: 'EUPHORIC', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722372/idm/logos/cdstmpd99aetv3xvbwu0.webp' },
    { name: 'EUPHORIC', division: 'female', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722372/idm/logos/cdstmpd99aetv3xvbwu0.webp' },
    { name: 'GYMSHARK', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839600/idm/logos/fymwsgztdv0egvjite2o.webp' },
    { name: 'GYMSHARK', division: 'female', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839600/idm/logos/fymwsgztdv0egvjite2o.webp' },
    { name: 'JASMINE', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722472/idm/logos/zxikdnl6ycqx4hkfmpwi.jpg' },
    { name: 'MAXIMOUS', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722381/idm/logos/shcq5q4air1xkpqnz1hi.jpg' },
    { name: 'MAXIMOUS', division: 'female', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722447/idm/logos/ewl70fqyehvdhefxq76h.webp' },
    { name: 'MYSTERY', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722423/idm/logos/gdvdqo4ul8filhyv2zrz.jpg' },
    { name: 'ORPHIC', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722393/idm/logos/d1jroavrbfs7uwm8mx0t.jpg' },
    { name: 'PARANOID', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722406/idm/logos/iwd3khpecy8yo1mx94js.webp' },
    { name: 'PARANOID', division: 'female', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722406/idm/logos/iwd3khpecy8yo1mx94js.webp' },
    { name: 'Plat R', division: 'female', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775748244/idm/logos/aydxk3fnrdkcmqh48aoi.jpg' },
    { name: 'PSALM', division: 'female', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722357/idm/logos/agyc2zkbafrvf1kjrc0b.jpg' },
    { name: 'QUEEN', division: 'female', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839657/idm/logos/gzfny3tfdkxircyyxaxu.jpg' },
    { name: 'RESTART', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722457/idm/logos/kdtgjq5sdecmfjtflude.jpg' },
    { name: 'RESTART', division: 'female', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722457/idm/logos/kdtgjq5sdecmfjtflude.jpg' },
    { name: 'RNB', division: 'female', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722517/idm/logos/migrego3avfcr0pganyq.jpg' },
    { name: 'SALVADOR', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722437/idm/logos/ofcqjompuuqcmmqfoziu.webp' },
    { name: 'SECRETS', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722381/idm/logos/shcq5q4air1xkpqnz1hi.jpg' },
    { name: 'SECRETS', division: 'female', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722381/idm/logos/shcq5q4air1xkpqnz1hi.jpg' },
    { name: 'SENSEI', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839508/idm/logos/r41d6jqucjorjnh1scro.jpg' },
    { name: 'SOUTHERN', division: 'male', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839645/idm/logos/upuq4u9bccaihdnh6llb.jpg' },
    { name: 'SOUTHERN', division: 'female', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839645/idm/logos/upuq4u9bccaihdnh6llb.jpg' },
    { name: 'TOGETHER', division: 'female', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722484/idm/logos/xm73kzny0klrncflhxfj.jpg' },
    { name: 'YAKUZA', division: 'female', logo: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722530/idm/logos/o1ujmjazgv1nxdpjzkew.webp' },
  ];
}

function getDefaultPlayerAvatars(): Array<{ gamertag: string; avatar: string }> {
  return [
    { gamertag: 'Bambang', avatar: 'https://res.cloudinary.com/dagoryri5/image/upload/v1775739753/idm/avatars/h5u2udboaznqgs3yw8f2.webp' },
  ];
}

function getDefaultSeasonChampions(): Array<{ seasonName: string; championClubName: string }> {
  return [
    { seasonName: 'IDM League Season 1 - Male', championClubName: 'MAXIMOUS' },
  ];
}
