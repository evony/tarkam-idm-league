/**
 * Generate PostgreSQL seed SQL from local SQLite database.
 * Output can be pasted directly into Neon SQL Editor.
 */
import { db } from '../src/lib/db';

async function main() {
  console.log('-- ══════════════════════════════════════════════════');
  console.log('-- IDM LEAGUE — Production Seed Data for Neon PostgreSQL');
  console.log('-- Generated from local SQLite sandbox');
  console.log('-- ══════════════════════════════════════════════════');
  console.log();

  // 1. Seasons
  const seasons = await db.season.findMany({ orderBy: { number: 'asc' } });
  console.log('-- ── SEASONS ──');
  for (const s of seasons) {
    console.log(`INSERT INTO "Season" ("id", "name", "number", "division", "status", "startDate", "endDate", "championClubId", "championPlayerId", "championSquad", "createdAt", "updatedAt")`);
    console.log(`VALUES ('${s.id}', '${esc(s.name)}', ${s.number}, '${s.division}', '${s.status}', '${fmtDate(s.startDate)}', ${s.endDate ? `'${fmtDate(s.endDate)}'` : 'NULL'}, ${s.championClubId ? `'${s.championClubId}'` : 'NULL'}, ${s.championPlayerId ? `'${s.championPlayerId}'` : 'NULL'}, ${s.championSquad ? `'${esc(s.championSquad)}'` : 'NULL'}, '${fmtDate(s.createdAt)}', '${fmtDate(s.updatedAt)}')`);
    console.log(`ON CONFLICT ("id") DO NOTHING;`);
  }
  console.log();

  // 2. Club Profiles
  const profiles = await db.clubProfile.findMany({ orderBy: { name: 'asc' } });
  console.log('-- ── CLUB PROFILES ──');
  for (const p of profiles) {
    console.log(`INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")`);
    console.log(`VALUES ('${p.id}', '${esc(p.name)}', ${p.logo ? `'${esc(p.logo)}'` : 'NULL'}, ${p.bannerImage ? `'${esc(p.bannerImage)}'` : 'NULL'}, '${fmtDate(p.createdAt)}', '${fmtDate(p.updatedAt)}')`);
    console.log(`ON CONFLICT ("id") DO NOTHING;`);
  }
  console.log();

  // 3. Clubs (season entries)
  const clubs = await db.club.findMany({ orderBy: { points: 'desc' } });
  console.log('-- ── CLUBS (Season Entries) ──');
  for (const c of clubs) {
    console.log(`INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")`);
    console.log(`VALUES ('${c.id}', '${c.profileId}', '${c.division}', '${c.seasonId}', ${c.wins}, ${c.losses}, ${c.points}, ${c.gameDiff})`);
    console.log(`ON CONFLICT ("id") DO NOTHING;`);
  }
  console.log();

  // 4. Players
  const players = await db.player.findMany({ orderBy: { points: 'desc' } });
  console.log('-- ── PLAYERS ──');
  for (const p of players) {
    console.log(`INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")`);
    console.log(`VALUES ('${p.id}', '${esc(p.name)}', '${esc(p.gamertag)}', '${p.division}', '${p.tier}', ${p.avatar ? `'${esc(p.avatar)}'` : 'NULL'}, ${p.points}, ${p.totalWins}, ${p.totalMvp}, ${p.streak}, ${p.maxStreak}, ${p.matches}, ${p.isActive ? 'true' : 'false'}, ${p.phone ? `'${esc(p.phone)}'` : 'NULL'}, '${esc(p.city)}', ${p.joki ? `'${esc(p.joki)}'` : 'NULL'}, '${p.registrationStatus}', '${fmtDate(p.createdAt)}', '${fmtDate(p.updatedAt)}')`);
    console.log(`ON CONFLICT ("id") DO NOTHING;`);
  }
  console.log();

  // 5. Club Members
  const members = await db.clubMember.findMany();
  console.log('-- ── CLUB MEMBERS ──');
  for (const m of members) {
    console.log(`INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")`);
    console.log(`VALUES ('${m.id}', '${m.profileId}', '${m.playerId}', '${m.role}', '${fmtDate(m.joinedAt)}', ${m.leftAt ? `'${fmtDate(m.leftAt)}'` : 'NULL'})`);
    console.log(`ON CONFLICT ("id") DO NOTHING;`);
  }
  console.log();

  // 6. Tournaments
  const tournaments = await db.tournament.findMany({ orderBy: { weekNumber: 'asc' } });
  console.log('-- ── TOURNAMENTS ──');
  for (const t of tournaments) {
    console.log(`INSERT INTO "Tournament" ("id", "name", "weekNumber", "division", "status", "format", "defaultMatchFormat", "seasonId", "prizePool", "bpm", "location", "scheduledAt", "finalizedAt", "completedAt", "createdAt", "updatedAt")`);
    console.log(`VALUES ('${t.id}', '${esc(t.name)}', ${t.weekNumber}, '${t.division}', '${t.status}', '${t.format}', '${t.defaultMatchFormat}', '${t.seasonId}', ${t.prizePool}, ${t.bpm ? `'${esc(t.bpm)}'` : 'NULL'}, ${t.location ? `'${esc(t.location)}'` : 'NULL'}, ${t.scheduledAt ? `'${fmtDate(t.scheduledAt)}'` : 'NULL'}, ${t.finalizedAt ? `'${fmtDate(t.finalizedAt)}'` : 'NULL'}, ${t.completedAt ? `'${fmtDate(t.completedAt)}'` : 'NULL'}, '${fmtDate(t.createdAt)}', '${fmtDate(t.updatedAt)}')`);
    console.log(`ON CONFLICT ("id") DO NOTHING;`);
  }
  console.log();

  // 7. Admin
  const admins = await db.admin.findMany();
  console.log('-- ── ADMINS ──');
  for (const a of admins) {
    console.log(`INSERT INTO "Admin" ("id", "username", "passwordHash", "role", "createdAt", "updatedAt")`);
    console.log(`VALUES ('${a.id}', '${esc(a.username)}', '${esc(a.passwordHash)}', '${a.role}', '${fmtDate(a.createdAt)}', '${fmtDate(a.updatedAt)}')`);
    console.log(`ON CONFLICT ("id") DO NOTHING;`);
  }
  console.log();

  // 8. Skins
  const skins = await db.skin.findMany();
  console.log('-- ── SKINS ──');
  for (const s of skins) {
    console.log(`INSERT INTO "Skin" ("id", "type", "displayName", "description", "icon", "colorClass", "priority", "duration", "isActive", "createdAt", "updatedAt")`);
    console.log(`VALUES ('${s.id}', '${esc(s.type)}', '${esc(s.displayName)}', '${esc(s.description)}', '${esc(s.icon)}', '${esc(s.colorClass)}', ${s.priority}, '${esc(s.duration)}', ${s.isActive ? 'true' : 'false'}, '${fmtDate(s.createdAt)}', '${fmtDate(s.updatedAt)}')`);
    console.log(`ON CONFLICT ("id") DO NOTHING;`);
  }
  console.log();

  // 9. CMS Settings
  const settings = await db.cmsSetting.findMany();
  console.log('-- ── CMS SETTINGS ──');
  for (const s of settings) {
    console.log(`INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")`);
    console.log(`VALUES ('${s.id}', '${esc(s.key)}', '${esc(s.value)}', '${esc(s.type)}', '${fmtDate(s.updatedAt)}')`);
    console.log(`ON CONFLICT ("id") DO NOTHING;`);
  }
  console.log();

  // 10. CMS Sections
  const sections = await db.cmsSection.findMany({ orderBy: { order: 'asc' }, include: { cards: { orderBy: { order: 'asc' } } } });
  console.log('-- ── CMS SECTIONS & CARDS ──');
  for (const sec of sections) {
    console.log(`INSERT INTO "CmsSection" ("id", "slug", "title", "subtitle", "description", "bannerUrl", "isActive", "order", "createdAt", "updatedAt")`);
    console.log(`VALUES ('${sec.id}', '${esc(sec.slug)}', '${esc(sec.title)}', '${esc(sec.subtitle)}', '${esc(sec.description)}', ${sec.bannerUrl ? `'${esc(sec.bannerUrl)}'` : 'NULL'}, ${sec.isActive ? 'true' : 'false'}, ${sec.order}, '${fmtDate(sec.createdAt)}', '${fmtDate(sec.updatedAt)}')`);
    console.log(`ON CONFLICT ("id") DO NOTHING;`);
    for (const card of sec.cards) {
      console.log(`INSERT INTO "CmsCard" ("id", "sectionId", "title", "subtitle", "description", "imageUrl", "videoUrl", "linkUrl", "tag", "tagColor", "isActive", "order", "createdAt", "updatedAt")`);
      console.log(`VALUES ('${card.id}', '${card.sectionId}', '${esc(card.title)}', '${esc(card.subtitle)}', '${esc(card.description)}', ${card.imageUrl ? `'${esc(card.imageUrl)}'` : 'NULL'}, ${card.videoUrl ? `'${esc(card.videoUrl)}'` : 'NULL'}, ${card.linkUrl ? `'${esc(card.linkUrl)}'` : 'NULL'}, ${card.tag ? `'${esc(card.tag)}'` : 'NULL'}, ${card.tagColor ? `'${esc(card.tagColor)}'` : 'NULL'}, ${card.isActive ? 'true' : 'false'}, ${card.order}, '${fmtDate(card.createdAt)}', '${fmtDate(card.updatedAt)}')`);
      console.log(`ON CONFLICT ("id") DO NOTHING;`);
    }
  }
  console.log();

  console.log('-- ══════════════════════════════════════════════════');
  console.log('-- SEED COMPLETE');
  console.log('-- ══════════════════════════════════════════════════');

  await db.$disconnect();
}

function esc(s: string): string {
  return s.replace(/'/g, "''").replace(/\\/g, "\\\\");
}

function fmtDate(d: Date): string {
  return d.toISOString().replace('T', ' ').replace('Z', '+00:00');
}

main().catch(e => { console.error(e); process.exit(1); });
