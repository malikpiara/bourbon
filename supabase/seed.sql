-- Seed data for Bourbn (Hermes).
-- Inserts the Octosólido organization and its 3 stores.
-- Admin user must be created manually in Supabase Auth dashboard,
-- then linked via INSERT INTO organization_members.

-- ═══════════════════════════════════════════════════════════════════════
-- Octosólido organization (production)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO organizations (id, name, slug, designacao_social, nif)
VALUES (
  '00000000-0000-0000-0000-000000000001',
  'Octosólido',
  'octosolido',
  'Octosólido2, LDA',
  '513 579 559'
);

-- Stores (mapped from lib/constants.ts STORES array)
INSERT INTO stores (org_id, name, code, allowed_sales_types, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'Clássica',    'OCT 1', '{delivery}',          1),
  ('00000000-0000-0000-0000-000000000001', 'Moderna',     'OCT 3', '{delivery}',          2),
  ('00000000-0000-0000-0000-000000000001', 'Iluminação',  'OCT 6', '{delivery,direct}',   3);

-- ═══════════════════════════════════════════════════════════════════════
-- Test organization (dev only — remove before production)
-- ═══════════════════════════════════════════════════════════════════════

INSERT INTO organizations (id, name, slug, designacao_social, nif)
VALUES (
  '00000000-0000-0000-0000-000000000002',
  'Test Org',
  'test',
  'Test Company, LDA',
  '000 000 000'
);

INSERT INTO stores (org_id, name, code, allowed_sales_types, sort_order)
VALUES
  ('00000000-0000-0000-0000-000000000002', 'Test Store', 'TEST 1', '{delivery,direct}', 1);

-- ═══════════════════════════════════════════════════════════════════════
-- Linking admin users to organizations
-- ═══════════════════════════════════════════════════════════════════════
-- After creating an admin user in Supabase Auth dashboard, run:
--
--   INSERT INTO organization_members (user_id, org_id, role, is_default)
--   VALUES ('<user-uuid>', '00000000-0000-0000-0000-000000000001', 'admin', true);
