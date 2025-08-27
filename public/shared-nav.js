// This file contains the standardized function for setting up the navigation bar.
// It has been updated to handle all logic internally for simplicity and stability.

/**
 * Checks if a given user is the manager of at least one other user.
 * @param {string} userId The UID of the user to check.
 * @returns {Promise<boolean>} True if the user is a manager, false otherwise.
 */
async function isUserManager(userId) {
    if (!db) return false; // Safety check if firestore is not available
    try {
        const querySnapshot = await db.collection('users')
            .where('managerId', '==', userId)
            .limit(1)
            .get();
        return !querySnapshot.empty; // Returns true if the query finds at least one document
    } catch (error) {
        console.error("Error checking if user is a manager:", error);
        return false;
    }
}

/**
 * Asynchronously sets up the navigation bar based on the user's role and permissions.
 * @param {object} user The authenticated user object from Firebase.
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

    // Check if the user is a manager of someone, this logic is now internal to setupNavbar
    const isManagerOfSomeone = userRole === 'manager' ? await isUserManager(user.uid) : false;

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
    logoutButton.addEventListener('click', () => {
        if (auth) auth.signOut().catch(error => console.error("Sign out failed:", error));
    });
}
