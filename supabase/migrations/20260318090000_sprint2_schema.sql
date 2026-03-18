-- Sprint 2: Add global cooldowns, RTM state, fix player_id to TEXT, register_bid RPC

-- 1. Drop FK constraints that reference players (player IDs are now TEXT like 'p1', 'p5')
ALTER TABLE public.bids DROP CONSTRAINT IF EXISTS bids_player_id_fkey;
ALTER TABLE public.team_player_freezes DROP CONSTRAINT IF EXISTS team_player_freezes_player_id_fkey;
ALTER TABLE public.team_squads DROP CONSTRAINT IF EXISTS team_squads_player_id_fkey;
ALTER TABLE public.auction_log DROP CONSTRAINT IF EXISTS auction_log_player_id_fkey;
ALTER TABLE public.auction_state DROP CONSTRAINT IF EXISTS auction_state_current_player_id_fkey;

-- 2. Change player_id / current_player_id columns from UUID to TEXT
ALTER TABLE public.bids ALTER COLUMN player_id TYPE TEXT USING player_id::TEXT;
ALTER TABLE public.team_player_freezes ALTER COLUMN player_id TYPE TEXT USING player_id::TEXT;
ALTER TABLE public.team_squads ALTER COLUMN player_id TYPE TEXT USING player_id::TEXT;
ALTER TABLE public.auction_log ALTER COLUMN player_id TYPE TEXT USING player_id::TEXT;
ALTER TABLE public.auction_state ALTER COLUMN current_player_id TYPE TEXT USING current_player_id::TEXT;

-- 3. Add bid_reset_seconds to auction_state (if not present)
ALTER TABLE public.auction_state ADD COLUMN IF NOT EXISTS bid_reset_seconds INTEGER NOT NULL DEFAULT 15;

-- 4. Create team_global_cooldowns table
CREATE TABLE IF NOT EXISTS public.team_global_cooldowns (
  team_id UUID NOT NULL PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  global_expires_at BIGINT NOT NULL DEFAULT 0,
  last_bid_at BIGINT NOT NULL DEFAULT 0
);

ALTER TABLE public.team_global_cooldowns ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Global cooldowns viewable by everyone" ON public.team_global_cooldowns FOR SELECT USING (true);
CREATE POLICY "Auth users can manage global cooldowns" ON public.team_global_cooldowns FOR ALL USING (auth.uid() IS NOT NULL);

-- 5. Create rtm_state singleton table
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

ALTER TABLE public.rtm_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "RTM state viewable by everyone" ON public.rtm_state FOR SELECT USING (true);
CREATE POLICY "Auth users can manage RTM state" ON public.rtm_state FOR ALL USING (auth.uid() IS NOT NULL);

CREATE TRIGGER update_rtm_state_updated_at
  BEFORE UPDATE ON public.rtm_state
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Create register_bid RPC (atomic bid registration)
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
  -- Update auction state with new bid
  UPDATE public.auction_state SET
    current_bid_amount = p_amount,
    leading_team_id = p_team_id,
    timer_expires_at = p_timer_expires_at,
    timer_running = true,
    updated_at = now()
  WHERE id = 1;

  -- Upsert player-specific freeze
  INSERT INTO public.team_player_freezes (team_id, player_id, freeze_expires_at, freeze_seconds, bid_amount)
  VALUES (p_team_id, p_player_id, p_freeze_expires_at, p_freeze_seconds, p_amount)
  ON CONFLICT (team_id, player_id) DO UPDATE SET
    freeze_expires_at = EXCLUDED.freeze_expires_at,
    freeze_seconds = EXCLUDED.freeze_seconds,
    bid_amount = EXCLUDED.bid_amount;

  -- Upsert global cooldown for the team
  INSERT INTO public.team_global_cooldowns (team_id, global_expires_at, last_bid_at)
  VALUES (p_team_id, p_global_expires_at, EXTRACT(EPOCH FROM now())::BIGINT * 1000)
  ON CONFLICT (team_id) DO UPDATE SET
    global_expires_at = EXCLUDED.global_expires_at,
    last_bid_at = EXCLUDED.last_bid_at;

  -- Log the bid
  INSERT INTO public.auction_log (type, player_id, team_id, amount, message)
  VALUES ('bid', p_player_id, p_team_id, p_amount,
    'Bid registered for ' || p_amount || 'L. Freeze: ' || p_freeze_seconds || 's');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
