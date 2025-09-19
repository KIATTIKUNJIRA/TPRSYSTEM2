// Compatibility shim: re-export the existing ESM client file so modules can import
// using the .mjs extension as requested by other code. This simply forwards the
// named export `supabase` from the existing `supabase-client.js` file.
export { supabase } from './supabase-client.js';
