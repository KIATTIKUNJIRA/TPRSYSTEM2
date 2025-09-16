// public/assets/router.js
import { ui } from './ui.js';

let appUser = null;

async function loadPage() {
    // Read the hash and split into pageId and optional query string.
    // Support hashes like: #project_detail?id=123 or #ceo_dashboard
    const raw = (location.hash || '').substring(1) || 'ceo_dashboard';
    const [pageIdPart, queryString] = raw.split('?');
    const pageId = pageIdPart || 'ceo_dashboard';

    // Parse query params from the hash (not from location.search)
    const hashParams = new URLSearchParams(queryString || '');
    const idParam = hashParams.get('id');

    console.log(`Routing to page: ${pageId}`, { id: idParam });

    // Update the menu to highlight the active page
    ui.renderMenu(appUser, pageId);

    // Update the page title in the header
    const pageTitle = pageId.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()); // e.g., "Ceo Dashboard"
    ui.renderPageTitle(pageTitle);

    // Fetch and render the content for the page
    await ui.renderContent(pageId);
    
    // After content is loaded, run its specific init script if it exists.
    // For project_detail, pass the id param as second argument: pageInit.project_detail(currentUser, id)
    if (window.pageInit && typeof window.pageInit[pageId] === 'function') {
        if (pageId === 'project_detail') {
            window.pageInit[pageId](appUser, idParam);
        } else {
            window.pageInit[pageId](appUser);
        }
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