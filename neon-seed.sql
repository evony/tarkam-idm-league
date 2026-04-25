-- ══════════════════════════════════════════════════
-- IDM LEAGUE — Production Seed Data for Neon PostgreSQL
-- Generated from local SQLite sandbox
-- ══════════════════════════════════════════════════

-- ── SEASONS ──
INSERT INTO "Season" ("id", "name", "number", "division", "status", "startDate", "endDate", "championClubId", "championPlayerId", "championSquad", "createdAt", "updatedAt")
VALUES ('cmocz7o1c0006u9b1wjcb4j42', 'Liga IDM Season 1', 1, 'liga', 'completed', '2026-04-24 13:58:44.591+00:00', '2026-04-24 14:43:44.217+00:00', 'cmocb6frf002dso09xc4uj50h', NULL, '[{"id":"cmocb6fpq0004so09w5b3u3et","gamertag":"afi","division":"male","role":"captain","avatar":null},{"id":"cmocb6fpu0009so0987vt2syk","gamertag":"Bambang","division":"male","role":"member","avatar":null},{"id":"cmocb6fpw000dso09trcn4x7s","gamertag":"chand","division":"male","role":"member","avatar":null},{"id":"cmocb6fqd000zso09kxkfp4ak","gamertag":"RONALD","division":"male","role":"member","avatar":null},{"id":"cmocb6fpp0003so09yjfk6d34","gamertag":"AbdnZ","division":"male","role":"member","avatar":null}]', '2026-04-24 13:58:44.593+00:00', '2026-04-24 14:46:40.713+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Season" ("id", "name", "number", "division", "status", "startDate", "endDate", "championClubId", "championPlayerId", "championSquad", "createdAt", "updatedAt")
VALUES ('cmocz8zc80007u9b1hv1g32dr', 'TARKAM', 1, 'male', 'active', '2026-04-29 00:00:00.000+00:00', NULL, NULL, NULL, NULL, '2026-04-24 13:59:45.896+00:00', '2026-04-24 13:59:45.896+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Season" ("id", "name", "number", "division", "status", "startDate", "endDate", "championClubId", "championPlayerId", "championSquad", "createdAt", "updatedAt")
VALUES ('cmocb6fpo0002so09matvf7cm', 'Season 2 - Female', 2, 'female', 'active', '2025-04-01 00:00:00.000+00:00', NULL, NULL, NULL, NULL, '2026-04-24 02:45:56.364+00:00', '2026-04-24 02:45:56.364+00:00')
ON CONFLICT ("id") DO NOTHING;

-- ── CLUB PROFILES ──
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6fra0027so09ykjb7bwn', 'ALQA', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722484/idm/logos/xm73kzny0klrncflhxfj.jpg', NULL, '2026-04-24 02:45:56.423+00:00', '2026-04-24 14:43:13.730+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frb0028so0951ul18i5', 'AVENUE', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722508/idm/logos/j8zw91uiulijp8gf8ugg.webp', NULL, '2026-04-24 02:45:56.423+00:00', '2026-04-24 14:43:24.843+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frb0029so096p2j4ub2', 'CROWN', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722530/idm/logos/o1ujmjazgv1nxdpjzkew.webp', NULL, '2026-04-24 02:45:56.424+00:00', '2026-04-24 14:54:23.461+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frc002aso09vnvapevx', 'EUPHORIC', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722372/idm/logos/cdstmpd99aetv3xvbwu0.webp', NULL, '2026-04-24 02:45:56.424+00:00', '2026-04-24 14:54:52.782+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frc002bso09gkh25g5r', 'GYMSHARK', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839600/idm/logos/fymwsgztdv0egvjite2o.webp', NULL, '2026-04-24 02:45:56.425+00:00', '2026-04-24 14:42:52.407+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frd002cso09b0l1eycy', 'JASMINE', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775714050/logo_nvzi1a.png', NULL, '2026-04-24 02:45:56.425+00:00', '2026-04-24 14:55:20.002+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frf002dso09xc4uj50h', 'MAXIMOUS', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722447/idm/logos/ewl70fqyehvdhefxq76h.webp', NULL, '2026-04-24 02:45:56.428+00:00', '2026-04-24 02:45:56.428+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frg002eso098o1jrn97', 'MYSTERY', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775714050/logo_nvzi1a.png', NULL, '2026-04-24 02:45:56.428+00:00', '2026-04-24 14:55:25.353+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frg002fso092ta045n8', 'ORPHIC', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775992653/logo1_tzieua.png', NULL, '2026-04-24 02:45:56.429+00:00', '2026-04-24 02:45:56.429+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frh002gso09p7cbhgi0', 'PARANOID', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722406/idm/logos/iwd3khpecy8yo1mx94js.webp', NULL, '2026-04-24 02:45:56.429+00:00', '2026-04-24 02:45:56.429+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frh002hso09kx0uilsv', 'PSALM', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722357/idm/logos/agyc2zkbafrvf1kjrc0b.jpg', NULL, '2026-04-24 02:45:56.430+00:00', '2026-04-24 02:45:56.430+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6fri002iso09dftri3ok', 'Plat R', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775748244/idm/logos/aydxk3fnrdkcmqh48aoi.jpg', NULL, '2026-04-24 02:45:56.430+00:00', '2026-04-24 02:45:56.430+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6fri002jso091arbjria', 'QUEEN', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839657/idm/logos/gzfny3tfdkxircyyxaxu.jpg', NULL, '2026-04-24 02:45:56.430+00:00', '2026-04-24 02:45:56.430+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6fri002kso09relq1fi3', 'RESTART', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722457/idm/logos/kdtgjq5sdecmfjtflude.jpg', NULL, '2026-04-24 02:45:56.431+00:00', '2026-04-24 02:45:56.431+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frj002lso09ny0h47xn', 'RNB', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722517/idm/logos/migrego3avfcr0pganyq.jpg', NULL, '2026-04-24 02:45:56.431+00:00', '2026-04-24 02:45:56.431+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frj002mso09a54vga77', 'SALVADOR', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722472/idm/logos/zxikdnl6ycqx4hkfmpwi.jpg', NULL, '2026-04-24 02:45:56.431+00:00', '2026-04-24 02:45:56.431+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frj002nso0947owbbcl', 'SECRETS', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722381/idm/logos/shcq5q4air1xkpqnz1hi.jpg', NULL, '2026-04-24 02:45:56.432+00:00', '2026-04-24 02:45:56.432+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frk002oso09m392imsx', 'SENSEI', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775714050/logo_nvzi1a.png', NULL, '2026-04-24 02:45:56.432+00:00', '2026-04-24 02:45:56.432+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frk002pso097d7x3mrq', 'SOUTHERN', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775839645/idm/logos/upuq4u9bccaihdnh6llb.jpg', NULL, '2026-04-24 02:45:56.432+00:00', '2026-04-24 02:45:56.432+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frk002qso09hs6oeaoc', 'TOGETHER', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722484/idm/logos/xm73kzny0klrncflhxfj.jpg', NULL, '2026-04-24 02:45:56.433+00:00', '2026-04-24 02:45:56.433+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubProfile" ("id", "name", "logo", "bannerImage", "createdAt", "updatedAt")
VALUES ('cmocb6frl002rso09n4mfb54f', 'YAKUZA', 'https://res.cloudinary.com/dagoryri5/image/upload/v1775722530/idm/logos/o1ujmjazgv1nxdpjzkew.webp', NULL, '2026-04-24 02:45:56.433+00:00', '2026-04-24 02:45:56.433+00:00')
ON CONFLICT ("id") DO NOTHING;

-- ── CLUBS (Season Entries) ──
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0ta3b000ju9724vyka9fi', 'cmocb6frf002dso09xc4uj50h', 'male', 'cmocz8zc80007u9b1hv1g32dr', 2, 5, 4, -3)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod17rpo001hu972e0k03i2i', 'cmocb6frc002aso09vnvapevx', 'male', 'cmocz8zc80007u9b1hv1g32dr', 2, 0, 4, 2)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod1b71x002ju972ozmqxru1', 'cmocb6frj002nso0947owbbcl', 'male', 'cmocz8zc80007u9b1hv1g32dr', 1, 1, 2, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmocb6fs2004dso09byerttye', 'cmocb6frc002aso09vnvapevx', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmocb6fs2004fso097l8u6iqk', 'cmocb6frc002bso09gkh25g5r', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmocb6fs3004hso09ilp50dug', 'cmocb6frf002dso09xc4uj50h', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmocb6fs3004jso092o1quudz', 'cmocb6frh002gso09p7cbhgi0', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmocb6fs4004lso09zylzfloo', 'cmocb6frh002hso09kx0uilsv', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmocb6fs4004nso09sd5hg8vj', 'cmocb6fri002iso09dftri3ok', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmocb6fs5004pso09mgv3ev49', 'cmocb6fri002jso091arbjria', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmocb6fs5004rso09swipkecw', 'cmocb6fri002kso09relq1fi3', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmocb6fs6004tso09b7ji09gv', 'cmocb6frj002lso09ny0h47xn', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmocb6fs6004vso093lsdl89c', 'cmocb6frj002nso0947owbbcl', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmocb6fs7004xso09w4i63l2l', 'cmocb6frk002pso097d7x3mrq', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmocb6fs9004zso092lr0qykk', 'cmocb6frk002qso09hs6oeaoc', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmocb6fs90051so09gwtl23k4', 'cmocb6frl002rso09n4mfb54f', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0s1i70001u9728u16nnvf', 'cmocb6frc002bso09gkh25g5r', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0s1i90003u972u4rqurj4', 'cmocb6frc002bso09gkh25g5r', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 1, 0, -1)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0srt80005u972kozn4e7r', 'cmocb6fra0027so09ykjb7bwn', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0srtb0007u9724tkz3lhm', 'cmocb6fra0027so09ykjb7bwn', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0srte0009u972mqp3dbbm', 'cmocb6fra0027so09ykjb7bwn', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0t0pc000bu972zbcarq12', 'cmocb6frb0028so0951ul18i5', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0t0pf000du972r3i8bv5k', 'cmocb6frb0028so0951ul18i5', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0t0pj000fu9721d1ftdol', 'cmocb6frb0028so0951ul18i5', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0ta38000hu972vh2xp0mj', 'cmocb6frf002dso09xc4uj50h', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0xk8x000lu9729ber4ddb', 'cmocb6frb0029so096p2j4ub2', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0xk90000nu972mcuq7su0', 'cmocb6frb0029so096p2j4ub2', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0xk94000pu9724btezbki', 'cmocb6frb0029so096p2j4ub2', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0xpm0000ru972g32uyzxa', 'cmocb6frh002gso09p7cbhgi0', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0xpm3000tu972b3zz0qzw', 'cmocb6frh002gso09p7cbhgi0', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0xvg9000vu972e5p6f423', 'cmocb6fri002iso09dftri3ok', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0xvgb000xu972a6y5o0hw', 'cmocb6fri002iso09dftri3ok', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0xxd8000zu972ilelc9cd', 'cmocb6frj002mso09a54vga77', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0xxda0011u972uqh1t2qq', 'cmocb6frj002mso09a54vga77', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0xxdc0013u9722gyfqo3c', 'cmocb6frj002mso09a54vga77', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0y0m10015u9722dxy6a8l', 'cmocb6frk002pso097d7x3mrq', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0y0m40017u972l40earg3', 'cmocb6frk002pso097d7x3mrq', 'male', 'cmocz8zc80007u9b1hv1g32dr', 1, 2, 0, -2)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0y7pi0019u972jgfjy2lh', 'cmocb6frk002oso09m392imsx', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0y7pl001bu9725byp7oij', 'cmocb6frk002oso09m392imsx', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod0y7po001du972kj29yrgf', 'cmocb6frk002oso09m392imsx', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod17rpl001fu972ossreovy', 'cmocb6frc002aso09vnvapevx', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod182k2001ju972g2lh9l8r', 'cmocb6frd002cso09b0l1eycy', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod182k5001lu972mox58kf7', 'cmocb6frd002cso09b0l1eycy', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod182k7001nu9725xg8mazw', 'cmocb6frd002cso09b0l1eycy', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod18awe001pu972lzc3hm9a', 'cmocb6frg002eso098o1jrn97', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod18awh001ru972ejp1ifu1', 'cmocb6frg002eso098o1jrn97', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod18awk001tu972gktei9q7', 'cmocb6frg002eso098o1jrn97', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod190w9001vu9721zc66iwx', 'cmocb6frg002fso092ta045n8', 'female', 'cmocb6fpo0002so09matvf7cm', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod190wc001xu972xmxopje2', 'cmocb6frg002fso092ta045n8', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod190wf001zu9725u7squly', 'cmocb6frg002fso092ta045n8', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod19o7n0021u972vs7k8umg', 'cmocb6frh002hso09kx0uilsv', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod19o7q0023u972ge3h1jvh', 'cmocb6frh002hso09kx0uilsv', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod1a8qp0025u972tf49lr0w', 'cmocb6fri002jso091arbjria', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod1a8qr0027u972d72sh545', 'cmocb6fri002jso091arbjria', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod1aih60029u972e8yivdsf', 'cmocb6fri002kso09relq1fi3', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod1aih8002bu972p5g58upt', 'cmocb6fri002kso09relq1fi3', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod1aqrf002du9728aavs2di', 'cmocb6frj002lso09ny0h47xn', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod1aqri002fu97260pn6w06', 'cmocb6frj002lso09ny0h47xn', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod1b71u002hu972rg5tlz22', 'cmocb6frj002nso0947owbbcl', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod1bse5002lu972uf7zx1zw', 'cmocb6frk002qso09hs6oeaoc', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod1bse9002nu9720ezrne18', 'cmocb6frk002qso09hs6oeaoc', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod1bzuv002pu972m1imykrr', 'cmocb6frl002rso09n4mfb54f', 'liga', 'cmocz7o1c0006u9b1wjcb4j42', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Club" ("id", "profileId", "division", "seasonId", "wins", "losses", "points", "gameDiff")
VALUES ('cmod1bzv3002ru972jbs2vtrk', 'cmocb6frl002rso09n4mfb54f', 'male', 'cmocz8zc80007u9b1hv1g32dr', 0, 0, 0, 0)
ON CONFLICT ("id") DO NOTHING;

