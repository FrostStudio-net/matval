import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const config = window.MATVAL_SUPABASE_CONFIG || {};
const SUPABASE_URL = config.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = config.SUPABASE_ANON_KEY || "";

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL
    && SUPABASE_ANON_KEY
    && !SUPABASE_URL.includes("YOUR_SUPABASE_URL")
    && !SUPABASE_ANON_KEY.includes("YOUR_SUPABASE_ANON_KEY")
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

window.MatvalSupabase = {
  supabase,
  isSupabaseConfigured,
};
