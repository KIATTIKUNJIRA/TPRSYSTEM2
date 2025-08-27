// public/assets/router.js
import { ui } from './ui.js';

let appUser = null;

async function loadPage() {
    // Get the page id from the URL hash (e.g., #ceo_dashboard)
    const pageId = location.hash.substring(1) || 'ceo_dashboard'; // Default to CEO dash for now

    console.log(`Routing to page: ${pageId}`);

    // Update the menu to highlight the active page
    ui.renderMenu(appUser, pageId);

    // Update the page title in the header
    const pageTitle = pageId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()); // e.g., "Ceo Dashboard"
    ui.renderPageTitle(pageTitle);

    // Fetch and render the content for the page
    await ui.renderContent(pageId);
    
    // After content is loaded, run its specific init script if it exists
    if (window.pageInit && typeof window.pageInit[pageId] === 'function') {
        window.pageInit[pageId](appUser);
    }
}

export const router = {
    init: (user) => {
        if (!user) {
            console.error("Router cannot be initialized without a user.");
            return;
        }
        appUser = user;

        // Listen for URL hash changes to load new pages
        window.addEventListener('hashchange', loadPage);
        
        // Load the initial page based on the current URL hash
        loadPage();
    }
};