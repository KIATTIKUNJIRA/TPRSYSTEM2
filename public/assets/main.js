// public/assets/main.js
import { supabase } from './supabase-client.js';
import { handleAuth, getCurrentUser } from './auth.js';
import { router } from './router.js';

async function main() {
    const currentUser = await handleAuth();

    if (currentUser) {
        // เปลี่ยนหน้าเริ่มต้นเป็น 'hub'
        router.init(currentUser, 'hub'); // Start with the 'hub' page

        document.getElementById('logout-button').addEventListener('click', async () => {
            await supabase.auth.signOut();
            // Use relative redirect to avoid issues with servers that interpret leading slash differently
            window.location.href = 'login.html';
        });
    }
}

main();