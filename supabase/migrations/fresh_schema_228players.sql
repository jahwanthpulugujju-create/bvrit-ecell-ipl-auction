-- =============================================================
-- BVRIT IPL AUCTION — FRESH SCHEMA + 228 PLAYERS
-- Paste ALL of this into Supabase Dashboard > SQL Editor > Run
-- =============================================================

-- ── TABLES ───────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  color TEXT NOT NULL DEFAULT '#6366f1',
  logo TEXT,
  budget INTEGER NOT NULL DEFAULT 1200,
  remaining_budget INTEGER NOT NULL DEFAULT 1200,
  rtm_count INTEGER NOT NULL DEFAULT 2,
  password_hash TEXT NOT NULL DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.players (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  franchise TEXT NOT NULL,
  role TEXT NOT NULL,
  sub_role TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'budget',
  nationality TEXT NOT NULL DEFAULT 'indian',
  base_price INTEGER NOT NULL DEFAULT 20,
  batting NUMERIC NOT NULL DEFAULT 5,
  bowling NUMERIC NOT NULL DEFAULT 5,
  fielding NUMERIC NOT NULL DEFAULT 5,
  rating NUMERIC NOT NULL DEFAULT 5,
  batting_style TEXT NOT NULL DEFAULT 'RHB',
  bowling_style TEXT NOT NULL DEFAULT '—',
  photo TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'available',
  sold_to_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  sold_price INTEGER,
  previous_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS public.auction_state (
  id INTEGER NOT NULL DEFAULT 1 PRIMARY KEY CHECK (id = 1),
  status TEXT NOT NULL DEFAULT 'pre',
  current_player_id TEXT,
  current_bid_amount INTEGER NOT NULL DEFAULT 0,
  leading_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  timer_expires_at BIGINT,
  timer_running BOOLEAN NOT NULL DEFAULT false,
  current_phase TEXT NOT NULL DEFAULT 'marquee',
  bid_increment INTEGER NOT NULL DEFAULT 25,
  bid_reset_seconds INTEGER NOT NULL DEFAULT 15,
  auction_queue JSONB NOT NULL DEFAULT '[]'::JSONB,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.auction_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT NOT NULL,
  player_id TEXT,
  team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  amount INTEGER,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.team_squads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  purchase_price INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (team_id, player_id)
);

CREATE TABLE IF NOT EXISTS public.team_player_freezes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  player_id TEXT NOT NULL,
  freeze_expires_at BIGINT NOT NULL DEFAULT 0,
  freeze_seconds INTEGER NOT NULL DEFAULT 0,
  bid_amount INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT team_player_freezes_team_player_unique UNIQUE (team_id, player_id)
);

