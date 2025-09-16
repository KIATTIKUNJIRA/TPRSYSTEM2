// public/assets/supabase-client.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

function getEnv() {
	const e = (window.__ENV || {});
	if (!e.SUPABASE_URL || !e.SUPABASE_ANON_KEY) {
		throw new Error("Missing Supabase ENV. Set window.__ENV in public/assets/env.js");
	}
	return e;
}

const { SUPABASE_URL, SUPABASE_ANON_KEY } = getEnv();
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
export { getEnv };