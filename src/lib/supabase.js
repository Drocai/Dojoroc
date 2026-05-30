import { createClient } from '@supabase/supabase-js';

// Falls back to the shared "Graysen Handoff Hub" project so the app works on
// a fresh deploy with no config. These are PUBLIC values (publishable/anon key
// + project URL) and are safe to ship because row-level security is enforced
// on every table. Set VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY to override.
const DEFAULT_SUPABASE_URL = 'https://fztfhmqvssjhikeyydzr.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_8fudPd1IpESTx9QuUEl_VA_4F2-ntaa';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || DEFAULT_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
