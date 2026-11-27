-- ==============================================================================
-- PATHIXO EXPO PLATFORM: INITIAL SCHEMA MIGRATION
-- Migration: 20260101000000_init_schema.sql
-- Description: Creates all core tables, constraints, indexes, triggers, and strict RLS
-- ==============================================================================

-- 1. Helper function for updated_at timestamps
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Visitors Table (Expo attendees registered at booth)
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 2 AND char_length(full_name) <= 120),
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  mobile TEXT NOT NULL CHECK (mobile ~ '^[6-9]\d{9}$'),
  company TEXT CHECK (company IS NULL OR char_length(company) <= 150),
  designation TEXT CHECK (designation IS NULL OR char_length(designation) <= 100),
  interested_product TEXT CHECK (interested_product IS NULL OR char_length(interested_product) <= 100),
  message TEXT CHECK (message IS NULL OR char_length(message) <= 1000),
  privacy_consent BOOLEAN NOT NULL DEFAULT true CHECK (privacy_consent = true),
  privacy_consent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  marketing_consent_at TIMESTAMPTZ,
  campaign_id TEXT NOT NULL DEFAULT 'expo_mart_2026',
  registration_source TEXT NOT NULL DEFAULT 'qr_booth',
  utm_source TEXT,
  utm_medium TEXT,
  utm_campaign TEXT,
  utm_term TEXT,
  utm_content TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Unique constraints for visitor deduplication
CREATE UNIQUE INDEX IF NOT EXISTS visitors_email_lower_uidx ON public.visitors (lower(trim(email)));
CREATE UNIQUE INDEX IF NOT EXISTS visitors_mobile_uidx ON public.visitors (mobile);
CREATE INDEX IF NOT EXISTS visitors_created_at_idx ON public.visitors (created_at DESC);
CREATE INDEX IF NOT EXISTS visitors_interested_product_idx ON public.visitors (interested_product);

CREATE TRIGGER set_visitors_updated_at
  BEFORE UPDATE ON public.visitors
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 3. Products Table (Pathixo proprietary products & services showcase)
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  tagline TEXT NOT NULL,
  description TEXT NOT NULL,
  key_features JSONB NOT NULL DEFAULT '[]'::jsonb,
  destination_url TEXT,
  badge_text TEXT,
  launch_status TEXT NOT NULL DEFAULT 'coming_soon' CHECK (launch_status IN ('coming_soon', 'beta', 'live', 'internal')),
  display_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS products_is_active_order_idx ON public.products (is_active, display_order ASC);

CREATE TRIGGER set_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 4. Product Events Table (Anonymous engagement metrics)
CREATE TABLE IF NOT EXISTS public.product_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  product_slug TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS product_events_type_created_idx ON public.product_events (event_type, created_at DESC);

-- 5. Rewards Table (Spin & Win prizes and inventory)
CREATE TABLE IF NOT EXISTS public.rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  reward_type TEXT NOT NULL CHECK (reward_type IN ('discount', 'credit', 'consultation', 'merchandise', 'no_prize')),
  total_inventory INT NOT NULL DEFAULT 0 CHECK (total_inventory >= 0),
  remaining_inventory INT NOT NULL DEFAULT 0 CHECK (remaining_inventory >= 0 AND remaining_inventory <= total_inventory),
  probability_weight INT NOT NULL DEFAULT 1 CHECK (probability_weight >= 0),
  is_active BOOLEAN NOT NULL DEFAULT false,
  expiry_days INT NOT NULL DEFAULT 30 CHECK (expiry_days > 0),
  redemption_instructions TEXT NOT NULL DEFAULT 'Show this voucher code to Pathixo stall team at the Expo.',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS rewards_active_type_idx ON public.rewards (is_active, reward_type);

CREATE TRIGGER set_rewards_updated_at
  BEFORE UPDATE ON public.rewards
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 6. Spins Table (Lucky draw outcomes & vouchers)
CREATE TABLE IF NOT EXISTS public.spins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE RESTRICT UNIQUE,
  reward_id UUID NOT NULL REFERENCES public.rewards(id) ON DELETE RESTRICT,
  idempotency_key TEXT NOT NULL UNIQUE,
  reward_code TEXT NOT NULL UNIQUE,
  redemption_status TEXT NOT NULL DEFAULT 'not_redeemed' CHECK (redemption_status IN ('not_redeemed', 'redeemed', 'expired')),
  redeemed_at TIMESTAMPTZ,
  redeemed_by UUID,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS spins_reward_code_idx ON public.spins (reward_code);
CREATE INDEX IF NOT EXISTS spins_visitor_id_idx ON public.spins (visitor_id);
CREATE INDEX IF NOT EXISTS spins_created_at_idx ON public.spins (created_at DESC);

CREATE TRIGGER set_spins_updated_at
  BEFORE UPDATE ON public.spins
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 7. Business Inquiries Table (Project consultations & RFPs)
CREATE TABLE IF NOT EXISTS public.business_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (char_length(trim(full_name)) >= 2 AND char_length(full_name) <= 120),
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  mobile TEXT NOT NULL CHECK (mobile ~ '^[6-9]\d{9}$'),
  company TEXT CHECK (company IS NULL OR char_length(company) <= 150),
  service_needed TEXT CHECK (service_needed IS NULL OR char_length(service_needed) <= 100),
  project_description TEXT NOT NULL CHECK (char_length(trim(project_description)) >= 10 AND char_length(project_description) <= 3000),
  estimated_budget TEXT,
  lead_status TEXT NOT NULL DEFAULT 'new' CHECK (lead_status IN ('new', 'contacted', 'qualified', 'in_discussion', 'converted', 'closed')),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS inquiries_lead_status_created_idx ON public.business_inquiries (lead_status, created_at DESC);
CREATE INDEX IF NOT EXISTS inquiries_email_idx ON public.business_inquiries (lower(email));
CREATE INDEX IF NOT EXISTS inquiries_mobile_idx ON public.business_inquiries (mobile);

CREATE TRIGGER set_inquiries_updated_at
  BEFORE UPDATE ON public.business_inquiries
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 8. Admins Table (Role-based access mapping)
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('super_admin', 'admin', 'viewer')),
  full_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER set_admins_updated_at
  BEFORE UPDATE ON public.admins
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 9. Audit Logs Table (Administrative accountability & CSV export logs)
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_created_at_idx ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_idx ON public.audit_logs (action);

-- 10. Analytics Events Table (High-level aggregated metrics without PII)
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_date DATE NOT NULL DEFAULT CURRENT_DATE,
  counter_value INT NOT NULL DEFAULT 1,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS analytics_events_name_date_idx ON public.analytics_events (event_name, event_date);

-- ==============================================================================
-- 11. STRICT ROW LEVEL SECURITY (RLS) ENFORCEMENT
-- ==============================================================================
-- Turn RLS ON for EVERY table.
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.spins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

-- Note: We intentionally create NO policies for anon or authenticated.
-- Revoke all table, sequence, and routine privileges from anon and authenticated.
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
REVOKE ALL ON ALL ROUTINES IN SCHEMA public FROM anon, authenticated;

-- Grant access ONLY to the server service_role
GRANT ALL ON ALL TABLES IN SCHEMA public TO service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO service_role;
