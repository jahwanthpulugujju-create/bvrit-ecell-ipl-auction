-- =============================================================
-- BVRIT IPL AUCTION — SPRINT 2 + 3 MIGRATION
-- Run this in Supabase Dashboard > SQL Editor
-- =============================================================

-- --------------------------------------------------------
-- 1. Drop FK constraints referencing players (player IDs are TEXT like 'p1', 'p5')
-- --------------------------------------------------------
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_player_id_fkey;
ALTER TABLE public.team_player_freezes DROP CONSTRAINT IF EXISTS team_player_freezes_player_id_fkey;
ALTER TABLE public.team_squads DROP CONSTRAINT IF EXISTS team_squads_player_id_fkey;
ALTER TABLE public.auction_log DROP CONSTRAINT IF EXISTS auction_log_player_id_fkey;
ALTER TABLE public.auction_state DROP CONSTRAINT IF EXISTS auction_state_current_player_id_fkey;

-- --------------------------------------------------------
-- 2. Change player_id / current_player_id columns from UUID to TEXT
-- --------------------------------------------------------
ALTER TABLE public.bids ALTER COLUMN player_id TYPE TEXT USING player_id::TEXT;
ALTER TABLE public.team_player_freezes ALTER COLUMN player_id TYPE TEXT USING player_id::TEXT;
ALTER TABLE public.team_squads ALTER COLUMN player_id TYPE TEXT USING player_id::TEXT;
ALTER TABLE public.auction_log ALTER COLUMN player_id TYPE TEXT USING player_id::TEXT;
ALTER TABLE public.auction_state ALTER COLUMN current_player_id TYPE TEXT USING current_player_id::TEXT;

-- --------------------------------------------------------
-- 3. Add columns to auction_state if missing
-- --------------------------------------------------------
ALTER TABLE public.auction_state ADD COLUMN IF NOT EXISTS bid_reset_seconds INTEGER NOT NULL DEFAULT 15;
ALTER TABLE public.auction_state ADD COLUMN IF NOT EXISTS bid_increment INTEGER NOT NULL DEFAULT 25;
ALTER TABLE public.auction_state ADD COLUMN IF NOT EXISTS leading_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL;
ALTER TABLE public.auction_state ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- --------------------------------------------------------
-- 4. Create team_global_cooldowns table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.team_global_cooldowns (
  team_id UUID NOT NULL PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  global_expires_at BIGINT NOT NULL DEFAULT 0,
  last_bid_at BIGINT NOT NULL DEFAULT 0
);

