-- ============================================================
-- RESET TOTAL DATA — Kembalikan ke 0 seperti baru mau mulai
-- Jalankan di Neon SQL Editor (cukup 1 file ini saja)
--
-- Yang DIHAPUS:
--   - Semua Tournament, Match, Team, TeamPlayer
--   - Semua Participation, Donation, TournamentPrize
--   - Semua PlayerPoint (audit trail)
--   - Semua PlayerAchievement, Achievement
--   - Semua LeagueMatch, PlayoffMatch
--   - Semua Sponsor, TournamentSponsor, SponsoredPrize, SponsorBanner
--   - Semua Account, PlayerSkin, Skin
--   - Semua CmsSection, CmsCard, CmsSetting
--
-- Yang DIPERTAHANKAN tapi stats di-RESET ke 0:
--   - Player (tetap ada, tapi points/wins/mvp/streak/matches = 0)
--   - ClubProfile (tetap ada, identitas club tetap)
--   - Club (tetap ada, tapi wins/losses/points/gameDiff = 0)
--   - ClubMember (tetap ada, membership tetap)
--   - Season (tetap ada, tapi champion = NULL, status = "upcoming")
--
-- Yang DIPERTAHANKAN apa adanya:
--   - Admin (tetap bisa login)
-- ============================================================

-- Step 1: Hapus semua data kompetisi (urutan penting karena FK)
DELETE FROM "SponsorBanner";
DELETE FROM "SponsoredPrize";
DELETE FROM "TournamentSponsor";
DELETE FROM "PlayerAchievement";
DELETE FROM "Achievement";
DELETE FROM "PlayerPoint";
DELETE FROM "TournamentPrize";
DELETE FROM "Participation";
DELETE FROM "Match";
DELETE FROM "TeamPlayer";
DELETE FROM "Team";
DELETE FROM "Donation";
DELETE FROM "Tournament";
DELETE FROM "LeagueMatch";
DELETE FROM "PlayoffMatch";
DELETE FROM "CmsCard";
DELETE FROM "CmsSection";
DELETE FROM "CmsSetting";
DELETE FROM "PlayerSkin";
DELETE FROM "Skin";
DELETE FROM "Account";
DELETE FROM "Sponsor";

-- Step 2: Reset semua Player stats ke 0
UPDATE "Player" SET
  "points" = 0,
  "totalWins" = 0,
  "totalMvp" = 0,
  "streak" = 0,
  "maxStreak" = 0,
  "matches" = 0,
  "updatedAt" = NOW();

-- Step 3: Reset semua Club stats ke 0
UPDATE "Club" SET
  "wins" = 0,
  "losses" = 0,
  "points" = 0,
  "gameDiff" = 0;

-- Step 4: Reset semua Season (champion = NULL, status = upcoming)
UPDATE "Season" SET
  "championClubId" = NULL,
  "championPlayerId" = NULL,
  "championSquad" = NULL,
  "status" = 'upcoming',
  "endDate" = NULL,
  "updatedAt" = NOW();

-- Done! Semua data kompetisi sudah dihapus.
-- Player, Club, ClubMember, Season masih ada tapi stats = 0.
-- Admin tetap bisa login seperti biasa.
