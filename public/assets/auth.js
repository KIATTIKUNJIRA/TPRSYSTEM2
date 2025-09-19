// public/assets/auth.js
import { supabase } from './supabase-client.js';

// Minimal client-side auth helper module.
// Exposes: getSession, getCurrentUser, handleAuthGuard, loadProfileAndRoles, logout

let currentUser = null;

export async function getSession() {
  try {
    const { data } = await supabase.auth.getSession();
    return data?.session || null;
  } catch (err) {
    console.error('getSession error', err);
    return null;
  }
}

export function getCurrentUser() {
  return currentUser;
}

export async function loadProfileAndRoles(userId) {
  if (!userId) return { profile: null, roles: [] };
  try {
    // Load profile
    const { data: profile, error: pErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    console.log('loadProfileAndRoles profile:', profile, 'error:', pErr);

    // if (pErr) console.warn('profiles load warning', pErr.message || pErr);

    // // First fetch role_ids from user_roles (avoid relational select that can trigger recursive policies)
    // let roleIds = [];
    // try {
    //   const { data: urRows, error: urErr } = await supabase
    //     .from('user_roles')
    //     .select('role_id')
    //     .eq('user_id', userId);
    //   if (urErr) {
    //     // If server warns about policy recursion, surface a clear message for developers
    //     if (urErr.message && urErr.message.toLowerCase().includes('recursive')) {
    //       console.warn('user_roles load warning: possible RLS policy recursion detected. Consider reviewing RLS policies on user_roles/roles.');
    //     } else {
    //       console.warn('user_roles load warning', urErr.message || urErr);
    //     }
    //   }
    //   roleIds = (urRows || []).map(r => r.role_id).filter(Boolean);
    // } catch (innerErr) {
    //   console.warn('user_roles fetch failed', innerErr);
    //   roleIds = [];
    // }

    // // If we have role ids, fetch role names
    // let roles = [];
    // if (roleIds.length > 0) {
    //   try {
    //     const { data: rolesRows, error: rolesErr } = await supabase
    //       .from('roles')
    //       .select('name')
    //       .in('id', roleIds);
    //     if (rolesErr) {
    //       console.warn('roles load warning', rolesErr.message || rolesErr);
    //     }
    //     roles = (rolesRows || []).map(r => r.name).filter(Boolean);
    //   } catch (rolesFetchErr) {
    //     console.warn('roles fetch failed', rolesFetchErr);
    //     roles = [];
    //   }
    // }

    return { profile: profile || null, roles };

  } catch (err) {
    console.error('loadProfileAndRoles error', err);
    return { profile: null, roles: [] };
  }
}

export async function handleAuthGuard({ redirect = '/login.html' } = {}) {
  const session = await getSession();
  if (!session) {
    // Ensure we replace so history doesn't let user go back to protected page
    window.location.replace(redirect);
    return null;
  }

  const uid = session.user?.id;
  const email = session.user?.email || null;

  const { profile, roles } = await loadProfileAndRoles(uid);

  currentUser = { id: uid, email, profile, roles };
  return currentUser;
}

// Backwards compatibility: older code imports handleAuth
export const handleAuth = handleAuthGuard;

export async function logout({ redirect = '/login.html' } = {}) {
  try {
    await supabase.auth.signOut();
  } catch (err) {
    console.warn('logout warning', err);
  }
  window.location.replace(redirect);
}

export default {
  getSession,
  getCurrentUser,
  loadProfileAndRoles,
  handleAuthGuard,
  handleAuth,
  logout,
};