CREATE TABLE IF NOT EXISTS public.team_global_cooldowns (
  team_id UUID NOT NULL PRIMARY KEY REFERENCES public.teams(id) ON DELETE CASCADE,
  global_expires_at BIGINT NOT NULL DEFAULT 0,
  last_bid_at BIGINT NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS public.rtm_state (
  id INTEGER NOT NULL DEFAULT 1 PRIMARY KEY CHECK (id = 1),
  active BOOLEAN NOT NULL DEFAULT false,
  player_id TEXT,
  eligible_team_id UUID REFERENCES public.teams(id) ON DELETE SET NULL,
  matched_price INTEGER NOT NULL DEFAULT 0,
  timer_expires_at BIGINT,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

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

-- ── SEED SINGLETON ROWS ───────────────────────────────────────

INSERT INTO public.auction_state (id) VALUES (1) ON CONFLICT DO NOTHING;
INSERT INTO public.rtm_state (id) VALUES (1) ON CONFLICT DO NOTHING;
INSERT INTO public.auction_config (id) VALUES (1) ON CONFLICT DO NOTHING;

-- ── RLS ───────────────────────────────────────────────────────

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_player_freezes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_global_cooldowns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rtm_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_config ENABLE ROW LEVEL SECURITY;

-- teams
CREATE POLICY "teams_sel" ON public.teams FOR SELECT USING (true);
CREATE POLICY "teams_ins" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "teams_upd" ON public.teams FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "teams_del" ON public.teams FOR DELETE USING (true);
-- players
CREATE POLICY "players_sel" ON public.players FOR SELECT USING (true);
CREATE POLICY "players_ins" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "players_upd" ON public.players FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "players_del" ON public.players FOR DELETE USING (true);
-- auction_state
CREATE POLICY "as_sel" ON public.auction_state FOR SELECT USING (true);
CREATE POLICY "as_ins" ON public.auction_state FOR INSERT WITH CHECK (true);
CREATE POLICY "as_upd" ON public.auction_state FOR UPDATE USING (true) WITH CHECK (true);
-- auction_log
CREATE POLICY "al_sel" ON public.auction_log FOR SELECT USING (true);
CREATE POLICY "al_ins" ON public.auction_log FOR INSERT WITH CHECK (true);
-- team_squads
CREATE POLICY "ts_sel" ON public.team_squads FOR SELECT USING (true);
CREATE POLICY "ts_ins" ON public.team_squads FOR INSERT WITH CHECK (true);
CREATE POLICY "ts_upd" ON public.team_squads FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "ts_del" ON public.team_squads FOR DELETE USING (true);
-- team_player_freezes
CREATE POLICY "tpf_sel" ON public.team_player_freezes FOR SELECT USING (true);
CREATE POLICY "tpf_ins" ON public.team_player_freezes FOR INSERT WITH CHECK (true);
CREATE POLICY "tpf_upd" ON public.team_player_freezes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "tpf_del" ON public.team_player_freezes FOR DELETE USING (true);
-- team_global_cooldowns
CREATE POLICY "tgc_sel" ON public.team_global_cooldowns FOR SELECT USING (true);
CREATE POLICY "tgc_ins" ON public.team_global_cooldowns FOR INSERT WITH CHECK (true);
CREATE POLICY "tgc_upd" ON public.team_global_cooldowns FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "tgc_del" ON public.team_global_cooldowns FOR DELETE USING (true);
-- rtm_state
CREATE POLICY "rtm_sel" ON public.rtm_state FOR SELECT USING (true);
CREATE POLICY "rtm_ins" ON public.rtm_state FOR INSERT WITH CHECK (true);
CREATE POLICY "rtm_upd" ON public.rtm_state FOR UPDATE USING (true) WITH CHECK (true);
-- auction_config
CREATE POLICY "cfg_sel" ON public.auction_config FOR SELECT USING (true);
CREATE POLICY "cfg_ins" ON public.auction_config FOR INSERT WITH CHECK (true);
CREATE POLICY "cfg_upd" ON public.auction_config FOR UPDATE USING (true) WITH CHECK (true);

-- ── GRANTS ────────────────────────────────────────────────────

GRANT ALL ON public.teams TO anon, authenticated;
GRANT ALL ON public.players TO anon, authenticated;
GRANT ALL ON public.auction_state TO anon, authenticated;
GRANT ALL ON public.auction_log TO anon, authenticated;
GRANT ALL ON public.team_squads TO anon, authenticated;
GRANT ALL ON public.team_player_freezes TO anon, authenticated;
GRANT ALL ON public.team_global_cooldowns TO anon, authenticated;
GRANT ALL ON public.rtm_state TO anon, authenticated;
GRANT ALL ON public.auction_config TO anon, authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ── REALTIME ─────────────────────────────────────────────────

ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.teams;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_squads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_player_freezes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.team_global_cooldowns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.rtm_state;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_log;
ALTER PUBLICATION supabase_realtime ADD TABLE public.auction_config;

-- ── REGISTER_BID RPC ──────────────────────────────────────────

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

GRANT EXECUTE ON FUNCTION public.register_bid TO anon, authenticated;

-- ── 228 PLAYERS ───────────────────────────────────────────────
-- columns: id, name, franchise, role, sub_role, category, nationality,
--          base_price, batting, bowling, fielding, rating,
--          batting_style, bowling_style, photo, status,
--          sold_to_team_id, sold_price, previous_team_id

INSERT INTO public.players
  (id, name, franchise, role, sub_role, category, nationality,
   base_price, batting, bowling, fielding, rating,
   batting_style, bowling_style, photo, status,
   sold_to_team_id, sold_price, previous_team_id)
VALUES
('p1',E'Matt Henry',E'Chennai Super Kings','fast-bowler',E'Right-arm Fast Medium','mid-tier','overseas',50,2,6,5,6.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Matt%20Henry&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p2',E'Khaleel Ahmed',E'Chennai Super Kings','fast-bowler',E'Left-arm Fast Medium','premium','indian',100,3,8,6,7.8,'RHB',E'Left-arm Fast Medium','https://ui-avatars.com/api/?name=Khaleel%20Ahmed&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p3',E'Mukesh Choudhary',E'Chennai Super Kings','fast-bowler',E'Left-arm Fast Medium','budget','indian',20,2,5,4,4.5,'LHB',E'Left-arm Fast Medium','https://ui-avatars.com/api/?name=Mukesh%20Choudhary&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p4',E'Noor Ahmad',E'Chennai Super Kings','spinner',E'Left-arm Unorthodox Spin','budget','overseas',20,2,5,4,4.5,'RHB',E'Left-arm Unorthodox Spin','https://ui-avatars.com/api/?name=Noor%20Ahmad&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p5',E'Akeal Hosein',E'Chennai Super Kings','spinner',E'Left-arm Slow Orthodox','budget','overseas',20,2,5,4,4.5,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Akeal%20Hosein&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p6',E'Rahul Chahar',E'Chennai Super Kings','spinner',E'Right-arm Leg Spin','mid-tier','indian',50,2,6,5,6.2,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Rahul%20Chahar&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p7',E'Mitchell Starc',E'Delhi Capitals','fast-bowler',E'Left-arm Fast','marquee','overseas',200,3,10,7,9.3,'LHB',E'Left-arm Fast','https://ui-avatars.com/api/?name=Mitchell%20Starc&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p8',E'Kuldeep Yadav',E'Delhi Capitals','spinner',E'Left-arm Unorthodox Spin','marquee','indian',200,3,10,7,8.6,'LHB',E'Left-arm Unorthodox Spin','https://ui-avatars.com/api/?name=Kuldeep%20Yadav&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p9',E'Mukesh Kumar',E'Delhi Capitals','fast-bowler',E'Right-arm Fast Medium','premium','indian',100,3,8,6,7.8,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Mukesh%20Kumar&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p10',E'T Natarajan',E'Delhi Capitals','fast-bowler',E'Left-arm Fast Medium','premium','indian',100,3,8,6,7.8,'LHB',E'Left-arm Fast Medium','https://ui-avatars.com/api/?name=T%20Natarajan&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p11',E'Dushmantha Chameera',E'Delhi Capitals','fast-bowler',E'Right-arm Fast','budget','overseas',20,2,5,4,4.5,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Dushmantha%20Chameera&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p12',E'Lungi Ngidi',E'Delhi Capitals','fast-bowler',E'Right-arm Fast','mid-tier','overseas',50,2,6,5,6.2,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Lungi%20Ngidi&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p13',E'Kyle Jamieson',E'Delhi Capitals','fast-bowler',E'Right-arm Fast Medium','mid-tier','overseas',50,2,6,5,6.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Kyle%20Jamieson&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p14',E'Kagiso Rabada',E'Gujarat Titans','fast-bowler',E'Right-arm Fast','marquee','overseas',200,3,10,7,9.1,'LHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Kagiso%20Rabada&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p15',E'Mohammed Siraj',E'Gujarat Titans','fast-bowler',E'Right-arm Fast','marquee','indian',200,3,10,7,8.4,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Mohammed%20Siraj&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p16',E'Prasidh Krishna',E'Gujarat Titans','fast-bowler',E'Right-arm Fast','mid-tier','indian',50,2,6,5,6.2,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Prasidh%20Krishna&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p17',E'Ishant Sharma',E'Gujarat Titans','fast-bowler',E'Right-arm Fast Medium','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Ishant%20Sharma&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p18',E'Rashid Khan',E'Gujarat Titans','spinner',E'Right-arm Leg Spin','marquee','overseas',200,3,10,7,9.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Rashid%20Khan&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p19',E'Manav Suthar',E'Gujarat Titans','spinner',E'Left-arm Slow Orthodox','budget','indian',20,2,5,4,4.5,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Manav%20Suthar&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p20',E'Sai Kishore',E'Gujarat Titans','spinner',E'Left-arm Slow Orthodox','budget','indian',20,2,5,4,4.5,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Sai%20Kishore&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p21',E'Ashok Sharma',E'Gujarat Titans','fast-bowler',E'Right-arm Fast','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Ashok%20Sharma&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p22',E'Prithvi Raj',E'Gujarat Titans','fast-bowler',E'Left-arm Fast Medium','budget','indian',20,2,5,4,4.5,'RHB',E'Left-arm Fast Medium','https://ui-avatars.com/api/?name=Prithvi%20Raj&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p23',E'Luke Wood',E'Gujarat Titans','fast-bowler',E'Left-arm Fast','budget','overseas',20,2,5,4,4.5,'LHB',E'Left-arm Fast','https://ui-avatars.com/api/?name=Luke%20Wood&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p24',E'Varun Chakaravarthy',E'Kolkata Knight Riders','spinner',E'Right-arm Leg Spin','premium','indian',100,3,8,6,8.2,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Varun%20Chakaravarthy&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p25',E'Harshit Rana',E'Kolkata Knight Riders','fast-bowler',E'Right-arm Fast Medium','mid-tier','indian',50,2,6,5,6.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Harshit%20Rana&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p26',E'Vaibhav Arora',E'Kolkata Knight Riders','fast-bowler',E'Right-arm Fast Medium','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Vaibhav%20Arora&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p27',E'Umran Malik',E'Kolkata Knight Riders','fast-bowler',E'Right-arm Fast','premium','indian',100,3,8,6,7.5,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Umran%20Malik&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p28',E'Matheesha Pathirana',E'Kolkata Knight Riders','fast-bowler',E'Right-arm Fast','premium','overseas',100,3,8,6,8.3,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Matheesha%20Pathirana&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p29',E'Prashant Solanki',E'Kolkata Knight Riders','spinner',E'Right-arm Leg Spin','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Prashant%20Solanki&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p30',E'Mohammed Shami',E'Lucknow Super Giants','fast-bowler',E'Right-arm Fast','marquee','indian',200,3,10,7,9.2,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Mohammed%20Shami&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p31',E'Mayank Yadav',E'Lucknow Super Giants','fast-bowler',E'Right-arm Fast','premium','indian',100,3,8,6,7.6,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Mayank%20Yadav&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p32',E'Mohsin Khan',E'Lucknow Super Giants','fast-bowler',E'Left-arm Fast Medium','mid-tier','indian',50,2,6,5,6.2,'LHB',E'Left-arm Fast Medium','https://ui-avatars.com/api/?name=Mohsin%20Khan&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p33',E'Avesh Khan',E'Lucknow Super Giants','fast-bowler',E'Right-arm Fast Medium','mid-tier','indian',50,2,6,5,6.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Avesh%20Khan&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p34',E'M Siddharth',E'Lucknow Super Giants','spinner',E'Left-arm Slow Orthodox','budget','indian',20,2,5,4,4.5,'RHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=M%20Siddharth&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p35',E'Jasprit Bumrah',E'Mumbai Indians','fast-bowler',E'Right-arm Fast','marquee','indian',200,3,10,7,9.8,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Jasprit%20Bumrah&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p36',E'Trent Boult',E'Mumbai Indians','fast-bowler',E'Left-arm Fast Medium','marquee','overseas',200,3,10,7,9,'RHB',E'Left-arm Fast Medium','https://ui-avatars.com/api/?name=Trent%20Boult&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p37',E'Deepak Chahar',E'Mumbai Indians','fast-bowler',E'Right-arm Fast Medium','premium','indian',100,3,8,6,7.8,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Deepak%20Chahar&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p38',E'Mayank Markande',E'Mumbai Indians','spinner',E'Right-arm Leg Spin','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Mayank%20Markande&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p39',E'Allah Ghazanfar',E'Mumbai Indians','spinner',E'Right-arm Off Spin','budget','overseas',20,2,5,4,4.5,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Allah%20Ghazanfar&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p40',E'Vignesh Puthur',E'Mumbai Indians','spinner',E'Left-arm Unorthodox Spin','budget','indian',20,2,5,4,4.5,'RHB',E'Left-arm Unorthodox Spin','https://ui-avatars.com/api/?name=Vignesh%20Puthur&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p41',E'Arshdeep Singh',E'Punjab Kings','fast-bowler',E'Left-arm Fast Medium','marquee','indian',200,3,10,7,8.5,'LHB',E'Left-arm Fast Medium','https://ui-avatars.com/api/?name=Arshdeep%20Singh&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p42',E'Yuzvendra Chahal',E'Punjab Kings','spinner',E'Right-arm Leg Spin','marquee','indian',200,3,10,7,8.7,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Yuzvendra%20Chahal&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p43',E'Lockie Ferguson',E'Punjab Kings','fast-bowler',E'Right-arm Fast','premium','overseas',100,3,8,6,8.1,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Lockie%20Ferguson&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p44',E'Xavier Bartlett',E'Punjab Kings','fast-bowler',E'Right-arm Fast Medium','mid-tier','overseas',50,2,6,5,6.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Xavier%20Bartlett&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p45',E'Yash Thakur',E'Punjab Kings','fast-bowler',E'Right-arm Fast Medium','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Yash%20Thakur&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p46',E'Vyshak Vijaykumar',E'Punjab Kings','fast-bowler',E'Right-arm Medium','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Vyshak%20Vijaykumar&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p47',E'Pravin Dubey',E'Punjab Kings','spinner',E'Right-arm Leg Spin','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Pravin%20Dubey&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p48',E'Vishal Nishad',E'Punjab Kings','spinner',E'Right-arm Leg Spin','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Vishal%20Nishad&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p49',E'Ben Dwarshuis',E'Punjab Kings','fast-bowler',E'Left-arm Fast Medium','budget','overseas',20,2,5,4,4.5,'LHB',E'Left-arm Fast Medium','https://ui-avatars.com/api/?name=Ben%20Dwarshuis&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p50',E'Jofra Archer',E'Rajasthan Royals','fast-bowler',E'Right-arm Fast','marquee','overseas',200,3,10,7,9,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Jofra%20Archer&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p51',E'Sandeep Sharma',E'Rajasthan Royals','fast-bowler',E'Right-arm Medium','mid-tier','indian',50,2,6,5,6.2,'RHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Sandeep%20Sharma&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p52',E'Ravi Bishnoi',E'Rajasthan Royals','spinner',E'Right-arm Leg Spin','premium','indian',100,3,8,6,7.7,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Ravi%20Bishnoi&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p53',E'Nandre Burger',E'Rajasthan Royals','fast-bowler',E'Left-arm Fast','mid-tier','overseas',50,2,6,5,6.2,'LHB',E'Left-arm Fast','https://ui-avatars.com/api/?name=Nandre%20Burger&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p54',E'Kwena Maphaka',E'Rajasthan Royals','fast-bowler',E'Left-arm Fast','budget','overseas',20,2,5,4,4.5,'LHB',E'Left-arm Fast','https://ui-avatars.com/api/?name=Kwena%20Maphaka&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p55',E'Tushar Deshpande',E'Rajasthan Royals','fast-bowler',E'Right-arm Fast Medium','mid-tier','indian',50,2,6,5,6.2,'LHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Tushar%20Deshpande&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p56',E'Adam Milne',E'Rajasthan Royals','fast-bowler',E'Right-arm Fast','budget','overseas',20,2,5,4,4.5,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Adam%20Milne&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p57',E'Kuldeep Sen',E'Rajasthan Royals','fast-bowler',E'Right-arm Fast','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Kuldeep%20Sen&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p58',E'Sushant Mishra',E'Rajasthan Royals','fast-bowler',E'Left-arm Fast','budget','indian',20,2,5,4,4.5,'LHB',E'Left-arm Fast','https://ui-avatars.com/api/?name=Sushant%20Mishra&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p59',E'Yash Raj Punja',E'Rajasthan Royals','spinner',E'Right-arm Leg Spin','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Yash%20Raj%20Punja&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p60',E'Josh Hazlewood',E'Royal Challengers Bengaluru','fast-bowler',E'Right-arm Fast Medium','marquee','overseas',200,3,10,7,8.8,'LHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Josh%20Hazlewood&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p61',E'Bhuvneshwar Kumar',E'Royal Challengers Bengaluru','fast-bowler',E'Right-arm Medium Fast','premium','indian',100,3,8,6,8,'RHB',E'Right-arm Medium Fast','https://ui-avatars.com/api/?name=Bhuvneshwar%20Kumar&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p62',E'Yash Dayal',E'Royal Challengers Bengaluru','fast-bowler',E'Left-arm Fast Medium','mid-tier','indian',50,2,6,5,6.2,'RHB',E'Left-arm Fast Medium','https://ui-avatars.com/api/?name=Yash%20Dayal&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p63',E'Nuwan Thushara',E'Royal Challengers Bengaluru','fast-bowler',E'Right-arm Fast Medium','budget','overseas',20,2,5,4,4.5,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Nuwan%20Thushara&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p64',E'Rasikh Salam',E'Royal Challengers Bengaluru','fast-bowler',E'Right-arm Fast Medium','mid-tier','indian',50,2,6,5,6.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Rasikh%20Salam&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p65',E'Suyash Sharma',E'Royal Challengers Bengaluru','spinner',E'Right-arm Leg Spin','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Suyash%20Sharma&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p66',E'Jacob Duffy',E'Royal Challengers Bengaluru','fast-bowler',E'Right-arm Fast Medium','budget','overseas',20,2,5,4,4.5,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Jacob%20Duffy&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p67',E'Pat Cummins',E'Sunrisers Hyderabad','fast-bowler',E'Right-arm Fast','marquee','overseas',200,3,10,7,9.4,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Pat%20Cummins&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p68',E'Harshal Patel',E'Sunrisers Hyderabad','fast-bowler',E'Right-arm Fast Medium','premium','indian',100,3,8,6,7.9,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Harshal%20Patel&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p69',E'Jaydev Unadkat',E'Sunrisers Hyderabad','fast-bowler',E'Left-arm Fast Medium','mid-tier','indian',50,2,6,5,6.2,'RHB',E'Left-arm Fast Medium','https://ui-avatars.com/api/?name=Jaydev%20Unadkat&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p70',E'Shivam Mavi',E'Sunrisers Hyderabad','fast-bowler',E'Right-arm Fast Medium','mid-tier','indian',50,2,6,5,6.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Shivam%20Mavi&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p71',E'Eshan Malinga',E'Sunrisers Hyderabad','fast-bowler',E'Right-arm Fast','budget','overseas',20,2,5,4,4.5,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Eshan%20Malinga&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p72',E'Sakib Hussain',E'Sunrisers Hyderabad','fast-bowler',E'Right-arm Fast Medium','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Sakib%20Hussain&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p73',E'Onkar Tarmale',E'Sunrisers Hyderabad','fast-bowler',E'Right-arm Fast Medium','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Onkar%20Tarmale&background=ff6b00&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p74',E'Amit Kumar',E'Sunrisers Hyderabad','spinner',E'Right-arm Leg Spin','budget','indian',20,2,5,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Amit%20Kumar&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p75',E'Krains Fuletra',E'Sunrisers Hyderabad','spinner',E'Left-arm Slow Unorthodox','budget','indian',20,2,5,4,4.5,'RHB',E'Left-arm Slow Unorthodox','https://ui-avatars.com/api/?name=Krains%20Fuletra&background=6366f1&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p76',E'Shivam Dube',E'Chennai Super Kings','all-rounder',E'Right-arm Medium','mid-tier','indian',50,6,5,5,6.2,'LHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Shivam%20Dube&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p77',E'Jamie Overton',E'Chennai Super Kings','all-rounder',E'Right-arm Fast','mid-tier','overseas',50,6,5,5,6.2,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Jamie%20Overton&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p78',E'Ramakrishna Ghosh',E'Chennai Super Kings','all-rounder',E'Right-arm Medium','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Ramakrishna%20Ghosh&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p79',E'Prashant Veer',E'Chennai Super Kings','all-rounder',E'Left-arm Slow Orthodox','budget','indian',20,5,4,4,4.5,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Prashant%20Veer&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p80',E'Aman Khan',E'Chennai Super Kings','all-rounder',E'Right-arm Medium','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Aman%20Khan&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p81',E'Zak Foulkes',E'Chennai Super Kings','all-rounder',E'Right-arm Fast Medium','budget','overseas',20,5,4,4,4.5,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Zak%20Foulkes&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p82',E'Shreyas Gopal',E'Chennai Super Kings','all-rounder',E'Right-arm Leg Spin','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Shreyas%20Gopal&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p83',E'Anshul Kamboj',E'Chennai Super Kings','all-rounder',E'Right-arm Medium','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Anshul%20Kamboj&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p84',E'Gurjapneet Singh',E'Chennai Super Kings','all-rounder',E'Left-arm Medium','budget','indian',20,5,4,4,4.5,'RHB',E'Left-arm Medium','https://ui-avatars.com/api/?name=Gurjapneet%20Singh&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p85',E'Matthew Short',E'Chennai Super Kings','all-rounder',E'Right-arm Off Spin','budget','overseas',20,5,4,4,4.5,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Matthew%20Short&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p86',E'Axar Patel',E'Delhi Capitals','all-rounder',E'Left-arm Slow Orthodox','marquee','indian',200,8,8,8,8.8,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Axar%20Patel&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p87',E'Madhav Tiwari',E'Delhi Capitals','all-rounder',E'Right-arm Medium Fast','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Medium Fast','https://ui-avatars.com/api/?name=Madhav%20Tiwari&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p88',E'Tripurana Vijay',E'Delhi Capitals','all-rounder',E'Right-arm Off break','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Off break','https://ui-avatars.com/api/?name=Tripurana%20Vijay&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p89',E'Vipraj Nigam',E'Delhi Capitals','all-rounder',E'Right-arm Leg Spin','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Vipraj%20Nigam&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p90',E'Ajay Mandal',E'Delhi Capitals','all-rounder',E'Left-arm Slow Orthodox','budget','indian',20,5,4,4,4.5,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Ajay%20Mandal&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p91',E'Auqib Dar',E'Delhi Capitals','all-rounder',E'Right-arm Fast Medium','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Auqib%20Dar&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p92',E'Nitish Rana',E'Delhi Capitals','all-rounder',E'Right-arm Off Spin','budget','indian',20,5,4,4,4.5,'LHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Nitish%20Rana&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p93',E'Rahul Tewatia',E'Gujarat Titans','all-rounder',E'Right-arm Leg Spin','mid-tier','indian',50,6,5,5,6.2,'LHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Rahul%20Tewatia&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p94',E'Washington Sundar',E'Gujarat Titans','all-rounder',E'Right-arm Off Spin','premium','indian',100,7,7,7,8,'LHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Washington%20Sundar&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p95',E'Jason Holder',E'Gujarat Titans','all-rounder',E'Right-arm Fast Medium','mid-tier','overseas',50,6,5,5,6.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Jason%20Holder&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p96',E'Jayant Yadav',E'Gujarat Titans','all-rounder',E'Right-arm Off Spin','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Jayant%20Yadav&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p97',E'Nishant Sindhu',E'Gujarat Titans','all-rounder',E'Left-arm Slow Orthodox','budget','indian',20,5,4,4,4.5,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Nishant%20Sindhu&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p98',E'Arshad Khan',E'Gujarat Titans','all-rounder',E'Left-arm Medium','budget','indian',20,5,4,4,4.5,'LHB',E'Left-arm Medium','https://ui-avatars.com/api/?name=Arshad%20Khan&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p99',E'Gurnoor Singh Brar',E'Gujarat Titans','all-rounder',E'Right-arm Fast Medium','budget','indian',20,5,4,4,4.5,'LHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Gurnoor%20Singh%20Brar&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p100',E'Sunil Narine',E'Kolkata Knight Riders','all-rounder',E'Right-arm Off Spin','marquee','overseas',200,8,8,8,9,'LHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Sunil%20Narine&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p101',E'Cameron Green',E'Kolkata Knight Riders','all-rounder',E'Right-arm Fast','premium','overseas',100,7,7,7,8.2,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Cameron%20Green&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p102',E'Ramandeep Singh',E'Kolkata Knight Riders','all-rounder',E'Right-arm Medium','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Ramandeep%20Singh&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p103',E'Anukul Roy',E'Kolkata Knight Riders','all-rounder',E'Left-arm Slow Orthodox','budget','indian',20,5,4,4,4.5,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Anukul%20Roy&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p104',E'Daksh Kamra',E'Kolkata Knight Riders','all-rounder',E'Right-arm Off break','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Off break','https://ui-avatars.com/api/?name=Daksh%20Kamra&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p105',E'Mitchell Marsh',E'Lucknow Super Giants','all-rounder',E'Right-arm Fast Medium','premium','overseas',100,7,7,7,8.5,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Mitchell%20Marsh&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p106',E'Wanindu Hasaranga',E'Lucknow Super Giants','all-rounder',E'Right-arm Leg Spin','premium','overseas',100,7,7,7,8.4,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Wanindu%20Hasaranga&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p107',E'Shahbaz Ahamad',E'Lucknow Super Giants','all-rounder',E'Left-arm Slow Orthodox','budget','indian',20,5,4,4,4.5,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Shahbaz%20Ahamad&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p108',E'Arshin Kulkarni',E'Lucknow Super Giants','all-rounder',E'Right-arm Medium Fast','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Medium Fast','https://ui-avatars.com/api/?name=Arshin%20Kulkarni&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p109',E'Ayush Badoni',E'Lucknow Super Giants','all-rounder',E'Right-arm Off Spin','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Ayush%20Badoni&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p110',E'Digvesh Rathi',E'Lucknow Super Giants','all-rounder',E'Right-arm Off Spin','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Digvesh%20Rathi&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p111',E'Hardik Pandya',E'Mumbai Indians','all-rounder',E'Right-arm Fast Medium','marquee','indian',200,8,8,8,9.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Hardik%20Pandya&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p112',E'Mitchell Santner',E'Mumbai Indians','all-rounder',E'Left-arm Slow Orthodox','mid-tier','overseas',50,6,5,5,6.2,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Mitchell%20Santner&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p113',E'Corbin Bosch',E'Mumbai Indians','all-rounder',E'Right-arm Fast Medium','mid-tier','overseas',50,6,5,5,6.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Corbin%20Bosch&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p114',E'Shardul Thakur',E'Mumbai Indians','all-rounder',E'Right-arm Fast Medium','mid-tier','indian',50,6,5,5,6.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Shardul%20Thakur&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p115',E'Will Jacks',E'Mumbai Indians','all-rounder',E'Right-arm Off Spin','mid-tier','overseas',50,6,5,5,6.2,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Will%20Jacks&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p116',E'Naman Dhir',E'Mumbai Indians','all-rounder',E'Right-arm Off Spin','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Naman%20Dhir&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p117',E'Raj Bawa',E'Mumbai Indians','all-rounder',E'Right-arm Fast Medium','budget','indian',20,5,4,4,4.5,'LHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Raj%20Bawa&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p118',E'Atharva Ankolekar',E'Mumbai Indians','all-rounder',E'Left-arm Slow Orthodox','budget','indian',20,5,4,4,4.5,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Atharva%20Ankolekar&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p119',E'Mayank Rawat',E'Mumbai Indians','all-rounder',E'Right-arm Off Spin','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Mayank%20Rawat&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p120',E'Marcus Stoinis',E'Punjab Kings','all-rounder',E'Right-arm Medium','premium','overseas',100,7,7,7,8.1,'RHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Marcus%20Stoinis&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p121',E'Marco Jansen',E'Punjab Kings','all-rounder',E'Left-arm Fast Medium','premium','overseas',100,7,7,7,7.8,'RHB',E'Left-arm Fast Medium','https://ui-avatars.com/api/?name=Marco%20Jansen&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p122',E'Cooper Connolly',E'Punjab Kings','all-rounder',E'Left-arm Slow Orthodox','mid-tier','overseas',50,6,5,5,6.2,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Cooper%20Connolly&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p123',E'Mitchell Owen',E'Punjab Kings','all-rounder',E'Right-arm Fast Medium','mid-tier','overseas',50,6,5,5,6.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Mitchell%20Owen&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p124',E'Musheer Khan',E'Punjab Kings','all-rounder',E'Left-arm Slow Orthodox','budget','indian',20,5,4,4,4.5,'RHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Musheer%20Khan&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p125',E'Sam Curran',E'Rajasthan Royals','all-rounder',E'Left-arm Fast Medium','premium','overseas',100,7,7,7,8.3,'LHB',E'Left-arm Fast Medium','https://ui-avatars.com/api/?name=Sam%20Curran&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p126',E'Ravindra Jadeja',E'Rajasthan Royals','all-rounder',E'Left-arm Slow Orthodox','marquee','indian',200,8,8,8,9.3,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Ravindra%20Jadeja&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p127',E'Riyan Parag',E'Rajasthan Royals','all-rounder',E'Right-arm Leg break/Off break','mid-tier','indian',50,6,5,5,6.2,'RHB',E'Right-arm Leg break/Off break','https://ui-avatars.com/api/?name=Riyan%20Parag&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p128',E'Brijesh Sharma',E'Rajasthan Royals','all-rounder',E'Right-arm Medium','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Brijesh%20Sharma&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p129',E'Donovan Ferreira',E'Rajasthan Royals','all-rounder',E'Right-arm Off Spin','budget','overseas',20,5,4,4,4.5,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Donovan%20Ferreira&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p130',E'Yudhvir Singh Charak',E'Rajasthan Royals','all-rounder',E'Right-arm Medium Fast','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Medium Fast','https://ui-avatars.com/api/?name=Yudhvir%20Singh%20Charak&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p131',E'Krunal Pandya',E'Royal Challengers Bengaluru','all-rounder',E'Left-arm Slow Orthodox','mid-tier','indian',50,6,5,5,6.2,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Krunal%20Pandya&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p132',E'Venkatesh Iyer',E'Royal Challengers Bengaluru','all-rounder',E'Right-arm Medium','premium','indian',100,7,7,7,7.7,'LHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Venkatesh%20Iyer&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p133',E'Swapnil Singh',E'Royal Challengers Bengaluru','all-rounder',E'Left-arm Slow Orthodox','budget','indian',20,5,4,4,4.5,'RHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Swapnil%20Singh&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p134',E'Tim David',E'Royal Challengers Bengaluru','all-rounder',E'Right-arm Off Spin','mid-tier','overseas',50,6,5,5,7.5,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Tim%20David&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p135',E'Romario Shepherd',E'Royal Challengers Bengaluru','all-rounder',E'Right-arm Fast Medium','mid-tier','overseas',50,6,5,5,6.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Romario%20Shepherd&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p136',E'Jacob Bethell',E'Royal Challengers Bengaluru','all-rounder',E'Left-arm Slow Orthodox','mid-tier','overseas',50,6,5,5,6.2,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Jacob%20Bethell&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p137',E'Satvik Deswal',E'Royal Challengers Bengaluru','all-rounder',E'Right-arm Off Spin','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Satvik%20Deswal&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p138',E'Mangesh Yadav',E'Royal Challengers Bengaluru','all-rounder',E'Left-arm Fast','budget','indian',20,5,4,4,4.5,'LHB',E'Left-arm Fast','https://ui-avatars.com/api/?name=Mangesh%20Yadav&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p139',E'Vicky Ostwal',E'Royal Challengers Bengaluru','all-rounder',E'Left-arm Slow Orthodox','budget','indian',20,5,4,4,4.5,'RHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Vicky%20Ostwal&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p140',E'Vihaan Malhotra',E'Royal Challengers Bengaluru','all-rounder',E'Right-arm Leg Spin','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Vihaan%20Malhotra&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p141',E'Kanishk Chouhan',E'Royal Challengers Bengaluru','all-rounder',E'Right-arm Off Spin','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Kanishk%20Chouhan&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p142',E'Abhishek Sharma',E'Sunrisers Hyderabad','all-rounder',E'Left-arm Slow Orthodox','premium','indian',100,7,7,7,7.6,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Abhishek%20Sharma&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p143',E'Nitish Kumar Reddy',E'Sunrisers Hyderabad','all-rounder',E'Right-arm Medium Fast','premium','indian',100,7,7,7,7.8,'RHB',E'Right-arm Medium Fast','https://ui-avatars.com/api/?name=Nitish%20Kumar%20Reddy&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p144',E'Kamindu Mendis',E'Sunrisers Hyderabad','all-rounder',E'Ambidextrous Spin','mid-tier','overseas',50,6,5,5,7.9,'LHB',E'Ambidextrous Spin','https://ui-avatars.com/api/?name=Kamindu%20Mendis&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p145',E'Jack Edwards',E'Sunrisers Hyderabad','all-rounder',E'Right-arm Fast Medium','mid-tier','overseas',50,6,5,5,6.2,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Jack%20Edwards&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p146',E'Brydon Carse',E'Sunrisers Hyderabad','all-rounder',E'Right-arm Fast','mid-tier','overseas',50,6,5,5,6.2,'RHB',E'Right-arm Fast','https://ui-avatars.com/api/?name=Brydon%20Carse&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p147',E'Harsh Dubey',E'Sunrisers Hyderabad','all-rounder',E'Left-arm Slow Orthodox','budget','indian',20,5,4,4,4.5,'LHB',E'Left-arm Slow Orthodox','https://ui-avatars.com/api/?name=Harsh%20Dubey&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p148',E'Shivang Kumar',E'Sunrisers Hyderabad','all-rounder',E'Left-arm Slow Unorthodox','budget','indian',20,5,4,4,4.5,'RHB',E'Left-arm Slow Unorthodox','https://ui-avatars.com/api/?name=Shivang%20Kumar&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p149',E'Zeeshan Ansari',E'Sunrisers Hyderabad','all-rounder',E'Right-arm Leg Spin','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Zeeshan%20Ansari&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p150',E'Praful Hinge',E'Sunrisers Hyderabad','all-rounder',E'Right-arm Fast Medium','budget','indian',20,5,4,4,4.5,'RHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Praful%20Hinge&background=a855f7&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p151',E'Sanju Samson',E'Chennai Super Kings','wicket-keeper','Wicket-keeper Batsman','premium','indian',100,8,1,8,8.7,'RHB','—','https://ui-avatars.com/api/?name=Sanju%20Samson&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p152',E'MS Dhoni',E'Chennai Super Kings','wicket-keeper','Wicket-keeper Batsman','marquee','indian',200,9,1,9,9.6,'RHB','—','https://ui-avatars.com/api/?name=MS%20Dhoni&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p153',E'Urvil Patel',E'Chennai Super Kings','wicket-keeper','Wicket-keeper Batsman','budget','indian',20,5,1,6,4.5,'RHB','—','https://ui-avatars.com/api/?name=Urvil%20Patel&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p154',E'KL Rahul',E'Delhi Capitals','wicket-keeper','Wicket-keeper Batsman','marquee','indian',200,9,1,9,9,'RHB','—','https://ui-avatars.com/api/?name=KL%20Rahul&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p155',E'Tristan Stubbs',E'Delhi Capitals','wicket-keeper','Wicket-keeper Batsman','mid-tier','overseas',50,6,1,7,6.2,'RHB','—','https://ui-avatars.com/api/?name=Tristan%20Stubbs&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p156',E'Abishek Porel',E'Delhi Capitals','wicket-keeper','Wicket-keeper Batsman','budget','indian',20,5,1,6,4.5,'LHB','—','https://ui-avatars.com/api/?name=Abishek%20Porel&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p157',E'Ben Duckett',E'Delhi Capitals','wicket-keeper','Wicket-keeper Batsman','mid-tier','overseas',50,6,1,7,6.2,'LHB','—','https://ui-avatars.com/api/?name=Ben%20Duckett&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p158',E'Jos Buttler',E'Gujarat Titans','wicket-keeper','Wicket-keeper Batsman','marquee','overseas',200,9,1,9,9.1,'RHB','—','https://ui-avatars.com/api/?name=Jos%20Buttler&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p159',E'Kumar Kushagra',E'Gujarat Titans','wicket-keeper','Wicket-keeper Batsman','budget','indian',20,5,1,6,4.5,'RHB','—','https://ui-avatars.com/api/?name=Kumar%20Kushagra&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p160',E'Anuj Rawat',E'Gujarat Titans','wicket-keeper','Wicket-keeper Batsman','budget','indian',20,5,1,6,4.5,'LHB','—','https://ui-avatars.com/api/?name=Anuj%20Rawat&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p161',E'Tom Banton',E'Gujarat Titans','wicket-keeper','Wicket-keeper Batsman','budget','overseas',20,5,1,6,4.5,'RHB','—','https://ui-avatars.com/api/?name=Tom%20Banton&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p162',E'Finn Allen',E'Kolkata Knight Riders','wicket-keeper','Wicket-keeper Batsman','mid-tier','overseas',50,6,1,7,6.2,'RHB','—','https://ui-avatars.com/api/?name=Finn%20Allen&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p163',E'Tejasvi Singh',E'Kolkata Knight Riders','wicket-keeper','Wicket-keeper Batsman','budget','indian',20,5,1,6,4.5,'RHB','—','https://ui-avatars.com/api/?name=Tejasvi%20Singh&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p164',E'Rishabh Pant',E'Lucknow Super Giants','wicket-keeper','Wicket-keeper Batsman','marquee','indian',200,9,1,9,9.4,'LHB','—','https://ui-avatars.com/api/?name=Rishabh%20Pant&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p165',E'Nicholas Pooran',E'Lucknow Super Giants','wicket-keeper','Wicket-keeper Batsman','premium','overseas',100,8,1,8,8.5,'LHB','—','https://ui-avatars.com/api/?name=Nicholas%20Pooran&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p166',E'Josh Inglis',E'Lucknow Super Giants','wicket-keeper','Wicket-keeper Batsman','mid-tier','overseas',50,6,1,7,6.2,'RHB','—','https://ui-avatars.com/api/?name=Josh%20Inglis&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p167',E'Mukul Choudhary',E'Lucknow Super Giants','wicket-keeper','Wicket-keeper Batsman','budget','indian',20,5,1,6,4.5,'RHB','—','https://ui-avatars.com/api/?name=Mukul%20Choudhary&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p168',E'Quinton de Kock',E'Mumbai Indians','wicket-keeper','Wicket-keeper Batsman','premium','overseas',100,8,1,8,8.4,'LHB','—','https://ui-avatars.com/api/?name=Quinton%20de%20Kock&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p169',E'Ryan Rickelton',E'Mumbai Indians','wicket-keeper','Wicket-keeper Batsman','mid-tier','overseas',50,6,1,7,6.2,'LHB','—','https://ui-avatars.com/api/?name=Ryan%20Rickelton&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p170',E'Robin Minz',E'Mumbai Indians','wicket-keeper','Wicket-keeper Batsman','budget','indian',20,5,1,6,4.5,'LHB','—','https://ui-avatars.com/api/?name=Robin%20Minz&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p171',E'Mohammad Izhar',E'Mumbai Indians','wicket-keeper','Wicket-keeper Batsman','budget','indian',20,5,1,6,4.5,'RHB','—','https://ui-avatars.com/api/?name=Mohammad%20Izhar&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p172',E'Prabhsimran Singh',E'Punjab Kings','wicket-keeper','Wicket-keeper Batsman','mid-tier','indian',50,6,1,7,6.2,'RHB','—','https://ui-avatars.com/api/?name=Prabhsimran%20Singh&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p173',E'Vishnu Vinod',E'Punjab Kings','wicket-keeper','Wicket-keeper Batsman','budget','indian',20,5,1,6,4.5,'RHB','—','https://ui-avatars.com/api/?name=Vishnu%20Vinod&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p174',E'Lhuan-dre Pretorius',E'Rajasthan Royals','wicket-keeper','Wicket-keeper Batsman','mid-tier','overseas',50,6,1,7,6.2,'LHB','—','https://ui-avatars.com/api/?name=Lhuan-dre%20Pretorius&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p175',E'Dhruv Jurel',E'Rajasthan Royals','wicket-keeper','Wicket-keeper Batsman','mid-tier','indian',50,6,1,7,6.2,'RHB','—','https://ui-avatars.com/api/?name=Dhruv%20Jurel&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p176',E'Ravi Singh',E'Rajasthan Royals','wicket-keeper','Wicket-keeper Batsman','budget','indian',20,5,1,6,4.5,'RHB','—','https://ui-avatars.com/api/?name=Ravi%20Singh&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p177',E'Jitesh Sharma',E'Royal Challengers Bengaluru','wicket-keeper','Wicket-keeper Batsman','mid-tier','indian',50,6,1,7,6.2,'RHB','—','https://ui-avatars.com/api/?name=Jitesh%20Sharma&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p178',E'Phil Salt',E'Royal Challengers Bengaluru','wicket-keeper','Wicket-keeper Batsman','premium','overseas',100,8,1,8,8.2,'RHB','—','https://ui-avatars.com/api/?name=Phil%20Salt&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p179',E'Jordan Cox',E'Royal Challengers Bengaluru','wicket-keeper','Wicket-keeper Batsman','budget','overseas',20,5,1,6,4.5,'RHB','—','https://ui-avatars.com/api/?name=Jordan%20Cox&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p180',E'Heinrich Klaasen',E'Sunrisers Hyderabad','wicket-keeper','Wicket-keeper Batsman','premium','overseas',100,8,1,8,8.6,'RHB','—','https://ui-avatars.com/api/?name=Heinrich%20Klaasen&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p181',E'Ishan Kishan',E'Sunrisers Hyderabad','wicket-keeper','Wicket-keeper Batsman','premium','indian',100,8,1,8,8.1,'LHB','—','https://ui-avatars.com/api/?name=Ishan%20Kishan&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p182',E'Salil Arora',E'Sunrisers Hyderabad','wicket-keeper','Wicket-keeper Batsman','budget','indian',20,5,1,6,4.5,'RHB','—','https://ui-avatars.com/api/?name=Salil%20Arora&background=00ff88&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p183',E'Ruturaj Gaikwad',E'Chennai Super Kings','batsman',E'Batsman','premium','indian',100,8,2,7,8.5,'RHB',E'—','https://ui-avatars.com/api/?name=Ruturaj%20Gaikwad&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p184',E'Ayush Mhatre',E'Chennai Super Kings','batsman',E'Batsman','budget','indian',20,5,1,4,4.5,'RHB',E'—','https://ui-avatars.com/api/?name=Ayush%20Mhatre&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p185',E'Dewald Brevis',E'Chennai Super Kings','batsman',E'Part-time Right-arm Leg Spin','budget','overseas',20,5,1,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Dewald%20Brevis&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p186',E'Sarfaraz Khan',E'Chennai Super Kings','batsman',E'Part-time Right-arm Leg Spin','budget','indian',20,5,1,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Sarfaraz%20Khan&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p187',E'Karun Nair',E'Delhi Capitals','batsman',E'Part-time Right-arm Off Spin','mid-tier','indian',50,6,2,5,6.2,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Karun%20Nair&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p188',E'Prithvi Shaw',E'Delhi Capitals','batsman',E'Batsman','mid-tier','indian',50,6,2,5,6.2,'RHB',E'—','https://ui-avatars.com/api/?name=Prithvi%20Shaw&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p189',E'Sameer Rizvi',E'Delhi Capitals','batsman',E'Batsman','budget','indian',20,5,1,4,4.5,'RHB',E'—','https://ui-avatars.com/api/?name=Sameer%20Rizvi&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p190',E'Ashutosh Sharma',E'Delhi Capitals','batsman',E'Batsman','budget','indian',20,5,1,4,4.5,'RHB',E'—','https://ui-avatars.com/api/?name=Ashutosh%20Sharma&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p191',E'Pathum Nissanka',E'Delhi Capitals','batsman',E'Batsman','budget','overseas',20,5,1,4,4.5,'RHB',E'—','https://ui-avatars.com/api/?name=Pathum%20Nissanka&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p192',E'Sahil Parakh',E'Delhi Capitals','batsman',E'Part-time Right-arm Off Spin','budget','indian',20,5,1,4,4.5,'LHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Sahil%20Parakh&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p193',E'David Miller',E'Delhi Capitals','batsman',E'Batsman','mid-tier','overseas',50,6,2,5,6.2,'LHB',E'—','https://ui-avatars.com/api/?name=David%20Miller&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p194',E'Shubman Gill',E'Gujarat Titans','batsman',E'Part-time Right-arm Off Spin','marquee','indian',200,10,2,8,9,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Shubman%20Gill&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p195',E'Sai Sudharsan',E'Gujarat Titans','batsman',E'Part-time Right-arm Leg Spin','premium','indian',100,8,2,7,8.2,'LHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Sai%20Sudharsan&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p196',E'Shahrukh Khan',E'Gujarat Titans','batsman',E'Part-time Right-arm Off Spin','mid-tier','indian',50,6,2,5,6.2,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Shahrukh%20Khan&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p197',E'Rinku Singh',E'Kolkata Knight Riders','batsman',E'Part-time Right-arm Off Spin','mid-tier','indian',50,6,2,5,6.2,'LHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Rinku%20Singh&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p198',E'Angkrish Raghuvanshi',E'Kolkata Knight Riders','batsman',E'Part-time Right-arm Off Spin','mid-tier','indian',50,6,2,5,6.2,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Angkrish%20Raghuvanshi&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p199',E'Ajinkya Rahane',E'Kolkata Knight Riders','batsman',E'Batsman','mid-tier','indian',50,6,2,5,6.2,'RHB',E'—','https://ui-avatars.com/api/?name=Ajinkya%20Rahane&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p200',E'Manish Pandey',E'Kolkata Knight Riders','batsman',E'Batsman','budget','indian',20,5,1,4,4.5,'RHB',E'—','https://ui-avatars.com/api/?name=Manish%20Pandey&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p201',E'Rovman Powell',E'Kolkata Knight Riders','batsman',E'Part-time Right-arm Medium','mid-tier','overseas',50,6,2,5,6.2,'RHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Rovman%20Powell&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p202',E'Aiden Markram',E'Lucknow Super Giants','batsman',E'Part-time Right-arm Off Spin','premium','overseas',100,8,2,7,8.1,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Aiden%20Markram&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p203',E'Himmat Singh',E'Lucknow Super Giants','batsman',E'Batsman','budget','indian',20,5,1,4,4.5,'RHB',E'—','https://ui-avatars.com/api/?name=Himmat%20Singh&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p204',E'Matthew Breetzke',E'Lucknow Super Giants','batsman',E'Batsman','budget','overseas',20,5,1,4,4.5,'RHB',E'—','https://ui-avatars.com/api/?name=Matthew%20Breetzke&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p205',E'Akshat Raghuwanshi',E'Lucknow Super Giants','batsman',E'Batsman','budget','indian',20,5,1,4,4.5,'RHB',E'—','https://ui-avatars.com/api/?name=Akshat%20Raghuwanshi&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p206',E'Abdul Samad',E'Lucknow Super Giants','batsman',E'Part-time Right-arm Leg Spin','budget','indian',20,5,1,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Abdul%20Samad&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p207',E'Rohit Sharma',E'Mumbai Indians','batsman',E'Part-time Right-arm Off Spin','marquee','indian',200,10,2,8,9.5,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Rohit%20Sharma&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p208',E'Suryakumar Yadav',E'Mumbai Indians','batsman',E'Part-time Right-arm Medium','premium','indian',100,8,2,7,8.8,'RHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Suryakumar%20Yadav&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p209',E'Tilak Varma',E'Mumbai Indians','batsman',E'Part-time Right-arm Off Spin','premium','indian',100,8,2,7,8.3,'LHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Tilak%20Varma&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p210',E'Sherfane Rutherford',E'Mumbai Indians','batsman',E'Part-time Right-arm Fast Medium','mid-tier','overseas',50,6,2,5,6.2,'LHB',E'Right-arm Fast Medium','https://ui-avatars.com/api/?name=Sherfane%20Rutherford&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p211',E'Danish Malewar',E'Mumbai Indians','batsman',E'Part-time Right-arm Leg Spin','budget','indian',20,5,1,4,4.5,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Danish%20Malewar&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p212',E'Shreyas Iyer',E'Punjab Kings','batsman',E'Part-time Right-arm Leg Spin','premium','indian',100,8,2,7,8.6,'RHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Shreyas%20Iyer&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p213',E'Shashank Singh',E'Punjab Kings','batsman',E'Part-time Right-arm Medium','budget','indian',20,5,1,4,4.5,'RHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Shashank%20Singh&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p214',E'Priyansh Arya',E'Punjab Kings','batsman',E'Batsman','budget','indian',20,5,1,4,4.5,'LHB',E'—','https://ui-avatars.com/api/?name=Priyansh%20Arya&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p215',E'Pyla Avinash',E'Punjab Kings','batsman',E'Batsman','budget','indian',20,5,1,4,4.5,'RHB',E'—','https://ui-avatars.com/api/?name=Pyla%20Avinash&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p216',E'Suryansh Shedge',E'Punjab Kings','batsman',E'Batsman','budget','indian',20,5,1,4,4.5,'RHB',E'—','https://ui-avatars.com/api/?name=Suryansh%20Shedge&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p217',E'Harnoor Singh',E'Punjab Kings','batsman',E'Batsman','budget','indian',20,5,1,4,4.5,'LHB',E'—','https://ui-avatars.com/api/?name=Harnoor%20Singh&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p218',E'Yashasvi Jaiswal',E'Rajasthan Royals','batsman',E'Part-time Right-arm Leg Spin','marquee','indian',200,10,2,8,9.2,'LHB',E'Right-arm Leg Spin','https://ui-avatars.com/api/?name=Yashasvi%20Jaiswal&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p219',E'Shimron Hetmyer',E'Rajasthan Royals','batsman',E'Batsman','mid-tier','overseas',50,6,2,5,6.2,'LHB',E'—','https://ui-avatars.com/api/?name=Shimron%20Hetmyer&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p220',E'Shubham Dubey',E'Rajasthan Royals','batsman',E'Part-time Right-arm Off break','budget','indian',20,5,1,4,4.5,'LHB',E'Right-arm Off break','https://ui-avatars.com/api/?name=Shubham%20Dubey&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p221',E'Vaibhav Suryavanshi',E'Rajasthan Royals','batsman',E'Batsman','mid-tier','indian',50,6,2,5,6.2,'LHB',E'—','https://ui-avatars.com/api/?name=Vaibhav%20Suryavanshi&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p222',E'Aman Rao',E'Rajasthan Royals','batsman',E'Part-time Right-arm Off Spin','budget','indian',20,5,1,4,4.5,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Aman%20Rao&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p223',E'Virat Kohli',E'Royal Challengers Bengaluru','batsman',E'Part-time Right-arm Medium','marquee','indian',200,10,2,8,9.7,'RHB',E'Right-arm Medium','https://ui-avatars.com/api/?name=Virat%20Kohli&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p224',E'Rajat Patidar',E'Royal Challengers Bengaluru','batsman',E'Part-time Right-arm Off Spin','mid-tier','indian',50,6,2,5,6.2,'RHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Rajat%20Patidar&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p225',E'Devdutt Padikkal',E'Royal Challengers Bengaluru','batsman',E'Part-time Right-arm Off Spin','premium','indian',100,8,2,7,7.9,'LHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Devdutt%20Padikkal&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p226',E'Travis Head',E'Sunrisers Hyderabad','batsman',E'Part-time Right-arm Off Spin','marquee','overseas',200,10,2,8,8.9,'LHB',E'Right-arm Off Spin','https://ui-avatars.com/api/?name=Travis%20Head&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p227',E'Aniket Verma',E'Sunrisers Hyderabad','batsman',E'Batsman','budget','indian',20,5,1,4,4.5,'RHB',E'—','https://ui-avatars.com/api/?name=Aniket%20Verma&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL),
('p228',E'Smaran Ravichandran',E'Sunrisers Hyderabad','batsman',E'Batsman','budget','indian',20,5,1,4,4.5,'LHB',E'—','https://ui-avatars.com/api/?name=Smaran%20Ravichandran&background=00d4ff&color=fff&size=128&bold=true','available',NULL,NULL,NULL)
ON CONFLICT (id) DO NOTHING;

-- Done! All tables, policies, grants, RPC, and 228 players are ready.
