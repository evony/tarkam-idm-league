-- ============================================================
-- IDM LEAGUE - NEON POSTGRESQL COMPLETE SETUP SCRIPT
-- ============================================================
-- Cara pakai di Neon SQL Editor:
-- 1. Buka Neon Console → SQL Editor
-- 2. Copy-paste seluruh script ini
-- 3. Klik Run
-- 4. Selesai! Database siap dipakai
--
-- Script ini akan:
-- - DROP semua table yang ada (CASCADE)
-- - CREATE semua table sesuai Prisma schema
-- - INSERT semua seed data (77 players, 21 clubs, 3 seasons)
-- ============================================================

BEGIN;

-- ============================================================
-- STEP 1: DROP SEMUA TABLE (CASCADE)
-- ============================================================
DROP TABLE IF EXISTS "_prisma_migrations" CASCADE;
DROP TABLE IF EXISTS "SponsorBanner" CASCADE;
DROP TABLE IF EXISTS "SponsoredPrize" CASCADE;
DROP TABLE IF EXISTS "TournamentSponsor" CASCADE;
DROP TABLE IF EXISTS "PlayerAchievement" CASCADE;
DROP TABLE IF EXISTS "Achievement" CASCADE;
DROP TABLE IF EXISTS "PlayerPoint" CASCADE;
DROP TABLE IF EXISTS "CmsCard" CASCADE;
DROP TABLE IF EXISTS "CmsSection" CASCADE;
DROP TABLE IF EXISTS "CmsSetting" CASCADE;
DROP TABLE IF EXISTS "PlayerSkin" CASCADE;
DROP TABLE IF EXISTS "Skin" CASCADE;
DROP TABLE IF EXISTS "Account" CASCADE;
DROP TABLE IF EXISTS "PlayoffMatch" CASCADE;
DROP TABLE IF EXISTS "LeagueMatch" CASCADE;
DROP TABLE IF EXISTS "ClubMember" CASCADE;
DROP TABLE IF EXISTS "Club" CASCADE;
DROP TABLE IF EXISTS "ClubProfile" CASCADE;
DROP TABLE IF EXISTS "Donation" CASCADE;
DROP TABLE IF EXISTS "TournamentPrize" CASCADE;
DROP TABLE IF EXISTS "Participation" CASCADE;
DROP TABLE IF EXISTS "Match" CASCADE;
DROP TABLE IF EXISTS "TeamPlayer" CASCADE;
DROP TABLE IF EXISTS "Team" CASCADE;
DROP TABLE IF EXISTS "Tournament" CASCADE;
DROP TABLE IF EXISTS "Season" CASCADE;
DROP TABLE IF EXISTS "Player" CASCADE;
DROP TABLE IF EXISTS "Admin" CASCADE;

-- ============================================================
-- STEP 2: CREATE SEMUA TABLE (SESUAI PRISMA SCHEMA)
-- ============================================================

