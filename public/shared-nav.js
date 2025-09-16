// This file contains the standardized function for setting up the navigation bar.
// It has been updated to handle all logic internally for simplicity and stability.

/**
 * Checks if a given user is the manager of at least one other user.
 * @param {string} userId The UID of the user to check.
 * @returns {Promise<boolean>} True if the user is a manager, false otherwise.
 */
// isUserManager: replaced Firestore check with a roles-based heuristic or API lookup.
// We'll treat 'manager' role as sufficient; if finer checks are needed, call api.getMyAssignments or
// implement a server-side SQL function to determine reporting relationships.
async function isUserManager(userId) {
    // Prefer role-based check using auth module (currentUser.roles)
    try {
        const mod = await import('./assets/auth.js');
        const current = mod.getCurrentUser();
        if (!current) return false;
        // if the current user has manager role, assume they manage someone
        if (Array.isArray(current.roles) && current.roles.includes('manager')) return true;
        // Fallback: check via API for assignments (if present)
        const apiMod = await import('./assets/api.js');
        const assignments = await apiMod.api.getMyAssignments(current.id);
        return Array.isArray(assignments) && assignments.length > 0;
    } catch (e) {
        console.warn('isUserManager fallback failed', e);
        return false;
    }
}

/**
 * Asynchronously sets up the navigation bar based on the user's role and permissions.
 * @param {object} user The authenticated user object.
 * @param {string} userRole The role of the user (e.g., 'admin', 'manager', 'staff').
 * @param {string} currentPage The identifier for the current active page.
 */
async function setupNavbar(user, userRole, currentPage) {
    const navLinks = document.getElementById('nav-links');
    const userInfoNav = document.getElementById('user-info-nav');
    const logoutButton = document.getElementById('logout-button');

    if (!navLinks || !userInfoNav || !logoutButton) {
        console.error("Navbar elements not found!");
        return;
    }

    // Check if the user is a manager of someone (role-based or via assignments)
    const isManagerOfSomeone = userRole === 'manager' ? await isUserManager(user.id || user.uid) : false;

    const navItems = {
        'hr-dashboard': { href: 'hr-dashboard.html', text: 'HR Dashboard', roles: ['admin', 'hr'] },
        'dashboard': { href: 'dashboard.html', text: 'Project Dashboard', roles: ['admin', 'hr'] },
        'employees': { href: 'employees.html', text: 'จัดการพนักงาน', roles: ['admin', 'hr'] },
        'departments': { href: 'departments.html', text: 'จัดการแผนก', roles: ['admin', 'hr'] },
        'locations': { href: 'locations.html', text: 'จัดการสถานที่', roles: ['admin', 'hr'] },
        'payroll': { href: 'payroll.html', text: 'ระบบเงินเดือน', roles: ['admin', 'hr'] },
        'org-chart': { href: 'org-chart.html', text: 'ผังองค์กร', roles: ['admin', 'hr', 'manager', 'staff'] },
        'leave': { href: 'leave.html', text: 'ระบบการลา', roles: ['admin', 'hr', 'manager', 'staff'] },
        'attendance': { href: 'attendance.html', text: 'ระบบลงเวลา', roles: ['admin', 'hr', 'manager', 'staff'] },
        'tasks': { href: 'tasks.html', text: 'งานของฉัน', roles: ['admin', 'hr', 'manager', 'staff'] },
        'approvals': { 
            href: 'approvals.html', 
            text: 'อนุมัติใบลา', 
            roles: ['admin', 'hr', 'manager'],
            // Condition: Show if admin/hr, OR if they are a manager of at least one person
            condition: (role) => role !== 'manager' || isManagerOfSomeone
        },
    };

    let linksHtml = '';
    for (const key in navItems) {
        const item = navItems[key];
        let shouldShow = item.roles.includes(userRole);
        
        if (shouldShow && item.condition) {
            shouldShow = item.condition(userRole);
        }

        if (shouldShow) {
            const isActive = (key === currentPage) ? 'active' : '';
            linksHtml += `<li class="nav-item"><a class="nav-link ${isActive}" href="${item.href}">${item.text}</a></li>`;
        }
    }
    navLinks.innerHTML = linksHtml;

    userInfoNav.innerText = `${user.email} (สิทธิ์: ${userRole})`;
    userInfoNav.style.display = 'inline';
    logoutButton.style.display = 'inline-block';
    logoutButton.addEventListener('click', async () => {
        logoutButton.disabled = true;
        logoutButton.textContent = 'Signing out...';
        try {
            // Try Supabase signOut if available
            try {
                // import supabase client dynamically so this file works both in module and non-module contexts
                const mod = await import('./assets/supabase-client.js');
                if (mod && mod.supabase && mod.supabase.auth && typeof mod.supabase.auth.signOut === 'function') {
                    const { error } = await mod.supabase.auth.signOut();
                    if (error) console.warn('Supabase signOut warning:', error.message);
                }
            } catch (e) {
                // ignore if supabase client isn't available
            }

            // Prefer Supabase signOut via assets/supabase-client.js
            try {
                const mod = await import('./assets/supabase-client.js');
                if (mod && mod.supabase && mod.supabase.auth && typeof mod.supabase.auth.signOut === 'function') {
                    const { error } = await mod.supabase.auth.signOut();
                    if (error) console.warn('Supabase signOut warning:', error.message);
                }
            } catch (e) {
                // ignore if supabase client isn't available
            }

            // Redirect to login page after sign-out
            window.location.href = 'login.html';
        } catch (err) {
            console.error('Error during sign-out:', err);
            logoutButton.disabled = false;
            logoutButton.textContent = 'Logout';
            alert('เกิดข้อผิดพลาดขณะออกจากระบบ');
        }
    });
}
