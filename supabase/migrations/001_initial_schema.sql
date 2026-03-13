-- CardClock Initial Schema
-- Table prefix: cc_ for all domain tables/columns
-- Standard columns (id, user_id, created_at, updated_at) are NOT prefixed

-- ============================================================
-- Reference Data Tables
-- ============================================================

CREATE TABLE cc_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cc_card_name TEXT NOT NULL,
  cc_issuer TEXT NOT NULL CHECK (cc_issuer IN ('amex', 'chase', 'citi', 'capital_one', 'bilt', 'barclays', 'us_bank')),
  cc_annual_fee NUMERIC(8,2) NOT NULL DEFAULT 0,
  cc_card_slug TEXT NOT NULL UNIQUE,
  cc_logo_url TEXT,
  cc_is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cc_benefits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cc_card_id UUID NOT NULL REFERENCES cc_cards(id) ON DELETE CASCADE,
  cc_benefit_name TEXT NOT NULL,
  cc_benefit_value NUMERIC(8,2) NOT NULL,
  cc_benefit_period TEXT NOT NULL CHECK (cc_benefit_period IN ('monthly', 'quarterly', 'semi_annual', 'annual')),
  cc_period_count INTEGER NOT NULL,
  cc_annual_total NUMERIC(8,2) NOT NULL,
  cc_reset_type TEXT NOT NULL DEFAULT 'calendar' CHECK (cc_reset_type IN ('calendar', 'cardmember_anniversary')),
  cc_category TEXT NOT NULL DEFAULT 'other' CHECK (cc_category IN ('dining', 'travel', 'streaming', 'shopping', 'rideshare', 'wellness', 'airline', 'hotel', 'entertainment', 'other')),
  cc_merchant_notes TEXT,
  cc_activation_required BOOLEAN NOT NULL DEFAULT false,
  cc_activation_notes TEXT,
  cc_is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- User Data Tables
-- ============================================================

CREATE TABLE cc_user_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cc_card_id UUID NOT NULL REFERENCES cc_cards(id) ON DELETE CASCADE,
  cc_card_open_date DATE,
  cc_is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, cc_card_id)
);

CREATE TABLE cc_benefit_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cc_benefit_id UUID NOT NULL REFERENCES cc_benefits(id) ON DELETE CASCADE,
  cc_user_card_id UUID NOT NULL REFERENCES cc_user_cards(id) ON DELETE CASCADE,
  cc_period_start DATE NOT NULL,
  cc_period_end DATE NOT NULL,
  cc_amount_used NUMERIC(8,2) NOT NULL DEFAULT 0,
  cc_is_fully_used BOOLEAN NOT NULL DEFAULT false,
  cc_used_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, cc_benefit_id, cc_period_start)
);

-- ============================================================
-- Analytics Tables
-- ============================================================

CREATE TABLE cc_analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  cc_session_id TEXT NOT NULL,
  cc_event_type TEXT NOT NULL,
  cc_event_name TEXT NOT NULL,
  cc_page_path TEXT,
  cc_referrer TEXT,
  cc_properties JSONB DEFAULT '{}',
  cc_device_type TEXT,
  cc_country TEXT,
  cc_duration_ms INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE cc_analytics_daily (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  cc_date DATE NOT NULL,
  cc_metric TEXT NOT NULL,
  cc_value NUMERIC(12,2) NOT NULL,
  cc_dimensions JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(cc_date, cc_metric, cc_dimensions)
);

-- ============================================================
-- Indexes
-- ============================================================

CREATE INDEX idx_cc_benefits_card_id ON cc_benefits(cc_card_id);
CREATE INDEX idx_cc_user_cards_user_id ON cc_user_cards(user_id);
CREATE INDEX idx_cc_benefit_usage_user_id ON cc_benefit_usage(user_id);
CREATE INDEX idx_cc_benefit_usage_benefit_id ON cc_benefit_usage(cc_benefit_id);
CREATE INDEX idx_cc_benefit_usage_period ON cc_benefit_usage(cc_period_start);
CREATE INDEX idx_cc_analytics_events_user ON cc_analytics_events(user_id);
CREATE INDEX idx_cc_analytics_events_name ON cc_analytics_events(cc_event_name);
CREATE INDEX idx_cc_analytics_daily_date ON cc_analytics_daily(cc_date);

-- ============================================================
-- Enable Row Level Security
-- ============================================================

ALTER TABLE cc_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_benefits ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_benefit_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE cc_analytics_daily ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- RLS Policies
-- ============================================================

-- Reference data: readable by all authenticated users
CREATE POLICY "cards_read" ON cc_cards
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "benefits_read" ON cc_benefits
  FOR SELECT TO authenticated USING (true);

-- User cards: users can only CRUD their own
CREATE POLICY "user_cards_select" ON cc_user_cards
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "user_cards_insert" ON cc_user_cards
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_cards_update" ON cc_user_cards
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_cards_delete" ON cc_user_cards
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Benefit usage: users can only CRUD their own
CREATE POLICY "usage_select" ON cc_benefit_usage
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "usage_insert" ON cc_benefit_usage
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usage_update" ON cc_benefit_usage
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usage_delete" ON cc_benefit_usage
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Analytics: insert-only for authenticated
CREATE POLICY "analytics_insert" ON cc_analytics_events
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Analytics daily: no direct user access (service role only for reads)
-- No policy = no access for authenticated users (reads via service role)

-- ============================================================
-- Updated_at trigger
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_cc_cards
  BEFORE UPDATE ON cc_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_cc_benefits
  BEFORE UPDATE ON cc_benefits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_cc_user_cards
  BEFORE UPDATE ON cc_user_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_cc_benefit_usage
  BEFORE UPDATE ON cc_benefit_usage
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