-- Admin
CREATE TABLE "Admin" (
  "id" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'admin',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Admin_username_key" ON "Admin"("username");

-- Player
CREATE TABLE "Player" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "gamertag" TEXT NOT NULL,
  "division" TEXT NOT NULL,
  "tier" TEXT NOT NULL DEFAULT 'B',
  "avatar" TEXT,
  "points" INTEGER NOT NULL DEFAULT 0,
  "totalWins" INTEGER NOT NULL DEFAULT 0,
  "totalMvp" INTEGER NOT NULL DEFAULT 0,
  "streak" INTEGER NOT NULL DEFAULT 0,
  "maxStreak" INTEGER NOT NULL DEFAULT 0,
  "matches" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "phone" TEXT,
  "city" TEXT NOT NULL DEFAULT '',
  "joki" TEXT,
  "registrationStatus" TEXT NOT NULL DEFAULT 'approved',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Player_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Player_gamertag_key" ON "Player"("gamertag");
CREATE INDEX "Player_division_idx" ON "Player"("division");
CREATE INDEX "Player_division_isActive_idx" ON "Player"("division", "isActive");
CREATE INDEX "Player_points_idx" ON "Player"("points");

-- Season
CREATE TABLE "Season" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "number" INTEGER NOT NULL,
  "division" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'active',
  "startDate" TIMESTAMP(3) NOT NULL,
  "endDate" TIMESTAMP(3),
  "championClubId" TEXT,
  "championPlayerId" TEXT,
  "championSquad" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Season_division_status_idx" ON "Season"("division", "status");

-- ClubProfile
CREATE TABLE "ClubProfile" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "logo" TEXT,
  "bannerImage" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ClubProfile_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClubProfile_name_key" ON "ClubProfile"("name");

-- Club (season entry)
CREATE TABLE "Club" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "division" TEXT NOT NULL,
  "seasonId" TEXT NOT NULL,
  "wins" INTEGER NOT NULL DEFAULT 0,
  "losses" INTEGER NOT NULL DEFAULT 0,
  "points" INTEGER NOT NULL DEFAULT 0,
  "gameDiff" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "Club_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Club_profileId_seasonId_division_key" ON "Club"("profileId", "seasonId", "division");
CREATE INDEX "Club_seasonId_idx" ON "Club"("seasonId");
CREATE INDEX "Club_division_idx" ON "Club"("division");
CREATE INDEX "Club_profileId_idx" ON "Club"("profileId");

-- ClubMember
CREATE TABLE "ClubMember" (
  "id" TEXT NOT NULL,
  "profileId" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'member',
  "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "leftAt" TIMESTAMP(3),
  CONSTRAINT "ClubMember_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ClubMember_profileId_playerId_key" ON "ClubMember"("profileId", "playerId");
CREATE INDEX "ClubMember_playerId_idx" ON "ClubMember"("playerId");
CREATE INDEX "ClubMember_profileId_idx" ON "ClubMember"("profileId");
CREATE INDEX "ClubMember_leftAt_idx" ON "ClubMember"("leftAt");

-- Tournament
CREATE TABLE "Tournament" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "weekNumber" INTEGER NOT NULL,
  "division" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'setup',
  "format" TEXT NOT NULL DEFAULT 'single_elimination',
  "defaultMatchFormat" TEXT NOT NULL DEFAULT 'BO1',
  "seasonId" TEXT NOT NULL,
  "prizePool" INTEGER NOT NULL DEFAULT 0,
  "bpm" TEXT,
  "location" TEXT,
  "scheduledAt" TIMESTAMP(3),
  "finalizedAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Tournament_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Tournament_weekNumber_division_seasonId_key" ON "Tournament"("weekNumber", "division", "seasonId");
CREATE INDEX "Tournament_division_seasonId_idx" ON "Tournament"("division", "seasonId");

-- Team
CREATE TABLE "Team" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "power" INTEGER NOT NULL DEFAULT 0,
  "isWinner" BOOLEAN NOT NULL DEFAULT false,
  "rank" INTEGER,
  CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

-- TeamPlayer
CREATE TABLE "TeamPlayer" (
  "id" TEXT NOT NULL,
  "teamId" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "tier" TEXT NOT NULL DEFAULT 'B',
  CONSTRAINT "TeamPlayer_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TeamPlayer_teamId_playerId_key" ON "TeamPlayer"("teamId", "playerId");

-- Match
CREATE TABLE "Match" (
  "id" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "round" INTEGER NOT NULL DEFAULT 1,
  "matchNumber" INTEGER NOT NULL DEFAULT 1,
  "bracket" TEXT NOT NULL DEFAULT 'upper',
  "groupLabel" TEXT,
  "format" TEXT NOT NULL DEFAULT 'BO1',
  "team1Id" TEXT,
  "team2Id" TEXT,
  "score1" INTEGER,
  "score2" INTEGER,
  "status" TEXT NOT NULL DEFAULT 'pending',
  "winnerId" TEXT,
  "loserId" TEXT,
  "mvpPlayerId" TEXT,
  "scheduledAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Match_tournamentId_idx" ON "Match"("tournamentId");
CREATE INDEX "Match_status_idx" ON "Match"("status");
CREATE INDEX "Match_tournamentId_bracket_round_idx" ON "Match"("tournamentId", "bracket", "round");

-- Participation
CREATE TABLE "Participation" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'registered',
  "tierOverride" TEXT,
  "pointsEarned" INTEGER NOT NULL DEFAULT 0,
  "isMvp" BOOLEAN NOT NULL DEFAULT false,
  "isWinner" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Participation_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Participation_playerId_tournamentId_key" ON "Participation"("playerId", "tournamentId");
CREATE INDEX "Participation_tournamentId_status_idx" ON "Participation"("tournamentId", "status");
CREATE INDEX "Participation_isMvp_idx" ON "Participation"("isMvp");

-- Donation
CREATE TABLE "Donation" (
  "id" TEXT NOT NULL,
  "donorName" TEXT NOT NULL,
  "amount" INTEGER NOT NULL,
  "message" TEXT,
  "type" TEXT NOT NULL DEFAULT 'weekly',
  "status" TEXT NOT NULL DEFAULT 'pending',
  "tournamentId" TEXT,
  "seasonId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Donation_tournamentId_idx" ON "Donation"("tournamentId");
CREATE INDEX "Donation_seasonId_idx" ON "Donation"("seasonId");
CREATE INDEX "Donation_status_idx" ON "Donation"("status");

-- TournamentPrize
CREATE TABLE "TournamentPrize" (
  "id" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "position" INTEGER NOT NULL DEFAULT 0,
  "prizeAmount" INTEGER NOT NULL DEFAULT 0,
  "pointsPerPlayer" INTEGER NOT NULL DEFAULT 0,
  "recipientCount" INTEGER NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TournamentPrize_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "TournamentPrize_tournamentId_idx" ON "TournamentPrize"("tournamentId");

-- Account
CREATE TABLE "Account" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "username" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "email" TEXT,
  "phone" TEXT,
  "donorBadgeCount" INTEGER NOT NULL DEFAULT 0,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Account_playerId_key" ON "Account"("playerId");
CREATE UNIQUE INDEX "Account_username_key" ON "Account"("username");
CREATE UNIQUE INDEX "Account_email_key" ON "Account"("email");
CREATE INDEX "Account_username_idx" ON "Account"("username");
CREATE INDEX "Account_email_idx" ON "Account"("email");

-- Skin
CREATE TABLE "Skin" (
  "id" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "colorClass" TEXT NOT NULL,
  "priority" INTEGER NOT NULL DEFAULT 0,
  "duration" TEXT NOT NULL DEFAULT 'permanent',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Skin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Skin_type_key" ON "Skin"("type");
CREATE INDEX "Skin_type_idx" ON "Skin"("type");
CREATE INDEX "Skin_priority_idx" ON "Skin"("priority");

-- PlayerSkin
CREATE TABLE "PlayerSkin" (
  "id" TEXT NOT NULL,
  "accountId" TEXT NOT NULL,
  "skinId" TEXT NOT NULL,
  "awardedBy" TEXT,
  "reason" TEXT,
  "expiresAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlayerSkin_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PlayerSkin_accountId_skinId_key" ON "PlayerSkin"("accountId", "skinId");
CREATE INDEX "PlayerSkin_accountId_idx" ON "PlayerSkin"("accountId");
CREATE INDEX "PlayerSkin_expiresAt_idx" ON "PlayerSkin"("expiresAt");

-- LeagueMatch
CREATE TABLE "LeagueMatch" (
  "id" TEXT NOT NULL,
  "seasonId" TEXT NOT NULL,
  "club1Id" TEXT NOT NULL,
  "club2Id" TEXT NOT NULL,
  "score1" INTEGER,
  "score2" INTEGER,
  "week" INTEGER NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'upcoming',
  "format" TEXT NOT NULL DEFAULT 'BO3',
  CONSTRAINT "LeagueMatch_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "LeagueMatch_seasonId_status_idx" ON "LeagueMatch"("seasonId", "status");
CREATE INDEX "LeagueMatch_seasonId_week_idx" ON "LeagueMatch"("seasonId", "week");

-- PlayoffMatch
CREATE TABLE "PlayoffMatch" (
  "id" TEXT NOT NULL,
  "seasonId" TEXT NOT NULL,
  "club1Id" TEXT NOT NULL,
  "club2Id" TEXT NOT NULL,
  "score1" INTEGER,
  "score2" INTEGER,
  "round" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'upcoming',
  "format" TEXT NOT NULL DEFAULT 'BO5',
  CONSTRAINT "PlayoffMatch_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PlayoffMatch_seasonId_idx" ON "PlayoffMatch"("seasonId");
CREATE INDEX "PlayoffMatch_status_idx" ON "PlayoffMatch"("status");

-- CmsSection
CREATE TABLE "CmsSection" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT '',
  "subtitle" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "bannerUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CmsSection_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CmsSection_slug_key" ON "CmsSection"("slug");

-- CmsCard
CREATE TABLE "CmsCard" (
  "id" TEXT NOT NULL,
  "sectionId" TEXT NOT NULL,
  "title" TEXT NOT NULL DEFAULT '',
  "subtitle" TEXT NOT NULL DEFAULT '',
  "description" TEXT NOT NULL DEFAULT '',
  "imageUrl" TEXT,
  "videoUrl" TEXT,
  "linkUrl" TEXT,
  "tag" TEXT,
  "tagColor" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "order" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CmsCard_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "CmsCard_sectionId_idx" ON "CmsCard"("sectionId");

-- CmsSetting
CREATE TABLE "CmsSetting" (
  "id" TEXT NOT NULL,
  "key" TEXT NOT NULL,
  "value" TEXT NOT NULL DEFAULT '',
  "type" TEXT NOT NULL DEFAULT 'text',
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "CmsSetting_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "CmsSetting_key_key" ON "CmsSetting"("key");

-- PlayerPoint
CREATE TABLE "PlayerPoint" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "tournamentId" TEXT,
  "matchId" TEXT,
  "amount" INTEGER NOT NULL,
  "reason" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PlayerPoint_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "PlayerPoint_playerId_idx" ON "PlayerPoint"("playerId");
CREATE INDEX "PlayerPoint_tournamentId_idx" ON "PlayerPoint"("tournamentId");
CREATE INDEX "PlayerPoint_reason_idx" ON "PlayerPoint"("reason");
CREATE INDEX "PlayerPoint_playerId_tournamentId_idx" ON "PlayerPoint"("playerId", "tournamentId");

-- Achievement
CREATE TABLE "Achievement" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "icon" TEXT NOT NULL,
  "tier" TEXT NOT NULL DEFAULT 'bronze',
  "criteria" TEXT NOT NULL,
  "rewardPoints" INTEGER NOT NULL DEFAULT 0,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "Achievement_name_key" ON "Achievement"("name");
CREATE INDEX "Achievement_category_idx" ON "Achievement"("category");
CREATE INDEX "Achievement_isActive_idx" ON "Achievement"("isActive");

-- PlayerAchievement
CREATE TABLE "PlayerAchievement" (
  "id" TEXT NOT NULL,
  "playerId" TEXT NOT NULL,
  "achievementId" TEXT NOT NULL,
  "tournamentId" TEXT,
  "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "context" TEXT,
  CONSTRAINT "PlayerAchievement_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "PlayerAchievement_playerId_achievementId_key" ON "PlayerAchievement"("playerId", "achievementId");
CREATE INDEX "PlayerAchievement_playerId_idx" ON "PlayerAchievement"("playerId");
CREATE INDEX "PlayerAchievement_achievementId_idx" ON "PlayerAchievement"("achievementId");
CREATE INDEX "PlayerAchievement_earnedAt_idx" ON "PlayerAchievement"("earnedAt");

-- Sponsor
CREATE TABLE "Sponsor" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "logo" TEXT,
  "website" TEXT,
  "description" TEXT,
  "tier" TEXT NOT NULL DEFAULT 'bronze',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Sponsor_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Sponsor_tier_idx" ON "Sponsor"("tier");
CREATE INDEX "Sponsor_isActive_idx" ON "Sponsor"("isActive");

-- TournamentSponsor
CREATE TABLE "TournamentSponsor" (
  "id" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "sponsorId" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'supporter',
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "TournamentSponsor_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TournamentSponsor_tournamentId_sponsorId_key" ON "TournamentSponsor"("tournamentId", "sponsorId");
CREATE INDEX "TournamentSponsor_tournamentId_idx" ON "TournamentSponsor"("tournamentId");

-- SponsoredPrize
CREATE TABLE "SponsoredPrize" (
  "id" TEXT NOT NULL,
  "tournamentId" TEXT NOT NULL,
  "sponsorId" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "prizeType" TEXT NOT NULL DEFAULT 'voucher',
  "value" INTEGER NOT NULL DEFAULT 0,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "position" TEXT,
  "imageUrl" TEXT,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SponsoredPrize_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SponsoredPrize_tournamentId_idx" ON "SponsoredPrize"("tournamentId");
CREATE INDEX "SponsoredPrize_sponsorId_idx" ON "SponsoredPrize"("sponsorId");

-- SponsorBanner
CREATE TABLE "SponsorBanner" (
  "id" TEXT NOT NULL,
  "sponsorId" TEXT NOT NULL,
  "placement" TEXT NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "linkUrl" TEXT,
  "width" INTEGER,
  "height" INTEGER,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "displayOrder" INTEGER NOT NULL DEFAULT 0,
  "startDate" TIMESTAMP(3),
  "endDate" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SponsorBanner_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "SponsorBanner_placement_idx" ON "SponsorBanner"("placement");
CREATE INDEX "SponsorBanner_sponsorId_idx" ON "SponsorBanner"("sponsorId");

-- ============================================================
-- STEP 2b: ADD FOREIGN KEY CONSTRAINTS
-- ============================================================

-- Season FKs
ALTER TABLE "Season" ADD CONSTRAINT "Season_championClubId_fkey" FOREIGN KEY ("championClubId") REFERENCES "ClubProfile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Season" ADD CONSTRAINT "Season_championPlayerId_fkey" FOREIGN KEY ("championPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Club FKs
ALTER TABLE "Club" ADD CONSTRAINT "Club_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ClubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Club" ADD CONSTRAINT "Club_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ClubMember FKs
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "ClubProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ClubMember" ADD CONSTRAINT "ClubMember_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Tournament FK
ALTER TABLE "Tournament" ADD CONSTRAINT "Tournament_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Team FK
ALTER TABLE "Team" ADD CONSTRAINT "Team_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- TeamPlayer FKs
ALTER TABLE "TeamPlayer" ADD CONSTRAINT "TeamPlayer_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TeamPlayer" ADD CONSTRAINT "TeamPlayer_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Match FKs
ALTER TABLE "Match" ADD CONSTRAINT "Match_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_team1Id_fkey" FOREIGN KEY ("team1Id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_team2Id_fkey" FOREIGN KEY ("team2Id") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_winnerId_fkey" FOREIGN KEY ("winnerId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_loserId_fkey" FOREIGN KEY ("loserId") REFERENCES "Team"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Match" ADD CONSTRAINT "Match_mvpPlayerId_fkey" FOREIGN KEY ("mvpPlayerId") REFERENCES "Player"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Participation FKs
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Participation" ADD CONSTRAINT "Participation_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Donation FKs
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- TournamentPrize FK
ALTER TABLE "TournamentPrize" ADD CONSTRAINT "TournamentPrize_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Account FK
ALTER TABLE "Account" ADD CONSTRAINT "Account_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PlayerSkin FKs
ALTER TABLE "PlayerSkin" ADD CONSTRAINT "PlayerSkin_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerSkin" ADD CONSTRAINT "PlayerSkin_skinId_fkey" FOREIGN KEY ("skinId") REFERENCES "Skin"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- LeagueMatch FKs
ALTER TABLE "LeagueMatch" ADD CONSTRAINT "LeagueMatch_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeagueMatch" ADD CONSTRAINT "LeagueMatch_club1Id_fkey" FOREIGN KEY ("club1Id") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "LeagueMatch" ADD CONSTRAINT "LeagueMatch_club2Id_fkey" FOREIGN KEY ("club2Id") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PlayoffMatch FKs
ALTER TABLE "PlayoffMatch" ADD CONSTRAINT "PlayoffMatch_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayoffMatch" ADD CONSTRAINT "PlayoffMatch_club1Id_fkey" FOREIGN KEY ("club1Id") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayoffMatch" ADD CONSTRAINT "PlayoffMatch_club2Id_fkey" FOREIGN KEY ("club2Id") REFERENCES "Club"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CmsCard FK
ALTER TABLE "CmsCard" ADD CONSTRAINT "CmsCard_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "CmsSection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PlayerPoint FKs
ALTER TABLE "PlayerPoint" ADD CONSTRAINT "PlayerPoint_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerPoint" ADD CONSTRAINT "PlayerPoint_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PlayerPoint" ADD CONSTRAINT "PlayerPoint_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- PlayerAchievement FKs
ALTER TABLE "PlayerAchievement" ADD CONSTRAINT "PlayerAchievement_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "Player"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerAchievement" ADD CONSTRAINT "PlayerAchievement_achievementId_fkey" FOREIGN KEY ("achievementId") REFERENCES "Achievement"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PlayerAchievement" ADD CONSTRAINT "PlayerAchievement_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- TournamentSponsor FKs
ALTER TABLE "TournamentSponsor" ADD CONSTRAINT "TournamentSponsor_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TournamentSponsor" ADD CONSTRAINT "TournamentSponsor_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SponsoredPrize FKs
ALTER TABLE "SponsoredPrize" ADD CONSTRAINT "SponsoredPrize_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SponsoredPrize" ADD CONSTRAINT "SponsoredPrize_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- SponsorBanner FK
ALTER TABLE "SponsorBanner" ADD CONSTRAINT "SponsorBanner_sponsorId_fkey" FOREIGN KEY ("sponsorId") REFERENCES "Sponsor"("id") ON DELETE CASCADE ON UPDATE CASCADE;


-- ============================================================
-- STEP 3: INSERT SEED DATA
-- ============================================================

-- ======== SEASONS ========
INSERT INTO "Season" ("id", "name", "number", "division", "status", "startDate", "championClubId", "championPlayerId", "championSquad", "createdAt", "updatedAt")
VALUES
  ('sn_m1', 'IDM League Season 1 - Male', 1, 'male', 'active', '2025-01-06 00:00:00+00', NULL, NULL, NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('sn_f1', 'IDM League Season 1 - Female', 1, 'female', 'completed', '2025-01-06 00:00:00+00', 'cpr_maximous', NULL, NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('sn_f2', 'Season 2 - Female', 2, 'female', 'active', '2025-04-01 00:00:00+00', NULL, NULL, NULL, '2025-04-01 00:00:00+00', '2025-04-01 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- ======== MALE PLAYERS (51) ========
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES
  ('mp_1', 'AbdnZ', 'AbdnZ', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_2', 'afi', 'afi', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_3', 'Afroki', 'Afroki', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_4', 'Airuen', 'Airuen', 'male', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_5', 'Armors', 'Armors', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_6', 'astro', 'astro', 'male', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_7', 'Bambang', 'Bambang', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_8', 'Boby', 'Boby', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_9', 'CARAOSEL', 'CARAOSEL', 'male', 'B', NULL, 5, 0, 0, 0, 0, 1, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_10', 'cepz', 'cepz', 'male', 'B', NULL, 5, 0, 0, 0, 0, 1, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_11', 'chand', 'chand', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_12', 'chikoo', 'chikoo', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_13', 'Chrollo', 'Chrollo', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_14', 'DUUL', 'DUUL', 'male', 'A', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_15', 'Dylee', 'Dylee', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_16', 'Earth', 'Earth', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_17', 'fyy', 'fyy', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_18', 'Georgie', 'Georgie', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_19', 'ipinnn', 'ipinnn', 'male', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_20', 'Jave', 'Jave', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_21', 'janskie', 'janskie', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_22', 'jugger', 'jugger', 'male', 'B', NULL, 50, 2, 1, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_23', 'justice', 'justice', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_24', 'Kageno', 'Kageno', 'male', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_25', 'KIERAN', 'KIERAN', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_26', 'KIRA', 'KIRA', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_27', 'Life', 'Life', 'male', 'B', NULL, 15, 0, 0, 0, 0, 2, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_28', 'marimo', 'marimo', 'male', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_29', 'montiel', 'montiel', 'male', 'A', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_30', 'Oura', 'Oura', 'male', 'B', NULL, 15, 0, 0, 0, 0, 2, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_31', 'Ren', 'Ren', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_32', 'RIVALDO', 'RIVALDO', 'male', 'B', NULL, 10, 0, 0, 0, 0, 1, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_33', 'RONALD', 'RONALD', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_34', 'rusel', 'rusel', 'male', 'B', NULL, 55, 2, 1, 2, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_35', 'sheraid', 'sheraid', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_36', 'sting', 'sting', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_37', 'tazos', 'tazos', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_38', 'tonsky', 'tonsky', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_39', 'Vankless', 'Vankless', 'male', 'B', NULL, 45, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_40', 'VBBOY', 'VBBOY', 'male', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_41', 'VICKY', 'VICKY', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_42', 'Vriskey_', 'Vriskey_', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_43', 'WHYSON', 'WHYSON', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_44', 'XIAOPEI', 'XIAOPEI', 'male', 'B', NULL, 5, 0, 0, 0, 0, 1, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_45', 'yay', 'yay', 'male', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_46', 'ziafu', 'ziafu', 'male', 'B', NULL, 5, 0, 0, 0, 0, 1, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_47', 'ZABYER', 'ZABYER', 'male', 'B', NULL, 20, 0, 0, 0, 0, 2, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_48', 'zmz', 'zmz', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_49', 'ZORO', 'ZORO', 'male', 'A', NULL, 75, 3, 1, 3, 3, 5, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('mp_50', 'zico', 'zico', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- ======== FEMALE PLAYERS (26) ========
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES
  ('fp_1', 'Afrona', 'Afrona', 'female', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_2', 'AiTan', 'AiTan', 'female', 'A', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_3', 'arcalya', 'arcalya', 'female', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_4', 'cami', 'cami', 'female', 'S', NULL, 135, 5, 2, 5, 5, 7, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_5', 'cheeyaqq', 'cheeyaqq', 'female', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_6', 'ciki_w', 'ciki_w', 'female', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_7', 'damncil', 'damncil', 'female', 'A', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_8', 'dysa', 'dysa', 'female', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_9', 'Elvareca', 'Elvareca', 'female', 'A', NULL, 85, 3, 1, 3, 3, 5, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_10', 'evony', 'evony', 'female', 'S', NULL, 95, 4, 1, 4, 4, 6, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_11', 'Eive', 'Eive', 'female', 'B', NULL, 35, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_12', 'Indy', 'Indy', 'female', 'S', NULL, 95, 4, 1, 4, 4, 6, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_13', 'irazz', 'irazz', 'female', 'A', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_14', 'kacee', 'kacee', 'female', 'S', NULL, 135, 5, 2, 5, 5, 7, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_15', 'Liz', 'Liz', 'female', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_16', 'meatry', 'meatry', 'female', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_17', 'mishelle', 'mishelle', 'female', 'A', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_18', 'moy', 'moy', 'female', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_19', 'reptil', 'reptil', 'female', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_20', 's_melin', 's_melin', 'female', 'B', NULL, 35, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_21', 'skylin', 'skylin', 'female', 'B', NULL, 60, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_22', 'Veronicc', 'Veronicc', 'female', 'A', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_23', 'Vion', 'Vion', 'female', 'S', NULL, 90, 4, 0, 4, 4, 6, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_24', 'weywey', 'weywey', 'female', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_25', 'yaaay', 'yaaay', 'female', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('fp_26', 'yoonabi', 'yoonabi', 'female', 'A', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- ======== CLUB PROFILES (21) ========
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES
  ('cpr_alqa', 'ALQA', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722484/idm/logos/xm73kzny0klrncflhxfj.jpg', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_avenue', 'AVENUE', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722508/idm/logos/j8zw91uiulijp8gf8ugg.webp', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_crown', 'CROWN', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722530/idm/logos/o1ujmjazgv1nxdpjzkew.webp', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_euphoric', 'EUPHORIC', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722372/idm/logos/cdstmpd99aetv3xvbwu0.webp', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_gymshark', 'GYMSHARK', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839600/idm/logos/fymwsgztdv0egvjite2o.webp', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_jasmine', 'JASMINE', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775714050/logo_nvzi1a.png', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_maximous', 'MAXIMOUS', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722447/idm/logos/ewl70fqyehvdhefxq76h.webp', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_mystery', 'MYSTERY', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775714050/logo_nvzi1a.png', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_orphic', 'ORPHIC', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775992653/logo1_tzieua.png', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_paranoid', 'PARANOID', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722406/idm/logos/iwd3khpecy8yo1mx94js.webp', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_platr', 'Plat R', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775748244/idm/logos/aydxk3fnrdkcmqh48aoi.jpg', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_psalm', 'PSALM', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722357/idm/logos/agyc2zkbafrvf1kjrc0b.jpg', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_queen', 'QUEEN', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839657/idm/logos/gzfny3tfdkxircyyxaxu.jpg', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_restart', 'RESTART', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722457/idm/logos/kdtgjq5sdecmfjtflude.jpg', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_rnb', 'RNB', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722517/idm/logos/migrego3avfcr0pganyq.jpg', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_salvador', 'SALVADOR', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722472/idm/logos/zxikdnl6ycqx4hkfmpwi.jpg', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_secrets', 'SECRETS', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722381/idm/logos/shcq5q4air1xkpqnz1hi.jpg', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_sensei', 'SENSEI', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775714050/logo_nvzi1a.png', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_southern', 'SOUTHERN', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839645/idm/logos/upuq4u9bccaihdnh6llb.jpg', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_together', 'TOGETHER', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722484/idm/logos/xm73kzny0klrncflhxfj.jpg', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_yakuza', 'YAKUZA', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722530/idm/logos/o1ujmjazgv1nxdpjzkew.webp', NULL, '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- ======== CLUB SEASON ENTRIES ========

-- Male Season 1 clubs (15 clubs)
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES
  ('ce_alqa_m1', 'cpr_alqa', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_avenue_m1', 'cpr_avenue', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_crown_m1', 'cpr_crown', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_euphoric_m1', 'cpr_euphoric', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_gymshark_m1', 'cpr_gymshark', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_jasmine_m1', 'cpr_jasmine', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_maximous_m1', 'cpr_maximous', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_mystery_m1', 'cpr_mystery', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_orphic_m1', 'cpr_orphic', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_paranoid_m1', 'cpr_paranoid', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_restart_m1', 'cpr_restart', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_salvador_m1', 'cpr_salvador', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_secrets_m1', 'cpr_secrets', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_sensei_m1', 'cpr_sensei', 'male', 'sn_m1', 0, 0, 0, 0),
  ('ce_southern_m1', 'cpr_southern', 'male', 'sn_m1', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;

-- Female Season 1 clubs (13 clubs)
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES
  ('ce_euphoric_f1', 'cpr_euphoric', 'female', 'sn_f1', 0, 0, 0, 0),
  ('ce_gymshark_f1', 'cpr_gymshark', 'female', 'sn_f1', 0, 0, 0, 0),
  ('ce_maximous_f1', 'cpr_maximous', 'female', 'sn_f1', 0, 0, 0, 0),
  ('ce_paranoid_f1', 'cpr_paranoid', 'female', 'sn_f1', 0, 0, 0, 0),
  ('ce_platr_f1', 'cpr_platr', 'female', 'sn_f1', 0, 0, 0, 0),
  ('ce_psalm_f1', 'cpr_psalm', 'female', 'sn_f1', 0, 0, 0, 0),
  ('ce_queen_f1', 'cpr_queen', 'female', 'sn_f1', 0, 0, 0, 0),
  ('ce_restart_f1', 'cpr_restart', 'female', 'sn_f1', 0, 0, 0, 0),
  ('ce_rnb_f1', 'cpr_rnb', 'female', 'sn_f1', 0, 0, 0, 0),
  ('ce_secrets_f1', 'cpr_secrets', 'female', 'sn_f1', 0, 0, 0, 0),
  ('ce_southern_f1', 'cpr_southern', 'female', 'sn_f1', 0, 0, 0, 0),
  ('ce_together_f1', 'cpr_together', 'female', 'sn_f1', 0, 0, 0, 0),
  ('ce_yakuza_f1', 'cpr_yakuza', 'female', 'sn_f1', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;

-- Female Season 2 clubs (13 clubs — same as S1)
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES
  ('ce_euphoric_f2', 'cpr_euphoric', 'female', 'sn_f2', 0, 0, 0, 0),
  ('ce_gymshark_f2', 'cpr_gymshark', 'female', 'sn_f2', 0, 0, 0, 0),
  ('ce_maximous_f2', 'cpr_maximous', 'female', 'sn_f2', 0, 0, 0, 0),
  ('ce_paranoid_f2', 'cpr_paranoid', 'female', 'sn_f2', 0, 0, 0, 0),
  ('ce_platr_f2', 'cpr_platr', 'female', 'sn_f2', 0, 0, 0, 0),
  ('ce_psalm_f2', 'cpr_psalm', 'female', 'sn_f2', 0, 0, 0, 0),
  ('ce_queen_f2', 'cpr_queen', 'female', 'sn_f2', 0, 0, 0, 0),
  ('ce_restart_f2', 'cpr_restart', 'female', 'sn_f2', 0, 0, 0, 0),
  ('ce_rnb_f2', 'cpr_rnb', 'female', 'sn_f2', 0, 0, 0, 0),
  ('ce_secrets_f2', 'cpr_secrets', 'female', 'sn_f2', 0, 0, 0, 0),
  ('ce_southern_f2', 'cpr_southern', 'female', 'sn_f2', 0, 0, 0, 0),
  ('ce_together_f2', 'cpr_together', 'female', 'sn_f2', 0, 0, 0, 0),
  ('ce_yakuza_f2', 'cpr_yakuza', 'female', 'sn_f2', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;

-- ======== CLUB MEMBERSHIPS ========
-- First player per club = captain, rest = member
-- joinedAt = '2025-01-06 00:00:00+00', leftAt = NULL

-- MALE CLUB MEMBERS
-- MAXIMOUS (15 members): AbdnZ=captain, afi, astro, Bambang, Boby, chand, Earth, KIERAN, Ren, RONALD, sheraid, sting, tonsky, VICKY, yay
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp1_max', 'cpr_maximous', 'mp_1', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp2_max', 'cpr_maximous', 'mp_2', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp6_max', 'cpr_maximous', 'mp_6', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp7_max', 'cpr_maximous', 'mp_7', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp8_max', 'cpr_maximous', 'mp_8', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp11_max', 'cpr_maximous', 'mp_11', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp16_max', 'cpr_maximous', 'mp_16', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp25_max', 'cpr_maximous', 'mp_25', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp31_max', 'cpr_maximous', 'mp_31', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp33_max', 'cpr_maximous', 'mp_33', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp35_max', 'cpr_maximous', 'mp_35', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp36_max', 'cpr_maximous', 'mp_36', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp38_max', 'cpr_maximous', 'mp_38', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp41_max', 'cpr_maximous', 'mp_41', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp45_max', 'cpr_maximous', 'mp_45', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- SOUTHERN (5 members): Afroki=captain, Armors, janskie, KIRA, Vankless
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp3_sth', 'cpr_southern', 'mp_3', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp5_sth', 'cpr_southern', 'mp_5', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp21_sth', 'cpr_southern', 'mp_21', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp26_sth', 'cpr_southern', 'mp_26', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp39_sth', 'cpr_southern', 'mp_39', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- AVENUE (3 members): Airuen=captain, Kageno, VBBOY
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp4_avn', 'cpr_avenue', 'mp_4', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp24_avn', 'cpr_avenue', 'mp_24', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp40_avn', 'cpr_avenue', 'mp_40', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- ORPHIC (1 member): CARAOSEL=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp9_orp', 'cpr_orphic', 'mp_9', 'captain', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- SALVADOR (3 members): cepz=captain, Life, Oura
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp10_sal', 'cpr_salvador', 'mp_10', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp27_sal', 'cpr_salvador', 'mp_27', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp30_sal', 'cpr_salvador', 'mp_30', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- SENSEI (2 members): chikoo=captain, Dylee
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp12_sen', 'cpr_sensei', 'mp_12', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp15_sen', 'cpr_sensei', 'mp_15', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- EUPHORIC (5 members): Chrollo=captain, justice, RIVALDO, Vriskey_, zico
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp13_eup', 'cpr_euphoric', 'mp_13', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp23_eup', 'cpr_euphoric', 'mp_23', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp32_eup', 'cpr_euphoric', 'mp_32', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp42_eup', 'cpr_euphoric', 'mp_42', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp50_eup', 'cpr_euphoric', 'mp_50', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- PARANOID (3 members): DUUL=captain, montiel, ZORO
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp14_par', 'cpr_paranoid', 'mp_14', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp29_par', 'cpr_paranoid', 'mp_29', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp49_par', 'cpr_paranoid', 'mp_49', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- GYMSHARK (5 members): fyy=captain, ipinnn, jugger, rusel, tazos
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp17_gym', 'cpr_gymshark', 'mp_17', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp19_gym', 'cpr_gymshark', 'mp_19', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp22_gym', 'cpr_gymshark', 'mp_22', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp34_gym', 'cpr_gymshark', 'mp_34', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp37_gym', 'cpr_gymshark', 'mp_37', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- ALQA (2 members): Georgie=captain, zmz
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp18_alq', 'cpr_alqa', 'mp_18', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp48_alq', 'cpr_alqa', 'mp_48', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- RESTART (2 members): Jave=captain, WHYSON
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp20_res', 'cpr_restart', 'mp_20', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_mp43_res', 'cpr_restart', 'mp_43', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- SECRETS (1 member): marimo=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp28_sec', 'cpr_secrets', 'mp_28', 'captain', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- CROWN (1 member): XIAOPEI=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp44_crw', 'cpr_crown', 'mp_44', 'captain', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- JASMINE (1 member): ZABYER=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp47_jas', 'cpr_jasmine', 'mp_47', 'captain', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- MYSTERY (1 member): ziafu=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_mp46_mys', 'cpr_mystery', 'mp_46', 'captain', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- FEMALE CLUB MEMBERS
-- SOUTHERN (4 members): Afrona=captain, arcalya, Liz, reptil
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_fp1_sth', 'cpr_southern', 'fp_1', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_fp3_sth', 'cpr_southern', 'fp_3', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_fp15_sth', 'cpr_southern', 'fp_15', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_fp19_sth', 'cpr_southern', 'fp_19', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- PARANOID (5 members): AiTan=captain, irazz, mishelle, Veronicc, yoonabi
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_fp2_par', 'cpr_paranoid', 'fp_2', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_fp13_par', 'cpr_paranoid', 'fp_13', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_fp17_par', 'cpr_paranoid', 'fp_17', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_fp22_par', 'cpr_paranoid', 'fp_22', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_fp26_par', 'cpr_paranoid', 'fp_26', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- MAXIMOUS (3 members): cami=captain, Indy, kacee
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_fp4_max', 'cpr_maximous', 'fp_4', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_fp12_max', 'cpr_maximous', 'fp_12', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_fp14_max', 'cpr_maximous', 'fp_14', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- SECRETS (1 member): cheeyaqq=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_fp5_sec', 'cpr_secrets', 'fp_5', 'captain', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- TOGETHER (1 member): ciki_w=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_fp6_tog', 'cpr_together', 'fp_6', 'captain', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- EUPHORIC (3 members): damncil=captain, Elvareca, skylin
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_fp7_eup', 'cpr_euphoric', 'fp_7', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_fp9_eup', 'cpr_euphoric', 'fp_9', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_fp21_eup', 'cpr_euphoric', 'fp_21', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- RESTART (1 member): dysa=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_fp8_res', 'cpr_restart', 'fp_8', 'captain', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- GYMSHARK (1 member): evony=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_fp10_gym', 'cpr_gymshark', 'fp_10', 'captain', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- PSALM (1 member): Eive=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_fp11_psl', 'cpr_psalm', 'fp_11', 'captain', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- YAKUZA (3 members): meatry=captain, moy, yaaay
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_fp16_yak', 'cpr_yakuza', 'fp_16', 'captain', '2025-01-06 00:00:00+00', NULL),
  ('cmr_fp18_yak', 'cpr_yakuza', 'fp_18', 'member', '2025-01-06 00:00:00+00', NULL),
  ('cmr_fp25_yak', 'cpr_yakuza', 'fp_25', 'member', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- PLAT R (1 member): s_melin=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_fp20_plr', 'cpr_platr', 'fp_20', 'captain', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- QUEEN (1 member): Vion=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_fp23_que', 'cpr_queen', 'fp_23', 'captain', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- RNB (1 member): weywey=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES
  ('cmr_fp24_rnb', 'cpr_rnb', 'fp_24', 'captain', '2025-01-06 00:00:00+00', NULL)
ON CONFLICT ("id") DO NOTHING;

COMMIT;

-- ============================================================
-- SELESAI! Database sudah siap dipakai.
-- ============================================================
-- Ringkasan data yang dimasukkan:
-- - 3 Seasons (Male S1, Female S1, Female S2)
-- - 50 Male Players
-- - 26 Female Players  (Total: 76 Players)
-- - 21 Club Profiles
-- - 41 Club Season Entries (15 male + 13 female S1 + 13 female S2)
-- - 77 Club Memberships
-- ============================================================
