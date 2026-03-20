-- =============================================================
-- BVRIT IPL AUCTION — RLS & PERMISSIONS FIX
-- Run this in Supabase Dashboard > SQL Editor
-- Fixes: "new row violates row-level security policy for table teams"
-- =============================================================

-- ── 1. Drop ALL existing policies on teams (catch-all) ───────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies WHERE tablename = 'teams' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.teams', r.policyname);
  END LOOP;
END $$;

-- ── 2. Disable then re-enable RLS (clean slate) ──────────────
ALTER TABLE public.teams DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- ── 3. Create fully open policies for teams ───────────────────
CREATE POLICY "teams_select_all" ON public.teams FOR SELECT USING (true);
CREATE POLICY "teams_insert_all" ON public.teams FOR INSERT WITH CHECK (true);
CREATE POLICY "teams_update_all" ON public.teams FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "teams_delete_all" ON public.teams FOR DELETE USING (true);

-- ── 4. Grant table-level permissions to anon + authenticated ──
GRANT ALL ON public.teams TO anon;
GRANT ALL ON public.teams TO authenticated;

-- ── 5. Same fix for players table ────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies WHERE tablename = 'players' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.players', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.players DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "players_select_all" ON public.players FOR SELECT USING (true);
CREATE POLICY "players_insert_all" ON public.players FOR INSERT WITH CHECK (true);
CREATE POLICY "players_update_all" ON public.players FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "players_delete_all" ON public.players FOR DELETE USING (true);

GRANT ALL ON public.players TO anon;
GRANT ALL ON public.players TO authenticated;

-- ── 6. Same fix for auction_state ────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies WHERE tablename = 'auction_state' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.auction_state', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.auction_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auction_state_select_all" ON public.auction_state FOR SELECT USING (true);
CREATE POLICY "auction_state_insert_all" ON public.auction_state FOR INSERT WITH CHECK (true);
CREATE POLICY "auction_state_update_all" ON public.auction_state FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "auction_state_delete_all" ON public.auction_state FOR DELETE USING (true);

GRANT ALL ON public.auction_state TO anon;
GRANT ALL ON public.auction_state TO authenticated;

-- ── 7. Same fix for auction_log ──────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies WHERE tablename = 'auction_log' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.auction_log', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.auction_log DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "auction_log_select_all" ON public.auction_log FOR SELECT USING (true);
CREATE POLICY "auction_log_insert_all" ON public.auction_log FOR INSERT WITH CHECK (true);
CREATE POLICY "auction_log_update_all" ON public.auction_log FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "auction_log_delete_all" ON public.auction_log FOR DELETE USING (true);

GRANT ALL ON public.auction_log TO anon;
GRANT ALL ON public.auction_log TO authenticated;

-- ── 8. Same fix for team_squads ──────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies WHERE tablename = 'team_squads' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.team_squads', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.team_squads DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_squads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "team_squads_select_all" ON public.team_squads FOR SELECT USING (true);
CREATE POLICY "team_squads_insert_all" ON public.team_squads FOR INSERT WITH CHECK (true);
CREATE POLICY "team_squads_update_all" ON public.team_squads FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "team_squads_delete_all" ON public.team_squads FOR DELETE USING (true);

GRANT ALL ON public.team_squads TO anon;
GRANT ALL ON public.team_squads TO authenticated;

-- ── 9. Same fix for team_player_freezes ──────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies WHERE tablename = 'team_player_freezes' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.team_player_freezes', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.team_player_freezes DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_player_freezes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "freezes_select_all" ON public.team_player_freezes FOR SELECT USING (true);
CREATE POLICY "freezes_insert_all" ON public.team_player_freezes FOR INSERT WITH CHECK (true);
CREATE POLICY "freezes_update_all" ON public.team_player_freezes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "freezes_delete_all" ON public.team_player_freezes FOR DELETE USING (true);

GRANT ALL ON public.team_player_freezes TO anon;
GRANT ALL ON public.team_player_freezes TO authenticated;

-- ── 10. Same fix for team_global_cooldowns ───────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies WHERE tablename = 'team_global_cooldowns' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.team_global_cooldowns', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.team_global_cooldowns DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_global_cooldowns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cooldowns_select_all" ON public.team_global_cooldowns FOR SELECT USING (true);
CREATE POLICY "cooldowns_insert_all" ON public.team_global_cooldowns FOR INSERT WITH CHECK (true);
CREATE POLICY "cooldowns_update_all" ON public.team_global_cooldowns FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "cooldowns_delete_all" ON public.team_global_cooldowns FOR DELETE USING (true);

GRANT ALL ON public.team_global_cooldowns TO anon;
GRANT ALL ON public.team_global_cooldowns TO authenticated;

-- ── 11. Same fix for rtm_state ───────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies WHERE tablename = 'rtm_state' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.rtm_state', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.rtm_state DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.rtm_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "rtm_select_all" ON public.rtm_state FOR SELECT USING (true);
CREATE POLICY "rtm_insert_all" ON public.rtm_state FOR INSERT WITH CHECK (true);
CREATE POLICY "rtm_update_all" ON public.rtm_state FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "rtm_delete_all" ON public.rtm_state FOR DELETE USING (true);

GRANT ALL ON public.rtm_state TO anon;
GRANT ALL ON public.rtm_state TO authenticated;

-- ── 12. Same fix for auction_config ──────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT policyname FROM pg_policies WHERE tablename = 'auction_config' AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON public.auction_config', r.policyname);
  END LOOP;
END $$;

ALTER TABLE public.auction_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.auction_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "config_select_all" ON public.auction_config FOR SELECT USING (true);
CREATE POLICY "config_insert_all" ON public.auction_config FOR INSERT WITH CHECK (true);
CREATE POLICY "config_update_all" ON public.auction_config FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "config_delete_all" ON public.auction_config FOR DELETE USING (true);

GRANT ALL ON public.auction_config TO anon;
GRANT ALL ON public.auction_config TO authenticated;

-- ── 13. Grant sequence usage (needed for auto-increment IDs) ──
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ── 14. Add auction_queue column if missing ──────────────────
ALTER TABLE public.auction_state
  ADD COLUMN IF NOT EXISTS auction_queue JSONB NOT NULL DEFAULT '[]'::JSONB;

-- ── 15. Verify ───────────────────────────────────────────────
SELECT tablename, policyname, cmd
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('teams','players','auction_state','auction_log','team_squads','team_player_freezes','team_global_cooldowns','rtm_state','auction_config')
ORDER BY tablename, policyname;