-- --------------------------------------------------------
-- 5. Create rtm_state singleton table
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rtm_state (
  id INTEGER NOT NULL DEFAULT 1 PRIMARY KEY CHECK (id = 1),
  active BOOLEAN NOT NULL DEFAULT false,
  player_id TEXT,
  eligible_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  matched_price INTEGER NOT NULL DEFAULT 0,
  timer_expires_at BIGINT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO public.rtm_state (id) VALUES (1) ON CONFLICT DO NOTHING;

-- --------------------------------------------------------
-- 6. Create auction_config table if missing
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.auction_config (
  id INTEGER NOT NULL DEFAULT 1 PRIMARY KEY CHECK (id = 1),
  freeze_min_seconds INTEGER NOT NULL DEFAULT 3,
  freeze_base_seconds INTEGER NOT NULL DEFAULT 3,
  freeze_increment_unit_lakhs INTEGER NOT NULL DEFAULT 20,
  freeze_increment_seconds INTEGER NOT NULL DEFAULT 2,
  freeze_max_seconds INTEGER NOT NULL DEFAULT 30,
  freeze_global_cooldown_seconds INTEGER NOT NULL DEFAULT 1,
  rtm_enabled BOOLEAN NOT NULL DEFAULT true,
  rtm_window_seconds INTEGER NOT NULL DEFAULT 30
);

INSERT INTO public.auction_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- --------------------------------------------------------
-- 7. Add unique constraint to team_player_freezes
-- --------------------------------------------------------
DO $$ BEGIN
  ALTER TABLE public.team_player_freezes
    ADD CONSTRAINT team_player_freezes_team_player_unique UNIQUE (team_id, player_id);
EXCEPTION WHEN duplicate_table THEN NULL;
END $$;

-- --------------------------------------------------------
-- 8. Seed initial auction_state row (singleton)
-- --------------------------------------------------------
INSERT INTO public.auction_state (
  status,
  current_player_id,
  current_bid_amount,
  bid_increment,
  leading_team_id,
  timer_expires_at,
  timer_running,
  current_phase,
  bid_reset_seconds
) VALUES (
  'pre',
  NULL,
  0,
  25,
  NULL,
  NULL,
  false,
  'marquee',
  15
)
ON CONFLICT DO NOTHING;

-- --------------------------------------------------------
-- 9. Create register_bid RPC (atomic bid registration)
-- --------------------------------------------------------
CREATE OR REPLACE FUNCTION public.register_bid(
  p_player_id TEXT,
  p_team_id UUID,
  p_amount INTEGER,
  p_timer_expires_at BIGINT,
  p_freeze_expires_at BIGINT,
  p_freeze_seconds INTEGER,
  p_global_expires_at BIGINT
) RETURNS void AS $$
BEGIN
  UPDATE public.auction_state SET
    current_bid_amount = p_amount,
    leading_team_id = p_team_id,
    timer_expires_at = p_timer_expires_at,
    timer_running = true,
    updated_at = now()
  WHERE id = 1;

  INSERT INTO public.team_player_freezes (team_id, player_id, freeze_expires_at, freeze_seconds, bid_amount)
  VALUES (p_team_id, p_player_id, p_freeze_expires_at, p_freeze_seconds, p_amount)
  ON CONFLICT (team_id, player_id) DO UPDATE SET
    freeze_expires_at = EXCLUDED.freeze_expires_at,
    freeze_seconds = EXCLUDED.freeze_seconds,
    bid_amount = EXCLUDED.bid_amount;

  INSERT INTO public.team_global_cooldowns (team_id, global_expires_at, last_bid_at)
  VALUES (p_team_id, p_global_expires_at, EXTRACT(EPOCH FROM now())::BIGINT * 1000)
  ON CONFLICT (team_id) DO UPDATE SET
    global_expires_at = EXCLUDED.global_expires_at,
    last_bid_at = EXCLUDED.last_bid_at;

  INSERT INTO public.auction_log (type, player_id, team_id, amount, message)
  VALUES ('bid', p_player_id, p_team_id, p_amount,
    'Bid registered for ' || p_amount || 'L. Freeze: ' || p_freeze_seconds || 's');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- --------------------------------------------------------
-- 10. Enable Realtime on all tables
-- --------------------------------------------------------
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_squads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_player_freezes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_global_cooldowns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rtm_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_config;

-- --------------------------------------------------------
-- 11. Enable RLS on all tables
-- --------------------------------------------------------
ALTER TABLE public.auction_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_player_freezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_global_cooldowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rtm_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_config ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------
-- 12. Drop old restrictive policies and create open ones
--     (security enforced at application layer)
-- --------------------------------------------------------
DROP POLICY IF EXISTS "Global cooldowns viewable by everyone" ON public.team_global_cooldowns;
DROP POLICY IF EXISTS "Auth users can manage global cooldowns" ON public.team_global_cooldowns;
DROP POLICY IF EXISTS "RTM state viewable by everyone" ON public.rtm_state;
DROP POLICY IF EXISTS "Auth users can manage RTM state" ON public.rtm_state;

-- auction_state
DROP POLICY IF EXISTS "auction_state_read" ON public.auction_state;
DROP POLICY IF EXISTS "auction_state_write" ON public.auction_state;
CREATE POLICY "auction_state_read" ON public.auction_state FOR SELECT USING (true);
CREATE POLICY "auction_state_write" ON public.auction_state FOR ALL USING (true) WITH CHECK (true);

-- teams
DROP POLICY IF EXISTS "teams_read" ON public.teams;
DROP POLICY IF EXISTS "teams_write" ON public.teams;
CREATE POLICY "teams_read" ON public.teams FOR SELECT USING (true);
CREATE POLICY "teams_write" ON public.teams FOR ALL USING (true) WITH CHECK (true);

-- team_squads
DROP POLICY IF EXISTS "squads_read" ON public.team_squads;
DROP POLICY IF EXISTS "squads_write" ON public.team_squads;
CREATE POLICY "squads_read" ON public.team_squads FOR SELECT USING (true);
CREATE POLICY "squads_write" ON public.team_squads FOR ALL USING (true) WITH CHECK (true);

-- team_player_freezes
DROP POLICY IF EXISTS "freezes_read" ON public.team_player_freezes;
DROP POLICY IF EXISTS "freezes_write" ON public.team_player_freezes;
CREATE POLICY "freezes_read" ON public.team_player_freezes FOR SELECT USING (true);
CREATE POLICY "freezes_write" ON public.team_player_freezes FOR ALL USING (true) WITH CHECK (true);

-- team_global_cooldowns
CREATE POLICY "cooldowns_read" ON public.team_global_cooldowns FOR SELECT USING (true);
CREATE POLICY "cooldowns_write" ON public.team_global_cooldowns FOR ALL USING (true) WITH CHECK (true);

-- rtm_state
CREATE POLICY "rtm_read" ON public.rtm_state FOR SELECT USING (true);
CREATE POLICY "rtm_write" ON public.rtm_state FOR ALL USING (true) WITH CHECK (true);

-- auction_log
DROP POLICY IF EXISTS "log_read" ON public.auction_log;
DROP POLICY IF EXISTS "log_write" ON public.auction_log;
CREATE POLICY "log_read" ON public.auction_log FOR SELECT USING (true);
CREATE POLICY "log_write" ON public.auction_log FOR ALL USING (true) WITH CHECK (true);

-- auction_config
CREATE POLICY "config_read" ON public.auction_config FOR SELECT USING (true);
CREATE POLICY "config_write" ON public.auction_config FOR ALL USING (true) WITH CHECK (true);

-- --------------------------------------------------------
-- 13. Grant execute on RPC to anon and authenticated
-- --------------------------------------------------------
GRANT EXECUTE ON FUNCTION public.register_bid TO anon;
GRANT EXECUTE ON FUNCTION public.register_bid TO authenticated;
