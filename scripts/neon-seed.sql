-- ============================================================
-- IDM League - Neon PostgreSQL Seed Script
-- Generated from /src/app/api/setup/route.ts
-- ============================================================
-- HOW TO USE:
--   1. Open Neon Console → SQL Editor
--   2. Make sure Vercel has deployed (schema must be synced first!)
--   3. Paste this entire script and click Run
--   4. If errors about missing columns, wait for Vercel deploy to finish
-- ============================================================
-- Order matters: DELETE in reverse (child → parent), INSERT in forward (parent → child)
-- All inserts use ON CONFLICT ("id") DO NOTHING for idempotency
-- ============================================================

-- NOTE: If running in Neon SQL Editor, you may need to remove BEGIN/COMMIT
-- and run each section separately if the editor doesn't support transactions.

-- ============================================================
-- STEP 1: DELETE existing data (child → parent order)
-- ============================================================

DELETE FROM "PlayerAchievement";
DELETE FROM "PlayerPoint";
DELETE FROM "TeamPlayer";
DELETE FROM "Match";
DELETE FROM "Team";
DELETE FROM "Participation";
DELETE FROM "TournamentPrize";
DELETE FROM "Donation";
DELETE FROM "ClubMember";
DELETE FROM "LeagueMatch";
DELETE FROM "PlayoffMatch";
DELETE FROM "Club";
DELETE FROM "Tournament";
DELETE FROM "ClubProfile";
DELETE FROM "Player";
DELETE FROM "Season";
DELETE FROM "Admin";

-- ============================================================
-- STEP 2: INSERT Admin
-- ============================================================

INSERT INTO "Admin" ("id", "username", "passwordHash", "role", "createdAt", "updatedAt")
VALUES (
  'admin001super',
  'jose',
  '93b5e76fefae3e2fa162bc13da17dbbd:a57269dc42737360f697ba4d520d8e8098dab827a09425d6237d7932489f6bbb092f3d8e6c43b0d13e1d00848a64d0ec36b659ece315ee436595480fc3ef589d',
  'super_admin',
  '2025-01-06T00:00:00.000Z',
  '2025-01-06T00:00:00.000Z'
) ON CONFLICT ("id") DO NOTHING;

-- ============================================================
-- STEP 3: INSERT Seasons
-- ============================================================

INSERT INTO "Season" ("id", "name", "number", "division", "status", "startDate", "championClubId", "championPlayerId", "championSquad", "createdAt", "updatedAt")
VALUES (
  'season_male_s1',
  'IDM League Season 1 - Male',
  1,
  'male',
  'active',
  '2025-01-06T00:00:00.000Z',
  NULL, NULL, NULL,
  '2025-01-06T00:00:00.000Z',
  '2025-01-06T00:00:00.000Z'
) ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Season" ("id", "name", "number", "division", "status", "startDate", "championClubId", "championPlayerId", "championSquad", "createdAt", "updatedAt")
VALUES (
  'season_female_s1',
  'IDM League Season 1 - Female',
  1,
  'female',
  'completed',
  '2025-01-06T00:00:00.000Z',
  'clubprof_007',  -- MAXIMOUS profile
  NULL, NULL,
  '2025-01-06T00:00:00.000Z',
  '2025-01-06T00:00:00.000Z'
) ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Season" ("id", "name", "number", "division", "status", "startDate", "championClubId", "championPlayerId", "championSquad", "createdAt", "updatedAt")
VALUES (
  'season_female_s2',
  'Season 2 - Female',
  2,
  'female',
  'active',
  '2025-04-01T00:00:00.000Z',
  NULL, NULL, NULL,
  '2025-04-01T00:00:00.000Z',
  '2025-04-01T00:00:00.000Z'
) ON CONFLICT ("id") DO NOTHING;

-- ============================================================
-- STEP 4: INSERT Players (Male - 50 players)
-- ============================================================

INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "city", "registrationStatus", "createdAt", "updatedAt") VALUES
  ('player_male_001', 'AbdnZ', 'AbdnZ', 'male', 'B', 0, 0, 0, 0, 0, 0, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_002', 'afi', 'afi', 'male', 'B', 0, 0, 0, 0, 0, 0, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_003', 'Afroki', 'Afroki', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_004', 'Airuen', 'Airuen', 'male', 'B', 30, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_005', 'Armors', 'Armors', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_006', 'astro', 'astro', 'male', 'B', 30, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_007', 'Bambang', 'Bambang', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_008', 'Boby', 'Boby', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_009', 'CARAOSEL', 'CARAOSEL', 'male', 'B', 5, 0, 0, 0, 0, 1, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_010', 'cepz', 'cepz', 'male', 'B', 5, 0, 0, 0, 0, 1, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_011', 'chand', 'chand', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_012', 'chikoo', 'chikoo', 'male', 'B', 0, 0, 0, 0, 0, 0, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_013', 'Chrollo', 'Chrollo', 'male', 'B', 0, 0, 0, 0, 0, 0, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_014', 'DUUL', 'DUUL', 'male', 'A', 70, 3, 0, 0, 3, 5, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_015', 'Dylee', 'Dylee', 'male', 'B', 0, 0, 0, 0, 0, 0, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_016', 'Earth', 'Earth', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_017', 'fyy', 'fyy', 'male', 'B', 0, 0, 0, 0, 0, 0, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_018', 'Georgie', 'Georgie', 'male', 'B', 0, 0, 0, 0, 0, 0, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_019', 'ipinnn', 'ipinnn', 'male', 'B', 30, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_020', 'Jave', 'Jave', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_021', 'janskie', 'janskie', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_022', 'jugger', 'jugger', 'male', 'B', 50, 2, 1, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_023', 'justice', 'justice', 'male', 'B', 0, 0, 0, 0, 0, 0, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_024', 'Kageno', 'Kageno', 'male', 'B', 30, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_025', 'KIERAN', 'KIERAN', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_026', 'KIRA', 'KIRA', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_027', 'Life', 'Life', 'male', 'B', 15, 0, 0, 0, 0, 2, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_028', 'marimo', 'marimo', 'male', 'B', 30, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_029', 'montiel', 'montiel', 'male', 'A', 70, 3, 0, 0, 3, 5, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_030', 'Oura', 'Oura', 'male', 'B', 15, 0, 0, 0, 0, 2, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_031', 'Ren', 'Ren', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_032', 'RIVALDO', 'RIVALDO', 'male', 'B', 10, 0, 0, 0, 0, 1, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_033', 'RONALD', 'RONALD', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_034', 'rusel', 'rusel', 'male', 'B', 55, 2, 1, 2, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_035', 'sheraid', 'sheraid', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_036', 'sting', 'sting', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_037', 'tazos', 'tazos', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_038', 'tonsky', 'tonsky', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_039', 'Vankless', 'Vankless', 'male', 'B', 45, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_040', 'VBBOY', 'VBBOY', 'male', 'B', 30, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_041', 'VICKY', 'VICKY', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_042', 'Vriskey_', 'Vriskey_', 'male', 'B', 0, 0, 0, 0, 0, 0, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_043', 'WHYSON', 'WHYSON', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_044', 'XIAOPEI', 'XIAOPEI', 'male', 'B', 5, 0, 0, 0, 0, 1, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_045', 'yay', 'yay', 'male', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_046', 'ziafu', 'ziafu', 'male', 'B', 5, 0, 0, 0, 0, 1, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_047', 'ZABYER', 'ZABYER', 'male', 'B', 20, 0, 0, 0, 0, 2, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_048', 'zmz', 'zmz', 'male', 'B', 0, 0, 0, 0, 0, 0, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_049', 'ZORO', 'ZORO', 'male', 'A', 75, 3, 1, 3, 3, 5, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_male_050', 'zico', 'zico', 'male', 'B', 0, 0, 0, 0, 0, 0, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z')
ON CONFLICT ("id") DO NOTHING;

-- ============================================================
-- STEP 5: INSERT Players (Female - 26 players)
-- ============================================================

INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "city", "registrationStatus", "createdAt", "updatedAt") VALUES
  ('player_female_001', 'Afrona', 'Afrona', 'female', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_002', 'AiTan', 'AiTan', 'female', 'A', 70, 3, 0, 0, 3, 5, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_003', 'arcalya', 'arcalya', 'female', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_004', 'cami', 'cami', 'female', 'S', 135, 5, 2, 5, 5, 7, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_005', 'cheeyaqq', 'cheeyaqq', 'female', 'B', 30, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_006', 'ciki_w', 'ciki_w', 'female', 'B', 30, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_007', 'damncil', 'damncil', 'female', 'A', 70, 3, 0, 0, 3, 5, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_008', 'dysa', 'dysa', 'female', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_009', 'Elvareca', 'Elvareca', 'female', 'A', 85, 3, 1, 3, 3, 5, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_010', 'evony', 'evony', 'female', 'S', 95, 4, 1, 4, 4, 6, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_011', 'Eive', 'Eive', 'female', 'B', 35, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_012', 'Indy', 'Indy', 'female', 'S', 95, 4, 1, 4, 4, 6, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_013', 'irazz', 'irazz', 'female', 'A', 70, 3, 0, 0, 3, 5, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_014', 'kacee', 'kacee', 'female', 'S', 135, 5, 2, 5, 5, 7, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_015', 'Liz', 'Liz', 'female', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_016', 'meatry', 'meatry', 'female', 'B', 30, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_017', 'mishelle', 'mishelle', 'female', 'A', 70, 3, 0, 0, 3, 5, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_018', 'moy', 'moy', 'female', 'B', 30, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_019', 'reptil', 'reptil', 'female', 'B', 50, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_020', 's_melin', 's_melin', 'female', 'B', 35, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_021', 'skylin', 'skylin', 'female', 'B', 60, 2, 0, 0, 2, 4, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_022', 'Veronicc', 'Veronicc', 'female', 'A', 70, 3, 0, 0, 3, 5, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_023', 'Vion', 'Vion', 'female', 'S', 90, 4, 0, 4, 4, 6, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_024', 'weywey', 'weywey', 'female', 'B', 30, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_025', 'yaaay', 'yaaay', 'female', 'B', 30, 1, 0, 0, 1, 3, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('player_female_026', 'yoonabi', 'yoonabi', 'female', 'A', 70, 3, 0, 0, 3, 5, true, '', 'approved', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z')
ON CONFLICT ("id") DO NOTHING;

-- ============================================================
-- STEP 6: INSERT ClubProfiles (21 clubs, sorted by name)
-- ============================================================

INSERT INTO "ClubProfile" ("id", "name", "logo", "createdAt", "updatedAt") VALUES
  ('clubprof_001', 'ALQA',     'https://res.cloudinary.com/dagoryri5/image/upload/v1775722484/idm/logos/xm73kzny0klrncflhxfj.jpg',   '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_002', 'AVENUE',   'https://res.cloudinary.com/dagoryri5/image/upload/v1775722508/idm/logos/j8zw91uiulijp8gf8ugg.webp', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_003', 'CROWN',    'https://res.cloudinary.com/dagoryri5/image/upload/v1775722530/idm/logos/o1ujmjazgv1nxdpjzkew.webp', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_004', 'EUPHORIC', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722372/idm/logos/cdstmpd99aetv3xvbwu0.webp', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_005', 'GYMSHARK', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839600/idm/logos/fymwsgztdv0egvjite2o.webp', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_006', 'JASMINE',  'https://res.cloudinary.com/dagoryri5/image/upload/v1775714050/logo_nvzi1a.png',                   '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_007', 'MAXIMOUS', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722447/idm/logos/ewl70fqyehvdhefxq76h.webp', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_008', 'MYSTERY',  'https://res.cloudinary.com/dagoryri5/image/upload/v1775714050/logo_nvzi1a.png',                   '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_009', 'ORPHIC',   'https://res.cloudinary.com/dagoryri5/image/upload/v1775992653/logo1_tzieua.png',                   '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_010', 'PARANOID', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722406/idm/logos/iwd3khpecy8yo1mx94js.webp', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_011', 'Plat R',   'https://res.cloudinary.com/dagoryri5/image/upload/v1775748244/idm/logos/aydxk3fnrdkcmqh48aoi.jpg',  '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_012', 'PSALM',    'https://res.cloudinary.com/dagoryri5/image/upload/v1775722357/idm/logos/agyc2zkbafrvf1kjrc0b.jpg',   '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_013', 'QUEEN',    'https://res.cloudinary.com/dagoryri5/image/upload/v1775839657/idm/logos/gzfny3tfdkxircyyxaxu.jpg',   '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_014', 'RESTART',  'https://res.cloudinary.com/dagoryri5/image/upload/v1775722457/idm/logos/kdtgjq5sdecmfjtflude.jpg',   '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_015', 'RNB',      'https://res.cloudinary.com/dagoryri5/image/upload/v1775722517/idm/logos/migrego3avfcr0pganyq.jpg',   '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_016', 'SALVADOR', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722472/idm/logos/zxikdnl6ycqx4hkfmpwi.jpg',   '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_017', 'SECRETS',  'https://res.cloudinary.com/dagoryri5/image/upload/v1775722381/idm/logos/shcq5q4air1xkpqnz1hi.jpg',   '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_018', 'SENSEI',   'https://res.cloudinary.com/dagoryri5/image/upload/v1775714050/logo_nvzi1a.png',                   '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_019', 'SOUTHERN', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839645/idm/logos/upuq4u9bccaihdnh6llb.jpg',   '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_020', 'TOGETHER', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722484/idm/logos/xm73kzny0klrncflhxfj.jpg',   '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z'),
  ('clubprof_021', 'YAKUZA',   'https://res.cloudinary.com/dagoryri5/image/upload/v1775722530/idm/logos/o1ujmjazgv1nxdpjzkew.webp', '2025-01-06T00:00:00.000Z', '2025-01-06T00:00:00.000Z')
ON CONFLICT ("id") DO NOTHING;

-- ============================================================
-- STEP 7: INSERT Clubs — Male Season 1 (15 clubs, sorted)
-- ============================================================

INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff") VALUES
  ('club_male_001', 'clubprof_001', 'male', 'season_male_s1',  0, 0, 0, 0),  -- ALQA
  ('club_male_002', 'clubprof_002', 'male', 'season_male_s1',  0, 0, 0, 0),  -- AVENUE
  ('club_male_003', 'clubprof_003', 'male', 'season_male_s1',  0, 0, 0, 0),  -- CROWN
  ('club_male_004', 'clubprof_004', 'male', 'season_male_s1',  0, 0, 0, 0),  -- EUPHORIC
  ('club_male_005', 'clubprof_005', 'male', 'season_male_s1',  0, 0, 0, 0),  -- GYMSHARK
  ('club_male_006', 'clubprof_006', 'male', 'season_male_s1',  0, 0, 0, 0),  -- JASMINE
  ('club_male_007', 'clubprof_007', 'male', 'season_male_s1',  0, 0, 0, 0),  -- MAXIMOUS
  ('club_male_008', 'clubprof_008', 'male', 'season_male_s1',  0, 0, 0, 0),  -- MYSTERY
  ('club_male_009', 'clubprof_009', 'male', 'season_male_s1',  0, 0, 0, 0),  -- ORPHIC
  ('club_male_010', 'clubprof_010', 'male', 'season_male_s1',  0, 0, 0, 0),  -- PARANOID
  ('club_male_011', 'clubprof_014', 'male', 'season_male_s1',  0, 0, 0, 0),  -- RESTART
  ('club_male_012', 'clubprof_016', 'male', 'season_male_s1',  0, 0, 0, 0),  -- SALVADOR
  ('club_male_013', 'clubprof_017', 'male', 'season_male_s1',  0, 0, 0, 0),  -- SECRETS
  ('club_male_014', 'clubprof_018', 'male', 'season_male_s1',  0, 0, 0, 0),  -- SENSEI
  ('club_male_015', 'clubprof_019', 'male', 'season_male_s1',  0, 0, 0, 0)   -- SOUTHERN
ON CONFLICT ("id") DO NOTHING;

-- ============================================================
-- STEP 8: INSERT Clubs — Female Season 1 (13 clubs, sorted)
-- ============================================================

INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff") VALUES
  ('club_female_001', 'clubprof_004', 'female', 'season_female_s1',  0, 0, 0, 0),  -- EUPHORIC
  ('club_female_002', 'clubprof_005', 'female', 'season_female_s1',  0, 0, 0, 0),  -- GYMSHARK
  ('club_female_003', 'clubprof_007', 'female', 'season_female_s1',  0, 0, 0, 0),  -- MAXIMOUS
  ('club_female_004', 'clubprof_010', 'female', 'season_female_s1',  0, 0, 0, 0),  -- PARANOID
  ('club_female_005', 'clubprof_011', 'female', 'season_female_s1',  0, 0, 0, 0),  -- Plat R
  ('club_female_006', 'clubprof_012', 'female', 'season_female_s1',  0, 0, 0, 0),  -- PSALM
  ('club_female_007', 'clubprof_013', 'female', 'season_female_s1',  0, 0, 0, 0),  -- QUEEN
  ('club_female_008', 'clubprof_014', 'female', 'season_female_s1',  0, 0, 0, 0),  -- RESTART
  ('club_female_009', 'clubprof_015', 'female', 'season_female_s1',  0, 0, 0, 0),  -- RNB
  ('club_female_010', 'clubprof_017', 'female', 'season_female_s1',  0, 0, 0, 0),  -- SECRETS
  ('club_female_011', 'clubprof_019', 'female', 'season_female_s1',  0, 0, 0, 0),  -- SOUTHERN
  ('club_female_012', 'clubprof_020', 'female', 'season_female_s1',  0, 0, 0, 0),  -- TOGETHER
  ('club_female_013', 'clubprof_021', 'female', 'season_female_s1',  0, 0, 0, 0)   -- YAKUZA
ON CONFLICT ("id") DO NOTHING;

-- ============================================================
-- STEP 9: INSERT Clubs — Female Season 2 (13 clubs, sorted)
-- ============================================================

INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff") VALUES
  ('club_f2_001', 'clubprof_004', 'female', 'season_female_s2',  0, 0, 0, 0),  -- EUPHORIC
  ('club_f2_002', 'clubprof_005', 'female', 'season_female_s2',  0, 0, 0, 0),  -- GYMSHARK
  ('club_f2_003', 'clubprof_007', 'female', 'season_female_s2',  0, 0, 0, 0),  -- MAXIMOUS
  ('club_f2_004', 'clubprof_010', 'female', 'season_female_s2',  0, 0, 0, 0),  -- PARANOID
  ('club_f2_005', 'clubprof_011', 'female', 'season_female_s2',  0, 0, 0, 0),  -- Plat R
  ('club_f2_006', 'clubprof_012', 'female', 'season_female_s2',  0, 0, 0, 0),  -- PSALM
  ('club_f2_007', 'clubprof_013', 'female', 'season_female_s2',  0, 0, 0, 0),  -- QUEEN
  ('club_f2_008', 'clubprof_014', 'female', 'season_female_s2',  0, 0, 0, 0),  -- RESTART
  ('club_f2_009', 'clubprof_015', 'female', 'season_female_s2',  0, 0, 0, 0),  -- RNB
  ('club_f2_010', 'clubprof_017', 'female', 'season_female_s2',  0, 0, 0, 0),  -- SECRETS
  ('club_f2_011', 'clubprof_019', 'female', 'season_female_s2',  0, 0, 0, 0),  -- SOUTHERN
  ('club_f2_012', 'clubprof_020', 'female', 'season_female_s2',  0, 0, 0, 0),  -- TOGETHER
  ('club_f2_013', 'clubprof_021', 'female', 'season_female_s2',  0, 0, 0, 0)   -- YAKUZA
ON CONFLICT ("id") DO NOTHING;

-- ============================================================
-- STEP 10: INSERT ClubMembers — Male players (50 members)
-- First player in each club is captain, rest are members
-- ============================================================

INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  -- MAXIMOUS (clubprof_007) — captain: AbdnZ
  ('cm_001', 'clubprof_007', 'player_male_001', 'captain', '2025-01-06T00:00:00.000Z'),
  ('cm_002', 'clubprof_007', 'player_male_002', 'member',  '2025-01-06T00:00:00.000Z'),
  -- SOUTHERN (clubprof_019) — captain: Afroki
  ('cm_003', 'clubprof_019', 'player_male_003', 'captain', '2025-01-06T00:00:00.000Z'),
  -- AVENUE (clubprof_002) — captain: Airuen
  ('cm_004', 'clubprof_002', 'player_male_004', 'captain', '2025-01-06T00:00:00.000Z'),
  -- SOUTHERN continued
  ('cm_005', 'clubprof_019', 'player_male_005', 'member',  '2025-01-06T00:00:00.000Z'),
  -- MAXIMOUS continued
  ('cm_006', 'clubprof_007', 'player_male_006', 'member',  '2025-01-06T00:00:00.000Z'),
  ('cm_007', 'clubprof_007', 'player_male_007', 'member',  '2025-01-06T00:00:00.000Z'),
  ('cm_008', 'clubprof_007', 'player_male_008', 'member',  '2025-01-06T00:00:00.000Z'),
  -- ORPHIC (clubprof_009) — captain: CARAOSEL
  ('cm_009', 'clubprof_009', 'player_male_009', 'captain', '2025-01-06T00:00:00.000Z'),
  -- SALVADOR (clubprof_016) — captain: cepz
  ('cm_010', 'clubprof_016', 'player_male_010', 'captain', '2025-01-06T00:00:00.000Z'),
  -- MAXIMOUS continued
  ('cm_011', 'clubprof_007', 'player_male_011', 'member',  '2025-01-06T00:00:00.000Z'),
  -- SENSEI (clubprof_018) — captain: chikoo
  ('cm_012', 'clubprof_018', 'player_male_012', 'captain', '2025-01-06T00:00:00.000Z'),
  -- EUPHORIC (clubprof_004) — captain: Chrollo
  ('cm_013', 'clubprof_004', 'player_male_013', 'captain', '2025-01-06T00:00:00.000Z'),
  -- PARANOID (clubprof_010) — captain: DUUL
  ('cm_014', 'clubprof_010', 'player_male_014', 'captain', '2025-01-06T00:00:00.000Z'),
  -- SENSEI continued
  ('cm_015', 'clubprof_018', 'player_male_015', 'member',  '2025-01-06T00:00:00.000Z'),
  -- MAXIMOUS continued
  ('cm_016', 'clubprof_007', 'player_male_016', 'member',  '2025-01-06T00:00:00.000Z'),
  -- GYMSHARK (clubprof_005) — captain: fyy
  ('cm_017', 'clubprof_005', 'player_male_017', 'captain', '2025-01-06T00:00:00.000Z'),
  -- ALQA (clubprof_001) — captain: Georgie
  ('cm_018', 'clubprof_001', 'player_male_018', 'captain', '2025-01-06T00:00:00.000Z'),
  -- GYMSHARK continued
  ('cm_019', 'clubprof_005', 'player_male_019', 'member',  '2025-01-06T00:00:00.000Z'),
  -- RESTART (clubprof_014) — captain: Jave
  ('cm_020', 'clubprof_014', 'player_male_020', 'captain', '2025-01-06T00:00:00.000Z'),
  -- SOUTHERN continued
  ('cm_021', 'clubprof_019', 'player_male_021', 'member',  '2025-01-06T00:00:00.000Z'),
  -- GYMSHARK continued
  ('cm_022', 'clubprof_005', 'player_male_022', 'member',  '2025-01-06T00:00:00.000Z'),
  -- EUPHORIC continued
  ('cm_023', 'clubprof_004', 'player_male_023', 'member',  '2025-01-06T00:00:00.000Z'),
  -- AVENUE continued
  ('cm_024', 'clubprof_002', 'player_male_024', 'member',  '2025-01-06T00:00:00.000Z'),
  -- MAXIMOUS continued
  ('cm_025', 'clubprof_007', 'player_male_025', 'member',  '2025-01-06T00:00:00.000Z'),
  -- SOUTHERN continued
  ('cm_026', 'clubprof_019', 'player_male_026', 'member',  '2025-01-06T00:00:00.000Z'),
  -- SALVADOR continued
  ('cm_027', 'clubprof_016', 'player_male_027', 'member',  '2025-01-06T00:00:00.000Z'),
  -- SECRETS (clubprof_017) — captain: marimo
  ('cm_028', 'clubprof_017', 'player_male_028', 'captain', '2025-01-06T00:00:00.000Z'),
  -- PARANOID continued
  ('cm_029', 'clubprof_010', 'player_male_029', 'member',  '2025-01-06T00:00:00.000Z'),
  -- SALVADOR continued
  ('cm_030', 'clubprof_016', 'player_male_030', 'member',  '2025-01-06T00:00:00.000Z'),
  -- MAXIMOUS continued
  ('cm_031', 'clubprof_007', 'player_male_031', 'member',  '2025-01-06T00:00:00.000Z'),
  -- EUPHORIC continued
  ('cm_032', 'clubprof_004', 'player_male_032', 'member',  '2025-01-06T00:00:00.000Z'),
  -- MAXIMOUS continued
  ('cm_033', 'clubprof_007', 'player_male_033', 'member',  '2025-01-06T00:00:00.000Z'),
  -- GYMSHARK continued
  ('cm_034', 'clubprof_005', 'player_male_034', 'member',  '2025-01-06T00:00:00.000Z'),
  -- MAXIMOUS continued
  ('cm_035', 'clubprof_007', 'player_male_035', 'member',  '2025-01-06T00:00:00.000Z'),
  ('cm_036', 'clubprof_007', 'player_male_036', 'member',  '2025-01-06T00:00:00.000Z'),
  -- GYMSHARK continued
  ('cm_037', 'clubprof_005', 'player_male_037', 'member',  '2025-01-06T00:00:00.000Z'),
  -- MAXIMOUS continued
  ('cm_038', 'clubprof_007', 'player_male_038', 'member',  '2025-01-06T00:00:00.000Z'),
  -- SOUTHERN continued
  ('cm_039', 'clubprof_019', 'player_male_039', 'member',  '2025-01-06T00:00:00.000Z'),
  -- AVENUE continued
  ('cm_040', 'clubprof_002', 'player_male_040', 'member',  '2025-01-06T00:00:00.000Z'),
  -- MAXIMOUS continued
  ('cm_041', 'clubprof_007', 'player_male_041', 'member',  '2025-01-06T00:00:00.000Z'),
  -- EUPHORIC continued
  ('cm_042', 'clubprof_004', 'player_male_042', 'member',  '2025-01-06T00:00:00.000Z'),
  -- RESTART continued
  ('cm_043', 'clubprof_014', 'player_male_043', 'member',  '2025-01-06T00:00:00.000Z'),
  -- CROWN (clubprof_003) — captain: XIAOPEI
  ('cm_044', 'clubprof_003', 'player_male_044', 'captain', '2025-01-06T00:00:00.000Z'),
  -- MAXIMOUS continued
  ('cm_045', 'clubprof_007', 'player_male_045', 'member',  '2025-01-06T00:00:00.000Z'),
  -- MYSTERY (clubprof_008) — captain: ziafu
  ('cm_046', 'clubprof_008', 'player_male_046', 'captain', '2025-01-06T00:00:00.000Z'),
  -- JASMINE (clubprof_006) — captain: ZABYER
  ('cm_047', 'clubprof_006', 'player_male_047', 'captain', '2025-01-06T00:00:00.000Z'),
  -- ALQA continued
  ('cm_048', 'clubprof_001', 'player_male_048', 'member',  '2025-01-06T00:00:00.000Z'),
  -- PARANOID continued
  ('cm_049', 'clubprof_010', 'player_male_049', 'member',  '2025-01-06T00:00:00.000Z'),
  -- EUPHORIC continued
  ('cm_050', 'clubprof_004', 'player_male_050', 'member',  '2025-01-06T00:00:00.000Z')
ON CONFLICT ("id") DO NOTHING;

-- ============================================================
-- STEP 11: INSERT ClubMembers — Female players (26 members)
-- First player in each club is captain, rest are members
-- ============================================================

INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  -- SOUTHERN (clubprof_019) — captain: Afrona (first female in SOUTHERN)
  ('cm_051', 'clubprof_019', 'player_female_001', 'captain', '2025-01-06T00:00:00.000Z'),
  -- PARANOID (clubprof_010) — captain: AiTan (first female in PARANOID)
  ('cm_052', 'clubprof_010', 'player_female_002', 'captain', '2025-01-06T00:00:00.000Z'),
  -- SOUTHERN continued
  ('cm_053', 'clubprof_019', 'player_female_003', 'member',  '2025-01-06T00:00:00.000Z'),
  -- MAXIMOUS (clubprof_007) — captain: cami (first female in MAXIMOUS)
  ('cm_054', 'clubprof_007', 'player_female_004', 'captain', '2025-01-06T00:00:00.000Z'),
  -- SECRETS (clubprof_017) — captain: cheeyaqq (first female in SECRETS)
  ('cm_055', 'clubprof_017', 'player_female_005', 'captain', '2025-01-06T00:00:00.000Z'),
  -- TOGETHER (clubprof_020) — captain: ciki_w
  ('cm_056', 'clubprof_020', 'player_female_006', 'captain', '2025-01-06T00:00:00.000Z'),
  -- EUPHORIC (clubprof_004) — captain: damncil (first female in EUPHORIC)
  ('cm_057', 'clubprof_004', 'player_female_007', 'captain', '2025-01-06T00:00:00.000Z'),
  -- RESTART (clubprof_014) — captain: dysa (first female in RESTART)
  ('cm_058', 'clubprof_014', 'player_female_008', 'captain', '2025-01-06T00:00:00.000Z'),
  -- EUPHORIC continued
  ('cm_059', 'clubprof_004', 'player_female_009', 'member',  '2025-01-06T00:00:00.000Z'),
  -- GYMSHARK (clubprof_005) — captain: evony (first female in GYMSHARK)
  ('cm_060', 'clubprof_005', 'player_female_010', 'captain', '2025-01-06T00:00:00.000Z'),
  -- PSALM (clubprof_012) — captain: Eive
  ('cm_061', 'clubprof_012', 'player_female_011', 'captain', '2025-01-06T00:00:00.000Z'),
  -- MAXIMOUS continued
  ('cm_062', 'clubprof_007', 'player_female_012', 'member',  '2025-01-06T00:00:00.000Z'),
  -- PARANOID continued
  ('cm_063', 'clubprof_010', 'player_female_013', 'member',  '2025-01-06T00:00:00.000Z'),
  -- MAXIMOUS continued
  ('cm_064', 'clubprof_007', 'player_female_014', 'member',  '2025-01-06T00:00:00.000Z'),
  -- SOUTHERN continued
  ('cm_065', 'clubprof_019', 'player_female_015', 'member',  '2025-01-06T00:00:00.000Z'),
  -- YAKUZA (clubprof_021) — captain: meatry
  ('cm_066', 'clubprof_021', 'player_female_016', 'captain', '2025-01-06T00:00:00.000Z'),
  -- PARANOID continued
  ('cm_067', 'clubprof_010', 'player_female_017', 'member',  '2025-01-06T00:00:00.000Z'),
  -- YAKUZA continued
  ('cm_068', 'clubprof_021', 'player_female_018', 'member',  '2025-01-06T00:00:00.000Z'),
  -- SOUTHERN continued
  ('cm_069', 'clubprof_019', 'player_female_019', 'member',  '2025-01-06T00:00:00.000Z'),
  -- Plat R (clubprof_011) — captain: s_melin
  ('cm_070', 'clubprof_011', 'player_female_020', 'captain', '2025-01-06T00:00:00.000Z'),
  -- EUPHORIC continued
  ('cm_071', 'clubprof_004', 'player_female_021', 'member',  '2025-01-06T00:00:00.000Z'),
  -- PARANOID continued
  ('cm_072', 'clubprof_010', 'player_female_022', 'member',  '2025-01-06T00:00:00.000Z'),
  -- QUEEN (clubprof_013) — captain: Vion
  ('cm_073', 'clubprof_013', 'player_female_023', 'captain', '2025-01-06T00:00:00.000Z'),
  -- RNB (clubprof_015) — captain: weywey
  ('cm_074', 'clubprof_015', 'player_female_024', 'captain', '2025-01-06T00:00:00.000Z'),
  -- YAKUZA continued
  ('cm_075', 'clubprof_021', 'player_female_025', 'member',  '2025-01-06T00:00:00.000Z'),
  -- PARANOID continued
  ('cm_076', 'clubprof_010', 'player_female_026', 'member',  '2025-01-06T00:00:00.000Z')
ON CONFLICT ("id") DO NOTHING;

-- ============================================================
-- SEED COMPLETE
-- Summary:
--   1 Admin (super_admin: jose / tazevsta)
--   3 Seasons (male S1 active, female S1 completed, female S2 active)
--   50 Male players
--   26 Female players
--   21 Club profiles (with Cloudinary logos)
--   15 Male clubs (S1)
--   13 Female clubs (S1)
--   13 Female clubs (S2)
--   76 Club members (50 male + 26 female)
-- ============================================================
