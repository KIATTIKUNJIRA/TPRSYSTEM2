import { supabase } from './supabase-client.mjs';

// Profiles API (client-side, RLS-friendly)
// Each function returns an object: { data, error }

export async function getMyProfile(userId) {
  if (!userId) return { data: null, error: new Error('missing userId') };
  try {
    // Select only safe fields and avoid joins that might trigger complex RLS
    const { data, error } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email, position, department, created_at, updated_at')
      .eq('id', userId)
      .maybeSingle();

    return { data: data || null, error };
  } catch (err) {
    console.error('api-profiles.getMyProfile unexpected', err);
    return { data: null, error: err };
  }
}

export async function updateMyProfile(userId, partial) {
  if (!userId) return { data: null, error: new Error('missing userId') };
  if (!partial || typeof partial !== 'object') return { data: null, error: new Error('invalid partial data') };
  try {
    // Only allow updating specific, harmless columns. This keeps with RLS update policies
    const allowed = ['first_name', 'last_name', 'position', 'department'];
    const payload = {};
    for (const k of allowed) {
      if (k in partial) payload[k] = partial[k];
    }
    if (Object.keys(payload).length === 0) {
      return { data: null, error: new Error('no updatable fields provided') };
    }

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', userId)
      .select('id, first_name, last_name, position, department, updated_at')
      .maybeSingle();

    return { data: data || null, error };
  } catch (err) {
    console.error('api-profiles.updateMyProfile unexpected', err);
    return { data: null, error: err };
  }
}

export async function listProfiles({ q, department, limit = 100 } = {}) {
  try {
    // Start with base select for safe profile fields
    let builder = supabase
      .from('profiles')
      .select('id, first_name, last_name, email, position, department')
      .limit(limit)
      .order('first_name', { ascending: true });

    // Basic filters that play well with RLS
    if (department) builder = builder.eq('department', department);
    if (q) {
      // use text search across first and last name
      const like = `%${q.replace(/%/g, '\%')}%`;
      builder = builder.or(`first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like}`);
    }

    const { data, error } = await builder;
    return { data: data || [], error };
  } catch (err) {
    console.error('api-profiles.listProfiles unexpected', err);
    return { data: [], error: err };
  }
}

export async function listDepartments() {
  try {
    // Departments are stored as free text on profiles. Query distinct departments via aggregation.
    const { data, error } = await supabase
      .from('profiles')
      .select('department', { distinct: true })
      .not('department', 'is', null)
      .order('department', { ascending: true });

    if (error) return { data: [], error };
    // Normalize to an array of department names
    const departments = (data || []).map(r => r.department).filter(Boolean);
    return { data: departments, error: null };
  } catch (err) {
    console.error('api-profiles.listDepartments unexpected', err);
    return { data: [], error: err };
  }
}

export default {
  getMyProfile,
  updateMyProfile,
  listProfiles,
  listDepartments
};