-- ── PLAYERS ──
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr1001uso09vxrxlsx5', 'kacee', 'kacee', 'female', 'B', NULL, 135, 5, 2, 5, 5, 7, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.414+00:00', '2026-04-24 18:43:14.557+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqv001kso09p9wlbj65', 'cami', 'cami', 'female', 'B', NULL, 135, 5, 2, 5, 5, 7, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.407+00:00', '2026-04-24 18:43:14.549+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr0001sso095jvf6pvb', 'Indy', 'Indy', 'female', 'B', NULL, 95, 4, 1, 4, 4, 6, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.413+00:00', '2026-04-24 18:43:14.554+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqz001qso09phv62ecp', 'evony', 'evony', 'female', 'B', NULL, 95, 4, 1, 4, 4, 6, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.412+00:00', '2026-04-24 18:43:14.553+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr80023so09rfm7jk8f', 'Vion', 'Vion', 'female', 'B', NULL, 90, 4, 0, 4, 4, 6, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.420+00:00', '2026-04-24 18:43:14.559+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqy001pso095r8cqfvu', 'Elvareca', 'Elvareca', 'female', 'B', NULL, 85, 3, 1, 3, 3, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.411+00:00', '2026-04-24 18:43:14.552+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fra0026so092wpggmyq', 'yoonabi', 'yoonabi', 'female', 'B', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.422+00:00', '2026-04-24 18:43:14.560+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr70022so0987nbeluh', 'Veronicc', 'Veronicc', 'female', 'B', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.420+00:00', '2026-04-24 18:43:14.559+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr4001xso09hmcdydjh', 'mishelle', 'mishelle', 'female', 'B', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.417+00:00', '2026-04-24 18:43:14.558+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr1001tso0976eygfac', 'irazz', 'irazz', 'female', 'B', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.413+00:00', '2026-04-24 18:43:14.555+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqw001nso09ou48uyjb', 'damncil', 'damncil', 'female', 'B', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.409+00:00', '2026-04-24 18:43:14.551+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqt001iso09k4tvv6rd', 'AiTan', 'AiTan', 'female', 'B', NULL, 70, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.406+00:00', '2026-04-24 18:43:14.548+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr70021so097qkaaoyz', 'skylin', 'skylin', 'female', 'B', NULL, 60, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.419+00:00', '2026-04-24 02:45:56.419+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fpu0009so0987vt2syk', 'Bambang', 'Bambang', 'male', 'B', NULL, 56, 3, 1, 0, 2, 6, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.370+00:00', '2026-04-24 18:43:14.536+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr5001zso09t4xy8inb', 'reptil', 'reptil', 'female', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.418+00:00', '2026-04-24 02:45:56.418+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr2001vso09pgqmvthw', 'Liz', 'Liz', 'female', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.414+00:00', '2026-04-24 02:45:56.414+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqx001oso095bz3ujm6', 'dysa', 'dysa', 'female', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.409+00:00', '2026-04-24 02:45:56.409+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqu001jso09gz02g2a0', 'arcalya', 'arcalya', 'female', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.406+00:00', '2026-04-24 02:45:56.406+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqt001hso09fmp9fjw4', 'Afrona', 'Afrona', 'female', 'B', NULL, 50, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.405+00:00', '2026-04-24 02:45:56.405+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr60020so09d8b1ht66', 's_melin', 's_melin', 'female', 'B', NULL, 35, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.419+00:00', '2026-04-24 02:45:56.419+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr0001rso09zb5xeu2g', 'Eive', 'Eive', 'female', 'B', NULL, 35, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.412+00:00', '2026-04-24 02:45:56.412+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmod4gscl0039u972x9bld4lg', 'arthur', 'arthur', 'male', 'B', NULL, 31, 2, 0, 2, 2, 2, true, NULL, 'Kotabaru', NULL, 'approved', '2026-04-24 16:25:48.165+00:00', '2026-04-24 18:43:14.561+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqs001gso09rz4va3zj', 'zico', 'zico', 'male', 'B', NULL, 31, 2, 0, 2, 2, 2, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.405+00:00', '2026-04-24 18:43:14.547+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqg0013so09ewkb3a7o', 'tazos', 'tazos', 'male', 'B', NULL, 31, 4, 0, 2, 2, 6, true, NULL, 'Kotabaru', NULL, 'approved', '2026-04-24 02:45:56.393+00:00', '2026-04-24 18:43:14.545+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr90025so09tb2m0ih5', 'yaaay', 'yaaay', 'female', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.421+00:00', '2026-04-24 02:45:56.421+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr80024so09hj40730j', 'weywey', 'weywey', 'female', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.421+00:00', '2026-04-24 02:45:56.421+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr5001yso097homiga9', 'moy', 'moy', 'female', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.417+00:00', '2026-04-24 02:45:56.417+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fr3001wso0912wnlka3', 'meatry', 'meatry', 'female', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.416+00:00', '2026-04-24 02:45:56.416+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqw001mso09gzp25qg3', 'ciki_w', 'ciki_w', 'female', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.408+00:00', '2026-04-24 02:45:56.408+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqv001lso09oc2fm1od', 'cheeyaqq', 'cheeyaqq', 'female', 'B', NULL, 30, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.408+00:00', '2026-04-24 02:45:56.408+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqa000uso09j3c2zrmf', 'marimo', 'marimo', 'male', 'B', NULL, 26, 2, 0, 0, 1, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.387+00:00', '2026-04-24 18:43:14.542+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fq1000iso09hfmg06k5', 'Earth', 'Earth', 'male', 'B', NULL, 26, 3, 0, 0, 2, 6, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.377+00:00', '2026-04-24 18:43:14.539+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fq9000sso099mu5j9d5', 'KIRA', 'KIRA', 'male', 'B', NULL, 21, 2, 0, 0, 2, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.386+00:00', '2026-04-24 18:43:14.541+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fq5000lso0918a6i67y', 'ipinnn', 'ipinnn', 'male', 'B', NULL, 21, 1, 0, 0, 1, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.381+00:00', '2026-04-24 18:43:14.540+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fps0007so09dpo6lv63', 'Armors', 'Armors', 'male', 'B', NULL, 21, 2, 0, 0, 2, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.369+00:00', '2026-04-24 18:43:14.535+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqc000xso095fnjr4f1', 'Ren', 'Ren', 'male', 'B', NULL, 1, 2, 0, 0, 2, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.389+00:00', '2026-04-24 18:43:14.544+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fpu000aso09wir8bk0g', 'Boby', 'Boby', 'male', 'B', NULL, 1, 2, 0, 0, 2, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.371+00:00', '2026-04-24 18:11:05.629+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fpp0003so09yjfk6d34', 'AbdnZ', 'AbdnZ', 'male', 'B', NULL, 1, 0, 0, 0, 0, 1, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.365+00:00', '2026-04-24 18:43:14.532+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqs001fso09ow4l81su', 'ZORO', 'ZORO', 'male', 'B', NULL, 0, 3, 1, 3, 3, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.404+00:00', '2026-04-24 18:43:14.546+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqr001eso097n1q4e4w', 'zmz', 'zmz', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.404+00:00', '2026-04-24 02:45:56.404+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqq001dso09tojcher1', 'ZABYER', 'ZABYER', 'male', 'B', NULL, 0, 0, 0, 0, 0, 2, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.403+00:00', '2026-04-24 13:22:03.424+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqq001cso09fkapvbb1', 'ziafu', 'ziafu', 'male', 'B', NULL, 0, 0, 0, 0, 0, 1, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.402+00:00', '2026-04-24 13:22:03.422+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqp001bso092h9pzdy8', 'yay', 'yay', 'male', 'B', NULL, 0, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.402+00:00', '2026-04-24 13:22:03.421+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqp001aso09pbqrdia3', 'XIAOPEI', 'XIAOPEI', 'male', 'B', NULL, 0, 0, 0, 0, 0, 1, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.401+00:00', '2026-04-24 13:22:03.420+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqo0019so0969zyxkqb', 'WHYSON', 'WHYSON', 'male', 'B', NULL, 0, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.401+00:00', '2026-04-24 13:22:03.418+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqo0018so09b615vzop', 'Vriskey_', 'Vriskey_', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.400+00:00', '2026-04-24 02:45:56.400+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqn0017so09dnyltje3', 'VICKY', 'VICKY', 'male', 'B', NULL, 0, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.399+00:00', '2026-04-24 13:22:03.416+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqm0016so09gn12897f', 'VBBOY', 'VBBOY', 'male', 'B', NULL, 0, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.399+00:00', '2026-04-24 13:22:03.415+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqm0015so09mm1h2r5g', 'Vankless', 'Vankless', 'male', 'B', NULL, 0, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.398+00:00', '2026-04-24 13:22:03.414+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fql0014so09bah8uzu2', 'tonsky', 'tonsky', 'male', 'B', NULL, 0, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.397+00:00', '2026-04-24 13:22:03.413+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqg0012so09i96x7fc8', 'sting', 'sting', 'male', 'B', NULL, 0, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.392+00:00', '2026-04-24 13:22:03.410+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqf0011so09vvd5jprd', 'sheraid', 'sheraid', 'male', 'B', NULL, 0, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.391+00:00', '2026-04-24 13:22:03.409+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqe0010so09l3iwip15', 'rusel', 'rusel', 'male', 'B', NULL, 0, 2, 1, 2, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.391+00:00', '2026-04-24 13:22:03.403+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqd000zso09kxkfp4ak', 'RONALD', 'RONALD', 'male', 'B', NULL, 0, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.390+00:00', '2026-04-24 13:22:03.402+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqd000yso09d1q1ndqq', 'RIVALDO', 'RIVALDO', 'male', 'B', NULL, 0, 0, 0, 0, 0, 1, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.389+00:00', '2026-04-24 13:22:03.400+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqc000wso09kklrigcl', 'Oura', 'Oura', 'male', 'B', NULL, 0, 0, 0, 0, 0, 2, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.388+00:00', '2026-04-24 13:22:03.397+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqb000vso09xdr1i4bf', 'montiel', 'montiel', 'male', 'B', NULL, 0, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.387+00:00', '2026-04-24 18:43:14.543+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fqa000tso09eggldwcl', 'Life', 'Life', 'male', 'B', NULL, 0, 0, 0, 0, 0, 2, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.386+00:00', '2026-04-24 13:22:03.393+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fq8000rso09n3mnapm3', 'KIERAN', 'KIERAN', 'male', 'B', NULL, 0, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.385+00:00', '2026-04-24 13:22:03.389+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fq8000qso098w8zebik', 'Kageno', 'Kageno', 'male', 'B', NULL, 0, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.384+00:00', '2026-04-24 13:22:03.387+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fq7000pso09nnstkwkv', 'justice', 'justice', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.384+00:00', '2026-04-24 02:45:56.384+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fq7000oso09yrfdzqmg', 'jugger', 'jugger', 'male', 'B', NULL, 0, 2, 1, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.383+00:00', '2026-04-24 13:22:03.385+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fq6000nso09a0d0f59o', 'janskie', 'janskie', 'male', 'B', NULL, 0, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.382+00:00', '2026-04-24 13:22:03.384+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fq5000mso09p97r7s8r', 'Jave', 'Jave', 'male', 'B', NULL, 0, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.382+00:00', '2026-04-24 13:22:03.382+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fq4000kso09wn2npkfd', 'Georgie', 'Georgie', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.380+00:00', '2026-04-24 02:45:56.380+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fq3000jso097g3x4pkw', 'fyy', 'fyy', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.379+00:00', '2026-04-24 02:45:56.379+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fq0000hso0942djqles', 'Dylee', 'Dylee', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.376+00:00', '2026-04-24 02:45:56.376+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fpz000gso0964wt36m3', 'DUUL', 'DUUL', 'male', 'B', NULL, 0, 3, 0, 0, 3, 5, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.375+00:00', '2026-04-24 18:43:14.537+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fpy000fso09wgz09rr3', 'Chrollo', 'Chrollo', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.374+00:00', '2026-04-24 02:45:56.374+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fpx000eso09x8gd5v22', 'chikoo', 'chikoo', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.373+00:00', '2026-04-24 02:45:56.373+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fpw000dso09trcn4x7s', 'chand', 'chand', 'male', 'B', NULL, 0, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.373+00:00', '2026-04-24 13:22:03.373+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fpw000cso09jrd1ifjt', 'cepz', 'cepz', 'male', 'B', NULL, 0, 0, 0, 0, 0, 1, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.372+00:00', '2026-04-24 13:22:03.372+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fpv000bso09sonm7ht7', 'CARAOSEL', 'CARAOSEL', 'male', 'B', NULL, 0, 0, 0, 0, 0, 1, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.371+00:00', '2026-04-24 13:22:03.371+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fpt0008so094im35e9d', 'astro', 'astro', 'male', 'B', NULL, 0, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.369+00:00', '2026-04-24 13:22:03.366+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fps0006so09frphc7av', 'Airuen', 'Airuen', 'male', 'B', NULL, 0, 1, 0, 0, 1, 3, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.368+00:00', '2026-04-24 13:22:03.363+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fpr0005so09pjicrs60', 'Afroki', 'Afroki', 'male', 'B', NULL, 0, 2, 0, 0, 2, 4, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.367+00:00', '2026-04-24 13:22:03.361+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "Player" ("id", "name", "gamertag", "division", "tier", "avatar", "points", "totalWins", "totalMvp", "streak", "maxStreak", "matches", "isActive", "phone", "city", "joki", "registrationStatus", "createdAt", "updatedAt")
VALUES ('cmocb6fpq0004so09w5b3u3et', 'afi', 'afi', 'male', 'B', NULL, 0, 0, 0, 0, 0, 0, true, NULL, '', NULL, 'approved', '2026-04-24 02:45:56.366+00:00', '2026-04-24 18:43:14.534+00:00')
ON CONFLICT ("id") DO NOTHING;

