import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// New Supabase project — values override the stale .env file
const SUPABASE_URL = "https://gnznrtpywrkbygemktic.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_fIcwsUnAHMWvYza_bK-P_w_I3natwhJ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
