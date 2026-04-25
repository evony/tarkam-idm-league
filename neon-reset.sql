-- ============================================================
-- RESET TOTAL DATA — Kembalikan ke 0 seperti baru mau mulai
-- Jalankan di Neon SQL Editor (cukup 1 file ini saja)
-- Aman: skip table yang tidak ada tanpa error
-- ============================================================

DO $$
BEGIN
  -- Step 1: Hapus semua data kompetisi (urutan penting karena FK)
  -- Setiap DELETE dibungkus exception supaya skip kalau table belum ada

  BEGIN EXECUTE 'DELETE FROM "SponsorBanner"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip SponsorBanner (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "SponsoredPrize"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip SponsoredPrize (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "TournamentSponsor"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip TournamentSponsor (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "PlayerAchievement"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip PlayerAchievement (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "Achievement"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip Achievement (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "PlayerPoint"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip PlayerPoint (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "TournamentPrize"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip TournamentPrize (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "Participation"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip Participation (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "Match"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip Match (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "TeamPlayer"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip TeamPlayer (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "Team"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip Team (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "Donation"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip Donation (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "Tournament"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip Tournament (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "LeagueMatch"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip LeagueMatch (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "PlayoffMatch"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip PlayoffMatch (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "CmsCard"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip CmsCard (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "CmsSection"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip CmsSection (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "CmsSetting"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip CmsSetting (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "PlayerSkin"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip PlayerSkin (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "Skin"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip Skin (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "Account"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip Account (not exist)'; END;
  BEGIN EXECUTE 'DELETE FROM "Sponsor"'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip Sponsor (not exist)'; END;

  -- Step 2: Reset semua Player stats ke 0
  BEGIN EXECUTE 'UPDATE "Player" SET "points" = 0, "totalWins" = 0, "totalMvp" = 0, "streak" = 0, "maxStreak" = 0, "matches" = 0, "updatedAt" = NOW()'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip Player (not exist)'; END;

  -- Step 3: Reset semua Club stats ke 0
  BEGIN EXECUTE 'UPDATE "Club" SET "wins" = 0, "losses" = 0, "points" = 0, "gameDiff" = 0'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip Club (not exist)'; END;

  -- Step 4: Reset semua Season (champion = NULL, status = upcoming)
  BEGIN EXECUTE 'UPDATE "Season" SET "championClubId" = NULL, "championPlayerId" = NULL, "championSquad" = NULL, "status" = ''upcoming'', "endDate" = NULL, "updatedAt" = NOW()'; EXCEPTION WHEN undefined_table THEN RAISE NOTICE 'Skip Season (not exist)'; END;

  RAISE NOTICE '========================================';
  RAISE NOTICE 'RESET SELESAI! Semua data kembali ke 0.';
  RAISE NOTICE 'Player, Club, ClubMember, Season masih ada tapi stats = 0';
  RAISE NOTICE 'Admin tetap bisa login';
  RAISE NOTICE '========================================';
END $$;