-- ── CLUB MEMBERS ──
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsd0053so094ok29764', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fpp0003so09yjfk6d34', 'captain', '2026-04-24 02:45:56.461+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fse0055so099g7p3r2t', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fpq0004so09w5b3u3et', 'member', '2026-04-24 02:45:56.462+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fse0057so09kd6anyzu', 'cmocb6frk002pso097d7x3mrq', 'cmocb6fpr0005so09pjicrs60', 'captain', '2026-04-24 02:45:56.463+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsf0059so09azzpazuf', 'cmocb6frb0028so0951ul18i5', 'cmocb6fps0006so09frphc7av', 'captain', '2026-04-24 02:45:56.463+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsf005bso09df29313x', 'cmocb6frk002pso097d7x3mrq', 'cmocb6fps0007so09dpo6lv63', 'member', '2026-04-24 02:45:56.464+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsg005dso09wh56qeyl', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fpt0008so094im35e9d', 'member', '2026-04-24 02:45:56.464+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsg005fso09d5lk9uks', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fpu0009so0987vt2syk', 'member', '2026-04-24 02:45:56.464+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsg005hso09m0evzhq1', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fpu000aso09wir8bk0g', 'member', '2026-04-24 02:45:56.465+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsh005jso09fnmp1076', 'cmocb6frg002fso092ta045n8', 'cmocb6fpv000bso09sonm7ht7', 'captain', '2026-04-24 02:45:56.465+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsh005lso09hgxjxi94', 'cmocb6frj002mso09a54vga77', 'cmocb6fpw000cso09jrd1ifjt', 'captain', '2026-04-24 02:45:56.466+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsi005nso09aue45xmx', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fpw000dso09trcn4x7s', 'member', '2026-04-24 02:45:56.466+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsj005pso09vwg5ca5u', 'cmocb6frk002oso09m392imsx', 'cmocb6fpx000eso09x8gd5v22', 'captain', '2026-04-24 02:45:56.467+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsk005rso090jibdyf1', 'cmocb6frc002aso09vnvapevx', 'cmocb6fpy000fso09wgz09rr3', 'captain', '2026-04-24 02:45:56.468+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsk005tso09e636nxoe', 'cmocb6frh002gso09p7cbhgi0', 'cmocb6fpz000gso0964wt36m3', 'captain', '2026-04-24 02:45:56.469+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsk005vso09089ny67e', 'cmocb6frk002oso09m392imsx', 'cmocb6fq0000hso0942djqles', 'member', '2026-04-24 02:45:56.469+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsl005xso09nl7xm198', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fq1000iso09hfmg06k5', 'member', '2026-04-24 02:45:56.469+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsl005zso09jrxic1yh', 'cmocb6frc002bso09gkh25g5r', 'cmocb6fq3000jso097g3x4pkw', 'member', '2026-04-24 02:45:56.470+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsm0061so09mf8j1159', 'cmocb6fra0027so09ykjb7bwn', 'cmocb6fq4000kso09wn2npkfd', 'member', '2026-04-24 02:45:56.470+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsm0063so09psal9no1', 'cmocb6frc002bso09gkh25g5r', 'cmocb6fq5000lso0918a6i67y', 'member', '2026-04-24 02:45:56.471+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsn0065so09czbxgtnj', 'cmocb6fri002kso09relq1fi3', 'cmocb6fq5000mso09p97r7s8r', 'captain', '2026-04-24 02:45:56.471+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsn0067so090c8snfm3', 'cmocb6frk002pso097d7x3mrq', 'cmocb6fq6000nso09a0d0f59o', 'member', '2026-04-24 02:45:56.472+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsn0069so0907v7x8bc', 'cmocb6frc002bso09gkh25g5r', 'cmocb6fq7000oso09yrfdzqmg', 'member', '2026-04-24 02:45:56.472+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fso006bso09qqjvzh9i', 'cmocb6frc002aso09vnvapevx', 'cmocb6fq7000pso09nnstkwkv', 'member', '2026-04-24 02:45:56.472+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fso006dso09vrhj4t2i', 'cmocb6frb0028so0951ul18i5', 'cmocb6fq8000qso098w8zebik', 'member', '2026-04-24 02:45:56.473+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsp006fso09lsw9moyb', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fq8000rso09n3mnapm3', 'member', '2026-04-24 02:45:56.473+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsp006hso095jnloame', 'cmocb6frk002pso097d7x3mrq', 'cmocb6fq9000sso099mu5j9d5', 'member', '2026-04-24 02:45:56.474+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsr006jso09p1bn56ik', 'cmocb6frj002mso09a54vga77', 'cmocb6fqa000tso09eggldwcl', 'member', '2026-04-24 02:45:56.475+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsr006lso09piznvsuf', 'cmocb6frj002nso0947owbbcl', 'cmocb6fqa000uso09j3c2zrmf', 'captain', '2026-04-24 02:45:56.476+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fss006nso09t3t8ocwq', 'cmocb6frh002gso09p7cbhgi0', 'cmocb6fqb000vso09xdr1i4bf', 'member', '2026-04-24 02:45:56.477+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsu006pso09rw5ckwz3', 'cmocb6frj002mso09a54vga77', 'cmocb6fqc000wso09kklrigcl', 'member', '2026-04-24 02:45:56.478+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsu006rso096vsaas4l', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fqc000xso095fnjr4f1', 'member', '2026-04-24 02:45:56.479+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsv006tso09f84ej9vo', 'cmocb6frc002aso09vnvapevx', 'cmocb6fqd000yso09d1q1ndqq', 'member', '2026-04-24 02:45:56.479+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsv006vso09n25fym3a', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fqd000zso09kxkfp4ak', 'member', '2026-04-24 02:45:56.479+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsv006xso09rp6egey2', 'cmocb6frc002bso09gkh25g5r', 'cmocb6fqe0010so09l3iwip15', 'captain', '2026-04-24 02:45:56.480+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsw006zso09d2shum61', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fqf0011so09vvd5jprd', 'member', '2026-04-24 02:45:56.480+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsw0071so09ao39pszr', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fqg0012so09i96x7fc8', 'member', '2026-04-24 02:45:56.481+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsx0073so09d3fjmisa', 'cmocb6frc002bso09gkh25g5r', 'cmocb6fqg0013so09ewkb3a7o', 'member', '2026-04-24 02:45:56.481+00:00', '2026-04-24 10:54:53.076+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsx0075so09e7pajse7', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fql0014so09bah8uzu2', 'member', '2026-04-24 02:45:56.482+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsy0077so09cswhuuev', 'cmocb6frk002pso097d7x3mrq', 'cmocb6fqm0015so09mm1h2r5g', 'member', '2026-04-24 02:45:56.482+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsy0079so09541p5mn1', 'cmocb6frb0028so0951ul18i5', 'cmocb6fqm0016so09gn12897f', 'member', '2026-04-24 02:45:56.483+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsz007bso097g7gmew1', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fqn0017so09dnyltje3', 'member', '2026-04-24 02:45:56.483+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fsz007dso099xsdx7cl', 'cmocb6frc002aso09vnvapevx', 'cmocb6fqo0018so09b615vzop', 'member', '2026-04-24 02:45:56.484+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft0007fso09zoiiokbx', 'cmocb6fri002kso09relq1fi3', 'cmocb6fqo0019so0969zyxkqb', 'member', '2026-04-24 02:45:56.484+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft0007hso09l18swu8r', 'cmocb6frb0029so096p2j4ub2', 'cmocb6fqp001aso09pbqrdia3', 'captain', '2026-04-24 02:45:56.485+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft1007jso09ggsvk1w5', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fqp001bso092h9pzdy8', 'member', '2026-04-24 02:45:56.485+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft1007lso09w1mw4974', 'cmocb6frg002eso098o1jrn97', 'cmocb6fqq001cso09fkapvbb1', 'captain', '2026-04-24 02:45:56.486+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft2007nso09ecrcsrag', 'cmocb6frd002cso09b0l1eycy', 'cmocb6fqq001dso09tojcher1', 'captain', '2026-04-24 02:45:56.486+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft2007pso09hs7ogdrd', 'cmocb6fra0027so09ykjb7bwn', 'cmocb6fqr001eso097n1q4e4w', 'captain', '2026-04-24 02:45:56.486+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft2007rso09sfkfg8bi', 'cmocb6frh002gso09p7cbhgi0', 'cmocb6fqs001fso09ow4l81su', 'member', '2026-04-24 02:45:56.487+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft3007tso09j3k5pu7r', 'cmocb6frc002aso09vnvapevx', 'cmocb6fqs001gso09rz4va3zj', 'member', '2026-04-24 02:45:56.487+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft3007vso09z4snzeig', 'cmocb6frk002pso097d7x3mrq', 'cmocb6fqt001hso09fmp9fjw4', 'captain', '2026-04-24 02:45:56.488+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft4007xso0985ac3lgj', 'cmocb6frh002gso09p7cbhgi0', 'cmocb6fqt001iso09k4tvv6rd', 'captain', '2026-04-24 02:45:56.488+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft4007zso09yagjlvbk', 'cmocb6frk002pso097d7x3mrq', 'cmocb6fqu001jso09gz02g2a0', 'member', '2026-04-24 02:45:56.489+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft50081so09gxeu8502', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fqv001kso09p9wlbj65', 'captain', '2026-04-24 02:45:56.489+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft50083so09bfoakey8', 'cmocb6frj002nso0947owbbcl', 'cmocb6fqv001lso09oc2fm1od', 'captain', '2026-04-24 02:45:56.490+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft60085so09kxvdpg64', 'cmocb6frk002qso09hs6oeaoc', 'cmocb6fqw001mso09gzp25qg3', 'captain', '2026-04-24 02:45:56.491+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft70087so098380dily', 'cmocb6frc002aso09vnvapevx', 'cmocb6fqw001nso09ou48uyjb', 'captain', '2026-04-24 02:45:56.491+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft70089so09m5q0j2er', 'cmocb6fri002kso09relq1fi3', 'cmocb6fqx001oso095bz3ujm6', 'captain', '2026-04-24 02:45:56.492+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft8008bso09yqodxmdn', 'cmocb6frc002aso09vnvapevx', 'cmocb6fqy001pso095r8cqfvu', 'member', '2026-04-24 02:45:56.492+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft9008dso09xhsvyu5e', 'cmocb6frc002bso09gkh25g5r', 'cmocb6fqz001qso09phv62ecp', 'captain', '2026-04-24 02:45:56.493+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ft9008fso093sw3lhod', 'cmocb6frh002hso09kx0uilsv', 'cmocb6fr0001rso09zb5xeu2g', 'captain', '2026-04-24 02:45:56.494+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fta008hso09yb8ahqdr', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fr0001sso095jvf6pvb', 'member', '2026-04-24 02:45:56.494+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fta008jso097v62ixuc', 'cmocb6frh002gso09p7cbhgi0', 'cmocb6fr1001tso0976eygfac', 'member', '2026-04-24 02:45:56.495+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ftb008lso09niud72p3', 'cmocb6frf002dso09xc4uj50h', 'cmocb6fr1001uso09vxrxlsx5', 'member', '2026-04-24 02:45:56.495+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ftb008nso09mdl0x144', 'cmocb6frk002pso097d7x3mrq', 'cmocb6fr2001vso09pgqmvthw', 'member', '2026-04-24 02:45:56.496+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ftc008pso09grcjmeav', 'cmocb6frl002rso09n4mfb54f', 'cmocb6fr3001wso0912wnlka3', 'captain', '2026-04-24 02:45:56.496+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ftc008rso09meqfwrg8', 'cmocb6frh002gso09p7cbhgi0', 'cmocb6fr4001xso09hmcdydjh', 'member', '2026-04-24 02:45:56.497+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ftd008tso09cgsr3mb0', 'cmocb6frl002rso09n4mfb54f', 'cmocb6fr5001yso097homiga9', 'member', '2026-04-24 02:45:56.497+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ftd008vso09qrq0010q', 'cmocb6frk002pso097d7x3mrq', 'cmocb6fr5001zso09t4xy8inb', 'member', '2026-04-24 02:45:56.498+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fte008xso09t6xe7o9x', 'cmocb6fri002iso09dftri3ok', 'cmocb6fr60020so09d8b1ht66', 'captain', '2026-04-24 02:45:56.498+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ftf008zso09k0jkrmec', 'cmocb6frc002aso09vnvapevx', 'cmocb6fr70021so097qkaaoyz', 'member', '2026-04-24 02:45:56.499+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ftf0091so09coozbeoa', 'cmocb6frh002gso09p7cbhgi0', 'cmocb6fr70022so0987nbeluh', 'member', '2026-04-24 02:45:56.499+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ftg0093so093jkkybhf', 'cmocb6fri002jso091arbjria', 'cmocb6fr80023so09rfm7jk8f', 'captain', '2026-04-24 02:45:56.500+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6ftg0095so098s0rbbhx', 'cmocb6frj002lso09ny0h47xn', 'cmocb6fr80024so09hj40730j', 'captain', '2026-04-24 02:45:56.500+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fth0097so09faokpcsv', 'cmocb6frl002rso09n4mfb54f', 'cmocb6fr90025so09tb2m0ih5', 'member', '2026-04-24 02:45:56.501+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "ClubMember" ("id", "profileId", "playerId", "role", "joinedAt", "leftAt")
VALUES ('cmocb6fth0099so0925h6opl6', 'cmocb6frh002gso09p7cbhgi0', 'cmocb6fra0026so092wpggmyq', 'member', '2026-04-24 02:45:56.501+00:00', NULL)
ON CONFLICT ("id") DO NOTHING;

