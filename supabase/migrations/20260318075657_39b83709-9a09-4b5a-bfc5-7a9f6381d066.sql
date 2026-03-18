
-- Player roles enum
CREATE TYPE public.player_role AS ENUM ('batsman', 'fast-bowler', 'spinner', 'wicket-keeper', 'all-rounder');
CREATE TYPE public.player_category AS ENUM ('marquee', 'premium', 'mid-tier', 'budget');
CREATE TYPE public.player_status AS ENUM ('available', 'retained', 'live', 'pending_sale', 'sold', 'unsold');
CREATE TYPE public.auction_status AS ENUM ('pre', 'retention', 'live', 'pending_sale', 'rtm_window', 'complete');
CREATE TYPE public.auction_phase AS ENUM ('marquee', 'premium', 'mid-tier', 'budget');

-- TEAMS TABLE
CREATE TABLE public.teams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  city TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#00d4ff',
  initial_purse INTEGER NOT NULL DEFAULT 12000,
  purse INTEGER NOT NULL DEFAULT 12000,
  password_hash TEXT NOT NULL,
  rtm_remaining INTEGER NOT NULL DEFAULT 2,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Teams are viewable by everyone" ON public.teams FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert teams" ON public.teams FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Only authenticated users can update teams" ON public.teams FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Only authenticated users can delete teams" ON public.teams FOR DELETE USING (auth.uid() IS NOT NULL);

-- PLAYERS TABLE
CREATE TABLE public.players (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  franchise TEXT NOT NULL DEFAULT '',
  role player_role NOT NULL DEFAULT 'fast-bowler',
  sub_role TEXT NOT NULL DEFAULT '',
  category player_category NOT NULL DEFAULT 'budget',
  nationality TEXT NOT NULL DEFAULT 'indian',
  base_price INTEGER NOT NULL DEFAULT 20,
  batting INTEGER NOT NULL DEFAULT 5,
  bowling INTEGER NOT NULL DEFAULT 5,
  fielding INTEGER NOT NULL DEFAULT 5,
  rating NUMERIC(3,1) NOT NULL DEFAULT 5.0,
  batting_style TEXT NOT NULL DEFAULT 'RHB',
  bowling_style TEXT NOT NULL DEFAULT '',
  image_url TEXT NOT NULL DEFAULT '',
  status player_status NOT NULL DEFAULT 'available',
  sold_to_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  sold_price INTEGER,
  previous_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Players are viewable by everyone" ON public.players FOR SELECT USING (true);
CREATE POLICY "Only authenticated users can insert players" ON public.players FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Only authenticated users can update players" ON public.players FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Only authenticated users can delete players" ON public.players FOR DELETE USING (auth.uid() IS NOT NULL);

-- AUCTION STATE (singleton)
CREATE TABLE public.auction_state (
  id INTEGER NOT NULL DEFAULT 1 PRIMARY KEY CHECK (id = 1),
  status auction_status NOT NULL DEFAULT 'pre',
  current_player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  current_bid_amount INTEGER NOT NULL DEFAULT 0,
  leading_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  timer_expires_at BIGINT,
  timer_running BOOLEAN NOT NULL DEFAULT false,
  current_phase auction_phase NOT NULL DEFAULT 'marquee',
  bid_increment INTEGER NOT NULL DEFAULT 20,
  bid_reset_seconds INTEGER NOT NULL DEFAULT 15,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO public.auction_state (id) VALUES (1);

ALTER TABLE public.auction_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Auction state viewable by everyone" ON public.auction_state FOR SELECT USING (true);
CREATE POLICY "Only auth users can update auction state" ON public.auction_state FOR UPDATE USING (auth.uid() IS NOT NULL);

-- TEAM SQUADS
CREATE TABLE public.team_squads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  purchase_price INTEGER NOT NULL DEFAULT 0,
  is_retained BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, player_id)
);

