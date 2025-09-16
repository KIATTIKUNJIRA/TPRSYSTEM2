// public/assets/api.js
// Clean API wrapper for Supabase-backed project data + mocked AR/AP/WIP until those tables exist.

import { supabase } from './supabase-client.js';

async function getProjects({ year } = {}) {
  try {
    let builder = supabase
      .from('projects')
      .select('id, project_code, name, owner_id, pm_id, status, contract_amount, start_date, due_date')
      .order('start_date', { ascending: false });

    if (year) {
      const start = `${year}-01-01`;
      const end = `${year}-12-31`;
      builder = builder.gte('start_date', start).lte('start_date', end);
    }

    const { data, error } = await builder;
    if (error) {
      console.error('api.getProjects error', error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error('api.getProjects unexpected', err);
    return [];
  }
}

async function getProject(id) {
  if (!id) return null;
  try {
    const { data: project, error: projErr } = await supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (projErr) {
      console.error('api.getProject project fetch error', projErr);
      return null;
    }
    if (!project) return null;

    let pm = null;
    if (project.pm_id) {
      const { data: pmData, error: pmErr } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .eq('id', project.pm_id)
        .maybeSingle();
      if (pmErr) console.warn('api.getProject pm fetch warning', pmErr);
      pm = pmData || null;
    }

    let parent = null;
    if (project.parent_id) {
      const { data: pData, error: pErr } = await supabase
        .from('projects')
        .select('id, project_code, name')
        .eq('id', project.parent_id)
        .maybeSingle();
      if (pErr) console.warn('api.getProject parent fetch warning', pErr);
      parent = pData || null;
    }

    const { count, error: childErr } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true })
      .eq('parent_id', id);
    if (childErr) console.warn('api.getProject children count warning', childErr);

    return {
      ...project,
      pm,
      parent,
      childrenCount: typeof count === 'number' ? count : 0
    };
  } catch (err) {
    console.error('api.getProject unexpected', err);
    return null;
  }
}

async function getMyAssignments(userId) {
  if (!userId) return [];
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select('project:projects(id, project_code, name, pm_id, status, start_date, due_date)')
      .eq('user_id', userId);

    if (error) {
      console.error('api.getMyAssignments error', error);
      return [];
    }
    return (data || []).map(r => r.project).filter(Boolean);
  } catch (err) {
    console.error('api.getMyAssignments unexpected', err);
    return [];
  }
}

// --- Mocked financial endpoints until tables exist ---
function _mockFinancial(label) {
  return {
    source: 'mock',
    label,
    generated_at: new Date().toISOString(),
    summary: { total: 35000, currency: 'THB' },
    lines: [
      { id: `${label}_1`, name: `${label} sample 1`, amount: 10000 },
      { id: `${label}_2`, name: `${label} sample 2`, amount: 25000 }
    ]
  };
}

async function getAR() { return _mockFinancial('AR'); }
async function getAP() { return _mockFinancial('AP'); }
async function getWIP() { return _mockFinancial('WIP'); }

export const api = {
  getProjects,
  getProject,
  getMyAssignments,
  getAR,
  getAP,
  getWIP
};