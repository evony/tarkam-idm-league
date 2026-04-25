-- ============================================================
-- INSERT ADMIN SAJA — kalau data player/club sudah ada
-- tapi Admin belum ada di database (login 401)
--
-- Username: jose
-- Password: tazevsta
-- Role: super_admin
-- Hash: scrypt (compatible dengan app auth)
-- ============================================================

-- Hapus admin lama kalau ada (opsional, uncomment kalau perlu)
-- DELETE FROM "Admin" WHERE "username" = 'jose';

INSERT INTO "Admin" ("id", "username", "passwordHash", "role", "createdAt", "updatedAt") VALUES
  ('adm_1', 'jose', '52b05cc60af1e7317dcba3dbc09671a0:78f1765478e5f6b41c050cffe6761aef21309495ec71fdd011319ab9f5c48f4be8d8ceaaa33de0b434fa0ee2a974440c3f31a742387b2ec7f70cdc0d8917bf9d', 'super_admin', '2025-01-01 00:00:00+00', '2025-01-01 00:00:00+00')
ON CONFLICT ("id") DO NOTHING;