ALTER TABLE public.team_squads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Squads viewable by everyone" ON public.team_squads FOR SELECT USING (true);
CREATE POLICY "Auth users can modify squads" ON public.team_squads FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can update squads" ON public.team_squads FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "Auth users can delete squads" ON public.team_squads FOR DELETE USING (auth.uid() IS NOT NULL);

-- BIDS
CREATE TABLE public.bids (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Bids viewable by everyone" ON public.bids FOR SELECT USING (true);
CREATE POLICY "Auth users can insert bids" ON public.bids FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- TEAM PLAYER FREEZES
CREATE TABLE public.team_player_freezes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id UUID NOT NULL REFERENCES public.players(id) ON DELETE CASCADE,
  freeze_expires_at BIGINT NOT NULL,
  freeze_seconds INTEGER NOT NULL,
  bid_amount INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(team_id, player_id)
);

ALTER TABLE public.team_player_freezes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Freezes viewable by everyone" ON public.team_player_freezes FOR SELECT USING (true);
CREATE POLICY "Auth users can manage freezes" ON public.team_player_freezes FOR ALL USING (auth.uid() IS NOT NULL);

-- AUCTION LOG
CREATE TABLE public.auction_log (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  player_id UUID REFERENCES public.players(id) ON DELETE SET NULL,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  amount INTEGER,
  message TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.auction_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Logs viewable by everyone" ON public.auction_log FOR SELECT USING (true);
CREATE POLICY "Auth users can insert logs" ON public.auction_log FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- AUCTION CONFIG
CREATE TABLE public.auction_config (
  id INTEGER NOT NULL DEFAULT 1 PRIMARY KEY CHECK (id = 1),
  rtm_enabled BOOLEAN NOT NULL DEFAULT true,
  rtm_cards_per_team INTEGER NOT NULL DEFAULT 2,
  rtm_window_seconds INTEGER NOT NULL DEFAULT 10,
  retention_max_per_team INTEGER NOT NULL DEFAULT 3,
  retention_cost_first INTEGER NOT NULL DEFAULT 1500,
  retention_cost_second INTEGER NOT NULL DEFAULT 1100,
  retention_cost_third INTEGER NOT NULL DEFAULT 700,
  show_homepage_stats BOOLEAN NOT NULL DEFAULT false,
  event_start TEXT NOT NULL DEFAULT '2026-03-25T10:00:00+05:30',
  freeze_min_seconds INTEGER NOT NULL DEFAULT 3,
  freeze_base_seconds INTEGER NOT NULL DEFAULT 3,
  freeze_increment_unit_lakhs INTEGER NOT NULL DEFAULT 20,
  freeze_increment_seconds INTEGER NOT NULL DEFAULT 2,
  freeze_max_seconds INTEGER NOT NULL DEFAULT 30,
  freeze_global_cooldown_seconds INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

INSERT INTO public.auction_config (id) VALUES (1);

ALTER TABLE public.auction_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Config viewable by everyone" ON public.auction_config FOR SELECT USING (true);
CREATE POLICY "Auth users can update config" ON public.auction_config FOR UPDATE USING (auth.uid() IS NOT NULL);

-- ANNOUNCEMENTS
CREATE TABLE public.announcements (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Announcements viewable by everyone" ON public.announcements FOR SELECT USING (true);
CREATE POLICY "Auth users can insert announcements" ON public.announcements FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- TRIGGERS
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_auction_state_updated_at BEFORE UPDATE ON public.auction_state FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_auction_config_updated_at BEFORE UPDATE ON public.auction_config FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- INDEXES
CREATE INDEX idx_players_status ON public.players(status);
CREATE INDEX idx_players_category ON public.players(category);
CREATE INDEX idx_players_role ON public.players(role);
CREATE INDEX idx_bids_player ON public.bids(player_id);
CREATE INDEX idx_bids_team ON public.bids(team_id);
CREATE INDEX idx_team_squads_team ON public.team_squads(team_id);
CREATE INDEX idx_team_player_freezes_lookup ON public.team_player_freezes(team_id, player_id);
CREATE INDEX idx_auction_log_type ON public.auction_log(type);
