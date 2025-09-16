// public/assets/auth.js
import { supabase } from './supabase-client.js';
import { ui } from './ui.js';
let currentUser = null;

export async function handleAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) { location.replace('/login.html'); return null; }

  const uid = session.user.id;
  const email = session.user.email;

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', uid).maybeSingle();
  const { data: ur } = await supabase.from('user_roles').select('roles(name)').eq('user_id', uid);
  const roles = (ur || []).map(r => r.roles?.name).filter(Boolean);

  currentUser = { id: uid, email, profile, roles };
  ui?.renderUserInfo?.(currentUser);
  return currentUser;
}

export function getCurrentUser(){ return currentUser; }