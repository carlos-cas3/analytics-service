-- ============================================================
-- Migration 002: Create metrics tables and RPC functions
-- Apply manually via Supabase SQL Editor
-- ============================================================

-- -----------------------------------------------------------
-- 1. Add processed column to events (if not already present)
-- -----------------------------------------------------------
ALTER TABLE events
  ADD COLUMN IF NOT EXISTS processed boolean DEFAULT false;

-- -----------------------------------------------------------
-- 2. Add auth-related columns to daily_metrics
-- -----------------------------------------------------------
ALTER TABLE daily_metrics
  ADD COLUMN IF NOT EXISTS new_users integer DEFAULT 0;
ALTER TABLE daily_metrics
  ADD COLUMN IF NOT EXISTS users_approved integer DEFAULT 0;
ALTER TABLE daily_metrics
  ADD COLUMN IF NOT EXISTS users_rejected integer DEFAULT 0;
ALTER TABLE daily_metrics
  ADD COLUMN IF NOT EXISTS login_failed_count integer DEFAULT 0;

-- -----------------------------------------------------------
-- 3. Alerts snapshot table
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS alerts_snapshot (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alert_type TEXT NOT NULL,
  description TEXT,
  severity TEXT,
  metadata JSONB DEFAULT '{}',
  detected_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------
-- 4. RPC: increment a column in daily_metrics (atomic UPSERT)
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_daily_metric(p_date date, p_column text, p_amount int)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format(
    'INSERT INTO daily_metrics (date, %I) VALUES ($1, $2)
     ON CONFLICT (date) DO UPDATE
       SET %I = daily_metrics.%I + $2,
           updated_at = now()',
    p_column, p_column, p_column
  ) USING p_date, p_amount;
END;
$$;

-- -----------------------------------------------------------
-- 5. RPC: increment a column in monthly_metrics (atomic UPSERT)
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_monthly_metric(p_month date, p_column text, p_amount int)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format(
    'INSERT INTO monthly_metrics (month, %I) VALUES ($1, $2)
     ON CONFLICT (month) DO UPDATE
       SET %I = monthly_metrics.%I + $2,
           updated_at = now()',
    p_column, p_column, p_column
  ) USING p_month, p_amount;
END;
$$;

-- -----------------------------------------------------------
-- 6. RPC: increment a column in vendor_daily_metrics (atomic UPSERT)
-- -----------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_vendor_daily_metric(p_vendor_id text, p_date date, p_column text, p_amount int)
RETURNS void
LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format(
    'INSERT INTO vendor_daily_metrics (vendor_id, date, %I) VALUES ($1, $2, $3)
     ON CONFLICT (vendor_id, date) DO UPDATE
       SET %I = vendor_daily_metrics.%I + $3,
           updated_at = now()',
    p_column, p_column, p_column
  ) USING p_vendor_id, p_date, p_amount;
END;
$$;
