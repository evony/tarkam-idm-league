-- ============================================================
-- RESET PART 3: ADD FK + INSERT ADMIN, SEASONS, PLAYERS
-- Jalankan KETIGA (setelah Part 2 berhasil)
-- SEMUA STATS = 0 (fresh start)
-- ============================================================

-- ======== FOREIGN KEYS ========
ALTER TABLE "Season" ADD CONSTRAINT "Season_championClubId_fkey" FOREIGN KEY ("championClubId") REFERENCES "ClubProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Season" ADD CONSTRAINT "Season_championPlayerId_fkey" FOREIGN KEY ("championPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Club" ADD CONSTRAINT "Club_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ClubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Club" ADD CONSTRAINT "Club_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ClubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamPlayer" ADD CONSTRAINT "TeamPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamPlayer" ADD CONSTRAINT "TeamPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_mvpPlayerId_fkey" FOREIGN KEY ("mvpPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TournamentPrize" ADD CONSTRAINT "TournamentPrize_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Account" ADD CONSTRAINT "Account_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerSkin" ADD CONSTRAINT "PlayerSkin_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerSkin" ADD CONSTRAINT "PlayerSkin_skinId_fkey" FOREIGN KEY ("skinId") REFERENCES "Skin"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeagueMatch" ADD CONSTRAINT "LeagueMatch_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeagueMatch" ADD CONSTRAINT "LeagueMatch_club1Id_fkey" FOREIGN KEY ("club1Id") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeagueMatch" ADD CONSTRAINT "LeagueMatch_club2Id_fkey" FOREIGN KEY ("club2Id") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayoffMatch" ADD CONSTRAINT "PlayoffMatch_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayoffMatch" ADD CONSTRAINT "PlayoffMatch_club1Id_fkey" FOREIGN KEY ("club1Id") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayoffMatch" ADD CONSTRAINT "PlayoffMatch_club2Id_fkey" FOREIGN KEY ("club2Id") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CmsCard" ADD CONSTRAINT "CmsCard_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "CmsSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerPoint" ADD CONSTRAINT "PlayerPoint_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerPoint" ADD CONSTRAINT "PlayerPoint_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlayerPoint" ADD CONSTRAINT "PlayerPoint_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlayerAchievement" ADD CONSTRAINT "PlayerAchievement_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerAchievement" ADD CONSTRAINT "PlayerAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerAchievement" ADD CONSTRAINT "PlayerAchievement_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TournamentSponsor" ADD CONSTRAINT "TournamentSponsor_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TournamentSponsor" ADD CONSTRAINT "TournamentSponsor_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SponsoredPrize" ADD CONSTRAINT "SponsoredPrize_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SponsoredPrize" ADD CONSTRAINT "SponsoredPrize_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SponsorBanner" ADD CONSTRAINT "SponsorBanner_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ======== ADMIN TIDAK DI-INSERT DI SINI ========
-- Setelah jalankan semua 4 script, panggil POST /api/setup
-- Endpoint itu akan bikin admin dengan password hash yang benar (scrypt)
-- Login: username = jose (atau env ADMIN_USERNAME), password = tazevsta (atau env ADMIN_PASSWORD)

-- ======== SEASONS (3) — semua status "upcoming", tanpa champion ========
INSERT INTO "Season" ("id", "name", "number", "division", "status", "startDate", "championClubId", "championPlayerId", "championSquad", "createdAt", "updatedAt") VALUES
  ('sn_m1', 'IDM League Season 1 - Male', 1, 'male', 'upcoming', '2025-01-06 00:00:00+00', NULL, NULL, NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('sn_f1', 'IDM League Season 1 - Female', 1, 'female', 'upcoming', '2025-01-06 00:00:00+00', NULL, NULL, NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('sn_f2', 'Season 2 - Female', 2, 'female', 'upcoming', '2025-04-01 00:00:00+00', NULL, NULL, NULL, '2025-04-01 00:00:00+00', '2025-04-01 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- ======== MALE PLAYERS (50) — SEMUA STATS = 0 ========
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "createdAt", "updatedAt") VALUES
  ('mp_1', 'AbdnZ', 'AbdnZ', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_2', 'afi', 'afi', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_3', 'Afroki', 'Afroki', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_4', 'Airuen', 'Airuen', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_5', 'Armors', 'Armors', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_6', 'astro', 'astro', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_7', 'Bambang', 'Bambang', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_8', 'Boby', 'Boby', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_9', 'CARAOSEL', 'CARAOSEL', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_10', 'cepz', 'cepz', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_11', 'chand', 'chand', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_12', 'chikoo', 'chikoo', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_13', 'Chrollo', 'Chrollo', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_14', 'DUUL', 'DUUL', 'male', 'A', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_15', 'Dylee', 'Dylee', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_16', 'Earth', 'Earth', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_17', 'fyy', 'fyy', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_18', 'Georgie', 'Georgie', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_19', 'ipinnn', 'ipinnn', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_20', 'Jave', 'Jave', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_21', 'janskie', 'janskie', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_22', 'jugger', 'jugger', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_23', 'justice', 'justice', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_24', 'Kageno', 'Kageno', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_25', 'KIERAN', 'KIERAN', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "createdAt", "updatedAt") VALUES
  ('mp_26', 'KIRA', 'KIRA', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_27', 'Life', 'Life', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_28', 'marimo', 'marimo', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_29', 'montiel', 'montiel', 'male', 'A', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_30', 'Oura', 'Oura', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_31', 'Ren', 'Ren', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_32', 'RIVALDO', 'RIVALDO', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_33', 'RONALD', 'RONALD', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_34', 'rusel', 'rusel', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_35', 'sheraid', 'sheraid', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_36', 'sting', 'sting', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_37', 'tazos', 'tazos', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_38', 'tonsky', 'tonsky', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_39', 'Vankless', 'Vankless', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_40', 'VBBOY', 'VBBOY', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_41', 'VICKY', 'VICKY', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_42', 'Vriskey_', 'Vriskey_', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_43', 'WHYSON', 'WHYSON', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_44', 'XIAOPEI', 'XIAOPEI', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_45', 'yay', 'yay', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_46', 'ziafu', 'ziafu', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_47', 'ZABYER', 'ZABYER', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_48', 'zmz', 'zmz', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_49', 'ZORO', 'ZORO', 'male', 'A', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_50', 'zico', 'zico', 'male', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- ======== FEMALE PLAYERS (26) — SEMUA STATS = 0 ========
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "createdAt", "updatedAt") VALUES
  ('fp_1', 'Afrona', 'Afrona', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_2', 'AiTan', 'AiTan', 'female', 'A', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_3', 'arcalya', 'arcalya', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_4', 'cami', 'cami', 'female', 'S', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_5', 'cheeyaqq', 'cheeyaqq', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_6', 'ciki_w', 'ciki_w', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_7', 'damncil', 'damncil', 'female', 'A', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_8', 'dysa', 'dysa', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_9', 'Elvareca', 'Elvareca', 'female', 'A', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_10', 'evony', 'evony', 'female', 'S', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_11', 'Eive', 'Eive', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_12', 'Indy', 'Indy', 'female', 'S', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_13', 'irazz', 'irazz', 'female', 'A', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "createdAt", "updatedAt") VALUES
  ('fp_14', 'kacee', 'kacee', 'female', 'S', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_15', 'Liz', 'Liz', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_16', 'meatry', 'meatry', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_17', 'mishelle', 'mishelle', 'female', 'A', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_18', 'moy', 'moy', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_19', 'reptil', 'reptil', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_20', 's_melin', 's_melin', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_21', 'skylin', 'skylin', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_22', 'Veronicc', 'Veronicc', 'female', 'A', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_23', 'Vion', 'Vion', 'female', 'S', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_24', 'weywey', 'weywey', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_25', 'yaaay', 'yaaay', 'female', 'B', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_26', 'yoonabi', 'yoonabi', 'female', 'A', 0, 0, 0, 0, 0, 0, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;
