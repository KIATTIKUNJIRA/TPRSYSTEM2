// public/assets/ui.js
export const ui = {
    renderMenu: (user, activePage) => {
        const menuContainer = document.getElementById('main-menu');
        if (!menuContainer) return;
        
        const userRoles = Array.isArray(user.roles) ? user.roles : [];
        
        const menuItems = [
            { id: 'ceo_dashboard', label: 'ภาพรวมผู้บริหาร (CEO)', roles: ['admin', 'ceo'] },
            { id: 'pm_dashboard', label: 'ผู้จัดการโครงการ (PM)', roles: ['admin', 'pm'] },
            { id: 'team_lead_dashboard', label: 'หัวหน้าฝ่าย (Lead)', roles: ['admin', 'team_lead', 'pm'] }, // PM/Lead อาจเห็นเมนูคล้ายกัน
            { id: 'hr_dashboard', label: 'ฝ่ายบุคคล (HR)', roles: ['admin', 'hr'] },
            { id: 'accounting_dashboard', label: 'ฝ่ายบัญชี (Accounting)', roles: ['admin', 'accounting'] },
            { id: 'resource_manager_dashboard', label: 'จัดการทรัพยากร (RM)', roles: ['admin', 'pm'] }, // สมมติให้ PM ทำหน้าที่ RM ด้วย
            { id: 'bd_dashboard', label: 'พัฒนาธุรกิจ (BD)', roles: ['admin', 'ceo'] }, // สมมติให้ CEO ดูแล BD ด้วย
            { id: 'employee_dashboard', label: 'โต๊ะทำงานของฉัน', roles: ['admin', 'employee'] }
        ];

        const accessibleMenuItems = menuItems.filter(item => 
            item.roles.some(role => userRoles.includes(role))
        );

        menuContainer.innerHTML = accessibleMenuItems.map(item => `
            <a href="#${item.id}" 
               class="main-menu-item ${activePage === item.id ? 'active' : ''}" 
               data-page="${item.id}">
               ${item.label}
            </a>
        `).join('');
    },
    // --- PASTE THE REST OF THE ORIGINAL ui.js FUNCTIONS HERE ---
    /*
    renderPageTitle...
    renderUserInfo...
    renderContent...
    */
};
    
    renderPageTitle: (title) => {
        const titleEl = document.getElementById('page-title');
        if (titleEl) titleEl.textContent = title;
    },

    renderUserInfo: (user) => {
        const userContainer = document.getElementById('user-info');
        if(userContainer && user && user.profile){
            userContainer.innerHTML = `
                <div class="font-semibold text-slate-800">${user.profile.first_name || user.email}</div>
                <div class="text-xs text-slate-500">${Array.isArray(user.roles) ? user.roles.join(', ') : ''}</div>
            `;
        }
    },
    
    renderContent: async (pageId) => {
        const contentContainer = document.getElementById('app-content');
        if (!contentContainer) return;

        contentContainer.innerHTML = `<div class="text-center text-slate-500">Loading ${pageId}...</div>`;

        try {
            const response = await fetch(`pages/${pageId}.html`);
            if (!response.ok) throw new Error(`Page not found: ${pageId}.html`);
            
            contentContainer.innerHTML = await response.text();
        } catch (error) {
            console.error('Failed to load page:', error);
            contentContainer.innerHTML = `<div class="text-center text-red-600 p-4 bg-red-50 rounded-xl">
                <div class="font-bold">Failed to load content</div>
                <div>Could not load <code>pages/${pageId}.html</code>. Please make sure the file exists.</div>
            </div>`;
        }
    }
};