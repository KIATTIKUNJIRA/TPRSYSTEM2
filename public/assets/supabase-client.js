// public/assets/supabase-client.js
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// ข้อมูลสำหรับเชื่อมต่อโปรเจกต์ tprsystem-v2 ของคุณ
const SUPABASE_URL = 'https://cszxoohxcyqcuoulemsw.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzenhvb2h4Y3lxY3VvdWxlbXN3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU3OTc4MDIsImV4cCI6MjA3MTM3MzgwMn0.uignnwzXEMnMGsRLkQnYAdlMa0S2ndysvaYJg7fo4Sk';

// สร้างและ export client ของ supabase เพื่อให้ไฟล์อื่นนำไปใช้ได้
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);