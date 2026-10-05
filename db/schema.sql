-- ============================================================
-- ODTHAN — schema PostgreSQL unifie (ecosysteme complet)
-- Applique une seule fois : psql "$DATABASE_URL" -f db/schema.sql
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- 1. SITE PUBLIC — reglages simples (numero WhatsApp affiche, etc.)
-- ============================================================
CREATE TABLE IF NOT EXISTS site_settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
INSERT INTO site_settings (key, value) VALUES
  ('whatsapp_number', '+50955561461')
ON CONFLICT (key) DO NOTHING;

-- Reglages structures geres par l'Admin Center (infos entreprise, etc.)
CREATE TABLE IF NOT EXISTS admin_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. RBAC — equipe Odthan (Admin Center)
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT UNIQUE NOT NULL CHECK (name IN ('SUPER_ADMIN','ADMIN','MANAGER','AGENT','ACCOUNTANT')),
  label       TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS permissions (
  id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key     TEXT UNIQUE NOT NULL,
  module  TEXT NOT NULL,
  label   TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS role_permissions (
  role_id       UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS admin_profiles (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  phone          TEXT,
  role_id        UUID NOT NULL REFERENCES roles(id),
  status         TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE','SUSPENDED')),
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until   TIMESTAMPTZ,
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS admin_password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  token_hash  TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 3. COMPTES CLIENTS (portail client)
-- ============================================================
CREATE TABLE IF NOT EXISTS client_accounts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT UNIQUE NOT NULL,
  password_hash  TEXT NOT NULL,
  first_name     TEXT NOT NULL,
  last_name      TEXT NOT NULL,
  phone          TEXT,
  status         TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  email_verified_at TIMESTAMPTZ,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  locked_until   TIMESTAMPTZ,
  last_login_at  TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS client_password_reset_tokens (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email       TEXT NOT NULL,
  token_hash  TEXT UNIQUE NOT NULL,
  expires_at  TIMESTAMPTZ NOT NULL,
  used_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 4. CLIENTS (fiches — cote equipe, liees a 0 ou 1 compte client)
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  account_id    UUID REFERENCES client_accounts(id) ON DELETE SET NULL,
  first_name    TEXT NOT NULL,
  last_name     TEXT NOT NULL,
  company       TEXT,
  email         TEXT,
  phone         TEXT,
  whatsapp      TEXT,
  address       TEXT,
  country       TEXT,
  city          TEXT,
  status        TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients (email);
CREATE INDEX IF NOT EXISTS idx_clients_account ON clients (account_id);

-- ============================================================
-- 5. SERVICES
-- ============================================================
CREATE TABLE IF NOT EXISTS service_categories (
  id    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name  TEXT UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS services (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  description   TEXT,
  price         NUMERIC(12,2) NOT NULL DEFAULT 0,
  category_id   UUID REFERENCES service_categories(id),
  image_url     TEXT,
  status        TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','INACTIVE')),
  steps         JSONB,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 6. DEMANDES (unifie les anciennes tables d'intake public + demandes internes)
-- ============================================================
CREATE TABLE IF NOT EXISTS requests (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number        TEXT UNIQUE NOT NULL,
  client_id     UUID NOT NULL REFERENCES clients(id),
  service_id    UUID REFERENCES services(id),
  source        TEXT NOT NULL DEFAULT 'admin' CHECK (source IN ('admin','contact_form','start_business_form','booking_form','client_portal')),
  description   TEXT,
  status        TEXT NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW','REVIEWING','APPROVED','IN_PROGRESS','WAITING_CLIENT','COMPLETED','CANCELLED')),
  priority      TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
  assignee_id   UUID REFERENCES admin_profiles(id),
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests (status);
CREATE INDEX IF NOT EXISTS idx_requests_client ON requests (client_id);

CREATE TABLE IF NOT EXISTS request_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id  UUID NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------- Formulaires publics d'intake (conserves tels quels + lies a une demande) ----------
CREATE TABLE IF NOT EXISTS leads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  phone       TEXT NOT NULL,
  whatsapp    TEXT,
  email       TEXT NOT NULL,
  city        TEXT,
  department  TEXT,
  message     TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  source_ip   TEXT,
  client_id   UUID REFERENCES clients(id),
  request_id  UUID REFERENCES requests(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS business_starts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  whatsapp       TEXT,
  email          TEXT NOT NULL,
  city           TEXT,
  department     TEXT,
  business_name  TEXT,
  industry       TEXT,
  description    TEXT NOT NULL,
  budget         TEXT,
  needs          TEXT,
  website_yn     BOOLEAN DEFAULT false,
  shop_yn        BOOLEAN DEFAULT false,
  facebook_yn    BOOLEAN DEFAULT false,
  instagram_yn   BOOLEAN DEFAULT false,
  seo_yn         BOOLEAN DEFAULT false,
  extra          TEXT,
  status         TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new','contacted','closed')),
  source_ip      TEXT,
  client_id      UUID REFERENCES clients(id),
  request_id     UUID REFERENCES requests(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS bookings (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service        TEXT NOT NULL,
  consult_type   TEXT NOT NULL CHECK (consult_type IN ('online','person')),
  slot_date      DATE NOT NULL,
  slot_time      TIME NOT NULL,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  whatsapp       TEXT,
  email          TEXT NOT NULL,
  city           TEXT,
  department     TEXT,
  message        TEXT,
  status         TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed','cancelled','completed')),
  source_ip      TEXT,
  client_id      UUID REFERENCES clients(id),
  request_id     UUID REFERENCES requests(id),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS bookings_unique_active_slot
  ON bookings (slot_date, slot_time) WHERE status = 'confirmed';

-- ============================================================
-- 7. COMMANDES / DOSSIERS
-- ============================================================
CREATE TABLE IF NOT EXISTS orders (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number        TEXT UNIQUE NOT NULL,
  client_id     UUID NOT NULL REFERENCES clients(id),
  request_id    UUID UNIQUE REFERENCES requests(id),
  amount        NUMERIC(12,2) NOT NULL DEFAULT 0,
  amount_paid   NUMERIC(12,2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING','CONFIRMED','IN_PROGRESS','WAITING_PAYMENT','WAITING_CLIENT','COMPLETED','CANCELLED')),
  assignee_id   UUID REFERENCES admin_profiles(id),
  due_date      DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders (client_id);

CREATE TABLE IF NOT EXISTS order_items (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  service_id  UUID NOT NULL REFERENCES services(id),
  quantity    INTEGER NOT NULL DEFAULT 1,
  unit_price  NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS order_history (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id    UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status      TEXT NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 8. PAIEMENTS / FACTURES
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number      TEXT UNIQUE NOT NULL,
  client_id   UUID NOT NULL REFERENCES clients(id),
  order_id    UUID REFERENCES orders(id),
  amount      NUMERIC(12,2) NOT NULL,
  currency    TEXT NOT NULL DEFAULT 'HTG',
  method      TEXT NOT NULL CHECK (method IN ('CASH','BANK_TRANSFER','MONCASH','NATCASH','CARD','OTHER')),
  status      TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('PENDING','CONFIRMED','CANCELLED')),
  reference   TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payments_client ON payments (client_id);

CREATE TABLE IF NOT EXISTS invoices (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number        TEXT UNIQUE NOT NULL,
  client_id     UUID NOT NULL REFERENCES clients(id),
  order_id      UUID REFERENCES orders(id),
  subtotal      NUMERIC(12,2) NOT NULL,
  discount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  total         NUMERIC(12,2) NOT NULL,
  amount_paid   NUMERIC(12,2) NOT NULL DEFAULT 0,
  status        TEXT NOT NULL DEFAULT 'DRAFT' CHECK (status IN ('DRAFT','SENT','PAID','PARTIALLY_PAID','CANCELLED')),
  issued_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date      DATE
);

-- ============================================================
-- 9. DOCUMENTS (prives — jamais d'URL publique, voir api/admin/documents)
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            TEXT NOT NULL CHECK (type IN ('CLIENT','COMPANY','CONTRACT','INVOICE','WORK_FILE','FINAL_DELIVERABLE')),
  mime_type       TEXT NOT NULL,
  size_bytes      INTEGER NOT NULL,
  storage_key     TEXT NOT NULL,
  client_id       UUID REFERENCES clients(id),
  order_id        UUID REFERENCES orders(id),
  request_id      UUID REFERENCES requests(id),
  uploaded_by_id  UUID NOT NULL REFERENCES admin_profiles(id),
  is_private      BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 10. TACHES
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title         TEXT NOT NULL,
  description   TEXT,
  assignee_id   UUID REFERENCES admin_profiles(id),
  priority      TEXT NOT NULL DEFAULT 'MEDIUM' CHECK (priority IN ('LOW','MEDIUM','HIGH','URGENT')),
  status        TEXT NOT NULL DEFAULT 'TODO' CHECK (status IN ('TODO','IN_PROGRESS','COMPLETED','CANCELLED')),
  due_date      DATE,
  order_id      UUID REFERENCES orders(id),
  client_id     UUID REFERENCES clients(id),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 11. NOTIFICATIONS (equipe)
-- ============================================================
CREATE TABLE IF NOT EXISTS notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id  UUID NOT NULL REFERENCES admin_profiles(id) ON DELETE CASCADE,
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT,
  link        TEXT,
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_profile ON notifications (profile_id, read_at);

-- ============================================================
-- 12. MESSAGES (equipe <-> client, portail client inclus)
-- ============================================================
CREATE TABLE IF NOT EXISTS conversations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subject     TEXT,
  client_id   UUID REFERENCES clients(id),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS conversation_admin_participants (
  conversation_id  UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  profile_id       UUID NOT NULL REFERENCES admin_profiles(id) ON DELETE CASCADE,
  PRIMARY KEY (conversation_id, profile_id)
);

CREATE TABLE IF NOT EXISTS messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_type     TEXT NOT NULL CHECK (sender_type IN ('admin','client')),
  sender_admin_id UUID REFERENCES admin_profiles(id),
  sender_client_id UUID REFERENCES client_accounts(id),
  body            TEXT NOT NULL,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages (conversation_id);

-- ============================================================
-- 13. ANALYTICS VISITEURS (detaille: pages vues, referrer, pays/ville approx.)
-- ============================================================
CREATE TABLE IF NOT EXISTS analytics_sessions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id        TEXT NOT NULL,          -- identifiant anonyme cote navigateur (cookie non-nominatif, 1 an)
  client_account_id UUID REFERENCES client_accounts(id), -- rempli si le visiteur est connecte en tant que client
  first_seen_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  country           TEXT,
  city              TEXT,
  user_agent        TEXT
);
CREATE INDEX IF NOT EXISTS idx_analytics_sessions_visitor ON analytics_sessions (visitor_id);

CREATE TABLE IF NOT EXISTS analytics_events (
  id            BIGSERIAL PRIMARY KEY,
  session_id    UUID NOT NULL REFERENCES analytics_sessions(id) ON DELETE CASCADE,
  site          TEXT NOT NULL CHECK (site IN ('www','business')),
  path          TEXT NOT NULL,
  referrer      TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_path ON analytics_events (path);

-- ============================================================
-- 14. RATE LIMITING (persistant — fonctions serverless sans etat partage)
-- ============================================================
CREATE TABLE IF NOT EXISTS rate_limits (
  bucket_key   TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  count        INTEGER NOT NULL DEFAULT 1,
  PRIMARY KEY (bucket_key, window_start)
);

-- ============================================================
-- 15. AUDIT LOG (equipe + systeme — lecture seule depuis l'admin)
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_logs (
  id          BIGSERIAL PRIMARY KEY,
  actor_type  TEXT CHECK (actor_type IN ('admin','client','system')),
  actor_id    UUID,
  action      TEXT NOT NULL,
  module      TEXT NOT NULL,
  target_id   TEXT,
  ip          TEXT,
  result      TEXT NOT NULL DEFAULT 'SUCCESS',
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_module ON audit_logs (module);

CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bookings_created ON bookings (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_business_starts_created ON business_starts (created_at DESC);
