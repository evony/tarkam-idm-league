-- ============================================================
-- PART 4: INSERT CLUBS + MEMBERSHIPS
-- Jalankan KEEMPAT (setelah Part 3 berhasil)
-- ============================================================

-- ======== CLUB PROFILES (21) ========
INSERT INTO "ClubProfile" ("id", "name", "logo", "createdAt", "updatedAt") VALUES
  ('cpr_alqa', 'ALQA', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722484/idm/logos/xm73kzny0klrncflhxfj.jpg', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_avenue', 'AVENUE', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722508/idm/logos/j8zw91uiulijp8gf8ugg.webp', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_crown', 'CROWN', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722530/idm/logos/o1ujmjazgv1nxdpjzkew.webp', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_euphoric', 'EUPHORIC', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722372/idm/logos/cdstmpd99aetv3xvbwu0.webp', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_gymshark', 'GYMSHARK', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839600/idm/logos/fymwsgztdv0egvjite2o.webp', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_jasmine', 'JASMINE', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775714050/logo_nvzi1a.png', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_maximous', 'MAXIMOUS', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722447/idm/logos/ewl70fqyehvdhefxq76h.webp', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_mystery', 'MYSTERY', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775714050/logo_nvzi1a.png', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_orphic', 'ORPHIC', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775992653/logo1_tzieua.png', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_paranoid', 'PARANOID', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722406/idm/logos/iwd3khpecy8yo1mx94js.webp', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_platr', 'Plat R', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775748244/idm/logos/aydxk3fnrdkcmqh48aoi.jpg', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_psalm', 'PSALM', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722357/idm/logos/agyc2zkbafrvf1kjrc0b.jpg', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_queen', 'QUEEN', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839657/idm/logos/gzfny3tfdkxircyyxaxu.jpg', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_restart', 'RESTART', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722457/idm/logos/kdtgjq5sdecmfjtflude.jpg', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_rnb', 'RNB', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722517/idm/logos/migrego3avfcr0pganyq.jpg', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_salvador', 'SALVADOR', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722472/idm/logos/zxikdnl6ycqx4hkfmpwi.jpg', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_secrets', 'SECRETS', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722381/idm/logos/shcq5q4air1xkpqnz1hi.jpg', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_sensei', 'SENSEI', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775714050/logo_nvzi1a.png', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_southern', 'SOUTHERN', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839645/idm/logos/upuq4u9bccaihdnh6llb.jpg', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_together', 'TOGETHER', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722484/idm/logos/xm73kzny0klrncflhxfj.jpg', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00'),
  ('cpr_yakuza', 'YAKUZA', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722530/idm/logos/o1ujmjazgv1nxdpjzkew.webp', '2025-01-06 00:00:00+00', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- ======== MALE CLUB ENTRIES (15) ========
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff") VALUES
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

-- ======== FEMALE SEASON 1 CLUB ENTRIES (13) ========
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff") VALUES
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

-- ======== FEMALE SEASON 2 CLUB ENTRIES (13) ========
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff") VALUES
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

-- ======== MALE CLUB MEMBERSHIPS ========
-- MAXIMOUS (15): AbdnZ=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_m1', 'cpr_maximous', 'mp_1', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m2', 'cpr_maximous', 'mp_2', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m3', 'cpr_maximous', 'mp_6', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m4', 'cpr_maximous', 'mp_7', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m5', 'cpr_maximous', 'mp_8', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m6', 'cpr_maximous', 'mp_11', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m7', 'cpr_maximous', 'mp_16', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m8', 'cpr_maximous', 'mp_25', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m9', 'cpr_maximous', 'mp_31', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m10', 'cpr_maximous', 'mp_33', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m11', 'cpr_maximous', 'mp_35', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m12', 'cpr_maximous', 'mp_36', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m13', 'cpr_maximous', 'mp_38', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m14', 'cpr_maximous', 'mp_41', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m15', 'cpr_maximous', 'mp_45', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- SOUTHERN (5): Afroki=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_m16', 'cpr_southern', 'mp_3', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m17', 'cpr_southern', 'mp_5', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m18', 'cpr_southern', 'mp_21', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m19', 'cpr_southern', 'mp_26', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m20', 'cpr_southern', 'mp_39', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- AVENUE (3): Airuen=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_m21', 'cpr_avenue', 'mp_4', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m22', 'cpr_avenue', 'mp_24', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m23', 'cpr_avenue', 'mp_40', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- EUPHORIC (5): Chrollo=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_m24', 'cpr_euphoric', 'mp_13', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m25', 'cpr_euphoric', 'mp_23', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m26', 'cpr_euphoric', 'mp_32', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m27', 'cpr_euphoric', 'mp_42', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m28', 'cpr_euphoric', 'mp_50', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- PARANOID (3): DUUL=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_m29', 'cpr_paranoid', 'mp_14', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m30', 'cpr_paranoid', 'mp_29', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m31', 'cpr_paranoid', 'mp_49', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- GYMSHARK (5): fyy=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_m32', 'cpr_gymshark', 'mp_17', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m33', 'cpr_gymshark', 'mp_19', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m34', 'cpr_gymshark', 'mp_22', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m35', 'cpr_gymshark', 'mp_34', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m36', 'cpr_gymshark', 'mp_37', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- RESTART (2): Jave=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_m37', 'cpr_restart', 'mp_20', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m38', 'cpr_restart', 'mp_43', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- SALVADOR (3): cepz=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_m39', 'cpr_salvador', 'mp_10', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m40', 'cpr_salvador', 'mp_27', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m41', 'cpr_salvador', 'mp_30', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- ALQA (2): Georgie=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_m42', 'cpr_alqa', 'mp_18', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m43', 'cpr_alqa', 'mp_48', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- Solo clubs (1 member each = captain)
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_m44', 'cpr_orphic', 'mp_9', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m45', 'cpr_sensei', 'mp_12', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m46', 'cpr_sensei', 'mp_15', 'member', '2025-01-06 00:00:00+00'),
  ('cm_m47', 'cpr_secrets', 'mp_28', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m48', 'cpr_crown', 'mp_44', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m49', 'cpr_jasmine', 'mp_47', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_m50', 'cpr_mystery', 'mp_46', 'captain', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- ======== FEMALE CLUB MEMBERSHIPS ========
-- SOUTHERN (4): Afrona=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_f1', 'cpr_southern', 'fp_1', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_f2', 'cpr_southern', 'fp_3', 'member', '2025-01-06 00:00:00+00'),
  ('cm_f3', 'cpr_southern', 'fp_15', 'member', '2025-01-06 00:00:00+00'),
  ('cm_f4', 'cpr_southern', 'fp_19', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- PARANOID (5): AiTan=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_f5', 'cpr_paranoid', 'fp_2', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_f6', 'cpr_paranoid', 'fp_13', 'member', '2025-01-06 00:00:00+00'),
  ('cm_f7', 'cpr_paranoid', 'fp_17', 'member', '2025-01-06 00:00:00+00'),
  ('cm_f8', 'cpr_paranoid', 'fp_22', 'member', '2025-01-06 00:00:00+00'),
  ('cm_f9', 'cpr_paranoid', 'fp_26', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- MAXIMOUS female (3): cami=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_f10', 'cpr_maximous', 'fp_4', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_f11', 'cpr_maximous', 'fp_12', 'member', '2025-01-06 00:00:00+00'),
  ('cm_f12', 'cpr_maximous', 'fp_14', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- EUPHORIC female (3): damncil=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_f13', 'cpr_euphoric', 'fp_7', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_f14', 'cpr_euphoric', 'fp_9', 'member', '2025-01-06 00:00:00+00'),
  ('cm_f15', 'cpr_euphoric', 'fp_21', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- YAKUZA (3): meatry=captain
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_f16', 'cpr_yakuza', 'fp_16', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_f17', 'cpr_yakuza', 'fp_18', 'member', '2025-01-06 00:00:00+00'),
  ('cm_f18', 'cpr_yakuza', 'fp_25', 'member', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;

-- Solo female clubs (1 member each = captain)
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt") VALUES
  ('cm_f19', 'cpr_secrets', 'fp_5', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_f20', 'cpr_together', 'fp_6', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_f21', 'cpr_restart', 'fp_8', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_f22', 'cpr_gymshark', 'fp_10', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_f23', 'cpr_psalm', 'fp_11', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_f24', 'cpr_platr', 'fp_20', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_f25', 'cpr_queen', 'fp_23', 'captain', '2025-01-06 00:00:00+00'),
  ('cm_f26', 'cpr_rnb', 'fp_24', 'captain', '2025-01-06 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;
