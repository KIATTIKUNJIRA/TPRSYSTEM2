// public/assets/auth.js
import { supabase } from './supabase-client.js';
import { api } from './api.js';
import { ui } from './ui.js';

let currentUser = null;

export async function handleAuth() {
    // Check for a user session
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
        console.error("Error getting session:", error);
        return null;
    }
    
    if (!session) {
        // If no session, redirect to login page
        window.location.href = '/login.html';
        return null;
    }

    console.log("Session found for user:", session.user.email);

    // Fetch profile and roles from our database tables
    const profile = await api.getUserProfile(session.user.id);
    const roles = await api.getUserRoles(session.user.id);

    if (!profile) {
        console.error("Could not find a profile for the user.");
        window.location.href = '/login.html';
        return null;
    }
    
    // Combine all user information into a single object
    currentUser = {
        id: session.user.id,
        email: session.user.email,
        profile: profile,
        roles: roles.map(r => r.name) // Get an array of role names, e.g., ['admin', 'ceo']
    };
    
    console.log("Current User Initialized:", currentUser);

    // Render user-specific UI elements
    ui.renderUserInfo(currentUser);

    return currentUser;
}

export function getCurrentUser() {
    return currentUser;
}