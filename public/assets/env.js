
// public/assets/env.js
window.__ENV = {
  SUPABASE_URL: "https://cszxoohxcyqcuoulemsw.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzenhvb2h4Y3lxY3VvdWxlbXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3OTc4MDIsImV4cCI6MjA3MTM3MzgwMn0.uignnwzXEMnMGsRLkQnYAdlMa0S2ndysvaYJg7fo4Sk"
};

// Replace the placeholder values below with your real Supabase project URL and anon key.
// This file is loaded before modules that import the supabase client.

// Helpful runtime warning so developers see a clear message in the browser console
;(function warnIfPlaceholders() {
  try {
    const url = window.__ENV && window.__ENV.SUPABASE_URL;
    const key = window.__ENV && window.__ENV.SUPABASE_ANON_KEY;
    if (!url || !key) {
      console.warn('assets/env.js: SUPABASE_URL or SUPABASE_ANON_KEY missing. Set values in public/assets/env.js');
      return;
    }
    if (url.includes('<') || key.includes('<')) {
      console.warn('assets/env.js: placeholder Supabase values detected. Replace placeholders with your project SUPABASE_URL and SUPABASE_ANON_KEY.');
    }
  } catch (e) {
    console.error('assets/env.js: error checking env placeholders', e);
  }
})();