-- ── TOURNAMENTS ──
INSERT INTO "Tournament" ("id", "name", "weekNumber", "division", "status", "format", "defaultMatchFormat", "seasonId", "prizePool", "bpm", "location", "scheduledAt", "finalizedAt", "completedAt", "createdAt", "updatedAt")
VALUES ('cmod6ghe7006bu9722r7g82m6', 'TARKAM YUKS...', 1, 'male', 'completed', 'single_elimination', 'BO3', 'cmocz8zc80007u9b1hv1g32dr', 240000, 'Random 120-140', 'Pub 1', NULL, '2026-04-24 18:16:09.389+00:00', '2026-04-24 18:16:09.389+00:00', '2026-04-24 17:21:33.199+00:00', '2026-04-24 18:16:09.390+00:00')
ON CONFLICT ("id") DO NOTHING;

-- ── ADMINS ──
INSERT INTO "Admin" ("id", "username", "passwordHash", "role", "createdAt", "updatedAt")
VALUES ('cmocdaqbn0000sonuis1jm72p', 'jose', '$2b$10$g3EaEIDnHrU80Gj.lzVbMeR/OJhxqdNEGL2dB/hjp.NMaH9Wsxdxa', 'super_admin', '2026-04-24 03:45:15.971+00:00', '2026-04-24 17:39:47.064+00:00')
ON CONFLICT ("id") DO NOTHING;

