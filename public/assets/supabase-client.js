// ESM-only supabase client initializer.
// This module expects `window.__ENV` to be defined (e.g. via `assets/env.js`) and
// will throw a clear error if the required values are missing.

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

function _getEnv() {
  const e = window.__ENV || {};
  if (!e.SUPABASE_URL || !e.SUPABASE_ANON_KEY) {
    throw new Error('Missing Supabase ENV. Ensure window.__ENV.SUPABASE_URL and SUPABASE_ANON_KEY are set.');
  }
  return e;
}

const { SUPABASE_URL, SUPABASE_ANON_KEY } = _getEnv();
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: true, detectSessionInUrl: true },
});

// Expose globally for non-module consumers or legacy code
window.supabaseClient = supabase;

// ESM export for module scripts that import { supabase }
export { supabase };


