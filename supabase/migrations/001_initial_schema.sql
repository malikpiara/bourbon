-- Initial database schema for Burbbon (Hermes).
-- Tables, RLS policies, triggers, and helper functions for multi-tenant sales document management.

-- ═══════════════════════════════════════════════════════════════════════
-- Extensions
-- ═══════════════════════════════════════════════════════════════════════

CREATE EXTENSION IF NOT EXISTS pg_trgm; -- trigram index for fuzzy customer name search

-- ═══════════════════════════════════════════════════════════════════════
-- Tables
-- ═══════════════════════════════════════════════════════════════════════

-- Organizations: replaces hardcoded COMPANY_INFO
CREATE TABLE organizations (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  slug          TEXT NOT NULL UNIQUE,
  designacao_social TEXT NOT NULL,
  nif           TEXT NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Stores: replaces hardcoded STORES array
CREATE TABLE stores (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id              UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  code                TEXT NOT NULL,
  allowed_sales_types TEXT[] NOT NULL,
  sort_order          INT NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, code)
);

CREATE INDEX idx_stores_org_id ON stores(org_id);

-- Profiles: auto-created on signup via trigger
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   TEXT,
  email       TEXT,
  avatar_url  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Organization members: bridge table linking users to orgs
CREATE TABLE organization_members (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  org_id      UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  role        TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  is_default  BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, org_id)
);

CREATE INDEX idx_org_members_user_id ON organization_members(user_id);
CREATE INDEX idx_org_members_org_id ON organization_members(org_id);

-- Sales documents: hybrid normalized columns + JSONB form snapshot
CREATE TABLE sales_documents (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id            UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  store_id          UUID NOT NULL REFERENCES stores(id) ON DELETE RESTRICT,
  created_by        UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
  modified_by       UUID REFERENCES profiles(id),
  sales_type        TEXT NOT NULL CHECK (sales_type IN ('direct', 'delivery')),
  order_number      TEXT NOT NULL,
  document_date     DATE NOT NULL,
  customer_name     TEXT NOT NULL,
  customer_nif      TEXT,
  customer_phone    TEXT,
  total_amount      NUMERIC(12,2) NOT NULL,
  status            TEXT NOT NULL DEFAULT 'final' CHECK (status IN ('draft', 'final')),
  form_data         JSONB NOT NULL,
  form_data_version INT NOT NULL DEFAULT 1,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (org_id, order_number)
);

CREATE INDEX idx_sales_docs_org_id ON sales_documents(org_id);
CREATE INDEX idx_sales_docs_store_id ON sales_documents(store_id);
CREATE INDEX idx_sales_docs_created_by ON sales_documents(created_by);
CREATE INDEX idx_sales_docs_date ON sales_documents(document_date DESC);
CREATE INDEX idx_sales_docs_customer_name ON sales_documents USING gin (customer_name gin_trgm_ops);

-- Sales document items: normalized line items
CREATE TABLE sales_document_items (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID NOT NULL REFERENCES sales_documents(id) ON DELETE CASCADE,
  sort_order    INT NOT NULL DEFAULT 0,
  ref           TEXT NOT NULL DEFAULT '',
  description   TEXT NOT NULL,
  quantity      INT NOT NULL CHECK (quantity > 0),
  unit_price    NUMERIC(10,2) NOT NULL CHECK (unit_price >= 0),
  total         NUMERIC(12,2) NOT NULL
);

CREATE INDEX idx_sales_doc_items_document_id ON sales_document_items(document_id);

-- Sales document payments: normalized payment instalments
CREATE TABLE sales_document_payments (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id   UUID NOT NULL REFERENCES sales_documents(id) ON DELETE CASCADE,
  sort_order    INT NOT NULL DEFAULT 0,
  amount        NUMERIC(12,2) NOT NULL,
  payment_type  TEXT,
  payment_date  TEXT,
  label         TEXT
);

CREATE INDEX idx_sales_doc_payments_document_id ON sales_document_payments(document_id);

-- ═══════════════════════════════════════════════════════════════════════
-- Helper functions for RLS
-- ═══════════════════════════════════════════════════════════════════════

-- Returns all org IDs the current authenticated user belongs to
CREATE OR REPLACE FUNCTION get_user_org_ids()
RETURNS SETOF UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT org_id FROM organization_members WHERE user_id = auth.uid();
$$;

-- Checks if the current user is an admin in the given org
CREATE OR REPLACE FUNCTION is_org_admin(check_org_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM organization_members
    WHERE user_id = auth.uid()
      AND org_id = check_org_id
      AND role = 'admin'
  );
$$;

-- ═══════════════════════════════════════════════════════════════════════
-- Row Level Security
-- ═══════════════════════════════════════════════════════════════════════

-- Organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own orgs"
  ON organizations FOR SELECT
  USING (id IN (SELECT get_user_org_ids()));

CREATE POLICY "Admins can update their own orgs"
  ON organizations FOR UPDATE
  USING (is_org_admin(id));

-- Stores
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org stores"
  ON stores FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

-- Profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view profiles in their orgs"
  ON profiles FOR SELECT
  USING (
    id IN (
      SELECT om.user_id FROM organization_members om
      WHERE om.org_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (id = auth.uid());

-- Organization members
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view members in their orgs"
  ON organization_members FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

-- Sales documents
ALTER TABLE sales_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their org sales documents"
  ON sales_documents FOR SELECT
  USING (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can insert sales documents for their org"
  ON sales_documents FOR INSERT
  WITH CHECK (org_id IN (SELECT get_user_org_ids()));

CREATE POLICY "Users can update sales documents for their org"
  ON sales_documents FOR UPDATE
  USING (org_id IN (SELECT get_user_org_ids()));

-- No DELETE policy: sales documents are immutable

-- Sales document items
ALTER TABLE sales_document_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view items for their org documents"
  ON sales_document_items FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM sales_documents WHERE org_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "Users can insert items for their org documents"
  ON sales_document_items FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT id FROM sales_documents WHERE org_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "Users can update items for their org documents"
  ON sales_document_items FOR UPDATE
  USING (
    document_id IN (
      SELECT id FROM sales_documents WHERE org_id IN (SELECT get_user_org_ids())
    )
  );

-- Sales document payments
ALTER TABLE sales_document_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view payments for their org documents"
  ON sales_document_payments FOR SELECT
  USING (
    document_id IN (
      SELECT id FROM sales_documents WHERE org_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "Users can insert payments for their org documents"
  ON sales_document_payments FOR INSERT
  WITH CHECK (
    document_id IN (
      SELECT id FROM sales_documents WHERE org_id IN (SELECT get_user_org_ids())
    )
  );

CREATE POLICY "Users can update payments for their org documents"
  ON sales_document_payments FOR UPDATE
  USING (
    document_id IN (
      SELECT id FROM sales_documents WHERE org_id IN (SELECT get_user_org_ids())
    )
  );

-- ═══════════════════════════════════════════════════════════════════════
-- Triggers
-- ═══════════════════════════════════════════════════════════════════════

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_sales_documents
  BEFORE UPDATE ON sales_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, full_name, email)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data ->> 'full_name',
    NEW.email
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
