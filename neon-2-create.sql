-- ============================================================
-- PART 2: CREATE SEMUA TABLE (tanpa FK dulu)
-- Jalankan KEDUA (setelah Part 1 berhasil)
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

-- Club
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
