// public/assets/api.js
import { supabase } from './supabase-client.js';

export const api = {
    // Fetches the user's profile from the 'profiles' table
    async getUserProfile(userId) {
        const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user profile:', error);
            return null;
        }
        return data;
    },

    // Fetches the user's roles from the 'user_roles' and 'roles' tables
    async getUserRoles(userId) {
        const { data, error } = await supabase
            .from('user_roles')
            .select(`roles ( name )`)
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching user roles:', error);
            return [];
        }
        return data.map(item => item.roles);
    },

    // Fetches projects. RLS will automatically filter this based on the logged-in user.
    async getProjects() {
        const { data, error } = await supabase
            .from('projects')
            .select('*');

        if (error) {
            console.error('Error fetching projects:', error);
            return [];
        }
        return data;
    },
    
    // ---- NEW MOCK FUNCTIONS FOR DASHBOARDS ----

    async getCeoKpis() {
        return { gross_profit: 4250000, net_profit: 1370000, ar_aging: [1200000, 620000, 350000], wip: 2180000 };
    },

    async getPmDashboardData() {
        return {
            kpis: { active: 8, completed: 3, at_risk: 2 },
            team_utilization: [
                { name: 'ศศิธร', util: 86 }, { name: 'ธนวัต', util: 74 }, { name: 'มยุรี', util: 69 }
            ],
            approvals: [
                { type: 'Timesheet', who: 'ศศิธร – 8 ชม.' }, { type: 'Expense', who: 'มยุรี – ฿1,240' }
            ]
        };
    },
    
    async getHrDashboardData() {
        return {
            kpis: { total_employees: 42, avg_utilization: 78, on_leave_today: 3 },
            timesheet_compliance: { approved: 35, pending: 5, missing: 2 },
            leave_requests: [
                { who: 'ภาณุวัฒน์', type: 'PTO' }, { who: 'มยุรี', type: 'Personal' }
            ]
        };
    },

    async getAcDashboardData() {
        return {
            ar_kpis: { aging_61_plus: 460000, wip: 2150000, draft_invoices: 3 },
            ap_kpis: { aging_31_plus: 600000, bills_due: 5, reimbursements: 2 }
        };
    }
};
 // ---- NEW MOCK FUNCTIONS FOR DASHBOARDS ----
    async getTlDashboardData() {
        return {
            team_tasks: [
                { title: 'UAT ฟีเจอร์ใบเสนอราคา', project: 'PRJ-201', assignee: 'สารี' },
                { title: 'ออกแบบหน้า Dashboard ย่อย', project: 'PRJ-205', assignee: 'เจ' },
            ],
            my_tasks: [ { title: 'Review API Spec v2', project: 'PRJ-205' } ],
            approvals: [ { who: 'สารี', hours: 3.5 }, { who: 'เจ', hours: 2.0 } ],
            availability: [
                { name: 'สารี', status: 'Available' }, { name: 'เจ', status: 'WFH' }, { name: 'นิว', status: 'Sick' }
            ]
        };
    },
    async getBdDashboardData() {
        return {
            kpis: { pipeline_value: 74300000, win_rate: 32, follow_ups: 3 },
            opportunities: [
                { name: 'สถานี Interchange เมืองใหม่', client: 'Metro Dev Co.', stage: 'Prospecting', value: 8800000 },
                { name: 'สะพานข้ามแม่น้ำ X', client: 'River Authority', stage: 'Proposal Sent', value: 16500000 },
                { name: 'อาคารสำนักงาน Q', client: 'Q Estates', stage: 'Negotiation', value: 9700000 }
            ]
        };
    },
    async getRmDashboardData() {
        return {
            kpis: { company_utilization: 82, on_bench: 4, overallocated: 2 },
            bench_report: [
                { name: 'อัครชัย รัตนศิริ', role: 'Civil Eng.', availableFrom: '2025-08-27' },
                { name: 'ธารา ทองดี', role: 'Civil Eng.', availableFrom: '2025-08-29' }
            ]
        };
    }
};

// --- PASTE THE ORIGINAL FUNCTIONS BELOW ---
/*
async function getUserProfile...
async function getUserRoles...
... etc
*/