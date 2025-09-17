import './env.js';
import { supabase } from './supabase-client.js';
import { getSession, loadProfileAndRoles } from './auth.js';

const resultsEl = document.getElementById('results') || document.body;

function addResult(title, ok, details) {
  const container = document.createElement('div');
  container.className = 'p-3 border rounded bg-white';
  const h = document.createElement('div');
  h.className = 'font-medium';
  h.textContent = title + (ok ? ' ✅' : ' ❌');
  const d = document.createElement('pre');
  d.className = 'mt-2 text-xs text-slate-700 overflow-auto';
  d.style.whiteSpace = 'pre-wrap';
  d.textContent = typeof details === 'string' ? details : JSON.stringify(details, null, 2);
  container.appendChild(h);
  container.appendChild(d);
  resultsEl.appendChild(container);
}

async function runChecks() {
  // Env checks
  try {
    const e = window.__ENV || {};
    const ok = !!(e.SUPABASE_URL && e.SUPABASE_ANON_KEY);
    addResult('Env variables', ok, { SUPABASE_URL: e.SUPABASE_URL || null, SUPABASE_ANON_KEY_present: !!e.SUPABASE_ANON_KEY });
  } catch (err) {
    addResult('Env variables', false, String(err));
  }

  // Supabase client basic check
  try {
    if (!supabase) throw new Error('supabase client not initialized');
    addResult('Supabase client', true, { url: supabase.supabaseUrl || 'unknown' });
  } catch (err) {
    addResult('Supabase client', false, String(err));
  }

  // Session check
  try {
    const session = await getSession();
    addResult('Auth session', !!session, session || 'no session');

    if (session && session.user && session.user.id) {
      const uid = session.user.id;
      // Load profile and roles using existing helper
      try {
        const { profile, roles } = await loadProfileAndRoles(uid);
        addResult('Profile loaded', !!profile, profile || 'profile not found');
        addResult('User roles', Array.isArray(roles) && roles.length > 0, roles || []);
      } catch (err) {
        addResult('Profile/roles load', false, String(err));
      }
    }
  } catch (err) {
    addResult('Auth session', false, String(err));
  }

  // A quick SQL check to ensure we can query counts of profiles and user_roles (safe minimal query)
  try {
    const { data: pCount, error: pErr } = await supabase.from('profiles').select('id', { count: 'estimated', head: true });
    if (pErr) throw pErr;
    addResult('Profiles table accessible', true, { estimated_count: pCount?.length ?? 'unknown' });
  } catch (err) {
    addResult('Profiles table accessible', false, String(err));
  }

  try {
    const { data: urCount, error: urErr } = await supabase.from('user_roles').select('user_id', { count: 'estimated', head: true });
    if (urErr) throw urErr;
    addResult('User_roles table accessible', true, { estimated_count: urCount?.length ?? 'unknown' });
  } catch (err) {
    addResult('User_roles table accessible', false, String(err));
  }
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runChecks);
} else {
  runChecks();
}