-- ── SKINS ──

-- ── CMS SETTINGS ──
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmocv1sd20000u9b138bfi9uc', 'hero_title', '', 'text', '2026-04-24 12:02:11.799+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmocv1sd30002u9b1w61xrzby', 'hero_bg_desktop', '', 'image', '2026-04-24 12:02:11.799+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmocv1sd30003u9b1wqurx2rt', 'hero_bg_mobile', '', 'image', '2026-04-24 12:02:11.799+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmocv1sd30005u9b1l0ofskod', 'hero_bg_video', 'https://youtu.be/s8CydQ-Y3Hs?list=RDs8CydQ-Y3Hs&t=3', 'text', '2026-04-24 12:02:11.800+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmocv1sd30004u9b1o6upqpqp', 'hero_tagline', '', 'text', '2026-04-24 12:02:11.799+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmocv1sd20001u9b1r6mv3t10', 'hero_subtitle', '', 'text', '2026-04-24 12:02:11.799+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmod4bhru0000u999r733ozmw', 'registration_admin_wa_link', 'https://wa.me/6281373333439', 'text', '2026-04-24 16:58:00.940+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmod4bhry0001u999e49ak15j', 'registration_payment_instructions', '', 'text', '2026-04-24 16:58:00.898+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmod4g7230031u972ivtkv17f', 'donation_qris_image', '', 'image', '2026-04-24 16:58:00.783+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmod4g75a0032u972pm7h271p', 'donation_payment_holder', 'Citra Liliana', 'text', '2026-04-24 16:58:00.791+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmod4g75k0033u972vhcuvim4', 'donation_shopeepay_number', '08123456789', 'text', '2026-04-24 16:58:00.774+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmod4g76e0034u972j9wgxsl4', 'donation_dana_number', '08123456789', 'text', '2026-04-24 16:58:00.789+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmod4g76p0035u972g89lia0r', 'donation_ovo_number', '08123456789', 'text', '2026-04-24 16:58:00.767+00:00')
ON CONFLICT ("id") DO NOTHING;
INSERT INTO "CmsSetting" ("id", "key", "value", "type", "updatedAt")
VALUES ('cmod4g7700036u972vnx8fa2d', 'donation_payment_notes', '', 'text', '2026-04-24 16:58:00.766+00:00')
ON CONFLICT ("id") DO NOTHING;

-- ── CMS SECTIONS & CARDS ──

-- ══════════════════════════════════════════════════
-- SEED COMPLETE
-- ══════════════════════════════════════════════════
