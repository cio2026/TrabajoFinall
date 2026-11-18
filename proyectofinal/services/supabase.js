
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://cjnkuniuvjsnfcqqpoyh.supabase.co";

const SUPABASE_ANON_KEY = "sb_publishable_yg9oLHsE2jZBiGmhn02Tfw_S007oQ_s";

export const supabase = createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false
    }
  }
);
