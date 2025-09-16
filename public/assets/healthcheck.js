// public/assets/healthcheck.js
import { supabase } from './supabase-client.js';

async function runHealthCheck(){
  try{
    // Basic env checks
    const env = window.__ENV || {};
    if(!env.SUPABASE_URL || !env.SUPABASE_ANON_KEY){
      console.error('Healthcheck: missing SUPABASE_URL or SUPABASE_ANON_KEY in window.__ENV');
      return;
    }

    // Session check
    const sessResp = await supabase.auth.getSession();
    const session = sessResp?.data?.session || null;
    if(!session){
      console.warn('Healthcheck: no active session');
      // still proceed to check connectivity
    }

    // Try basic reads
    const checks = [
      supabase.from('profiles').select('id').limit(1),
      supabase.from('roles').select('name').limit(1),
      supabase.from('projects').select('id').limit(1)
    ];

    const results = await Promise.all(checks);
    for(const r of results){
      if(r.error){ throw r.error; }
    }

    console.log('Healthcheck: OK');
  }catch(err){
    console.error('Healthcheck: failed', err);
  }
}

// Run immediately but don't block app startup
runHealthCheck();

export default { runHealthCheck };
