export const loadBrevoConversations = (conversationsId: string) => {
    if (window.BrevoConversations) return;



    // @ts-ignore
    window.BrevoConversationsID = conversationsId;
    // @ts-ignore
    window.BrevoConversations = window.BrevoConversations || function () {
        // @ts-ignore
        (window.BrevoConversations.q = window.BrevoConversations.q || []).push(arguments);
    };

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://conversations-widget.brevo.com/brevo-conversations.js';

    if (document.head) {
        document.head.appendChild(script);
    }
};

export const openBrevoChat = () => {
    const brevoId = import.meta.env.VITE_BREVO_CONVERSATIONS_APP_ID;

    // Helper to actually open the chat
    const tryOpenChat = (attempt = 1) => {
        if (window.BrevoConversations) {
            // Ensure visibility
            document.body.classList.add('brevo-visible');

            // Force z-index on mobile to appear above everything
            const brevoRoot = document.getElementById('brevo-root');
            if (brevoRoot) {
                brevoRoot.style.zIndex = '99999';
                brevoRoot.style.position = 'fixed';
            }

            // @ts-ignore
            window.BrevoConversations('show', true);
            // @ts-ignore
            window.BrevoConversations('openChat', true);

            console.log('[Brevo] Chat opened successfully');
        } else if (attempt < 5) {
            // Retry up to 5 times with increasing delay
            console.log(`[Brevo] Waiting for script... attempt ${attempt}`);
            setTimeout(() => tryOpenChat(attempt + 1), 500 * attempt);
        } else {
            console.error('[Brevo] Failed to load after 5 attempts');
        }
    };

    // Load script on-demand if not already loaded
    if (!window.BrevoConversations && brevoId) {
        loadBrevoConversations(brevoId);
        // Wait for script to load, then try opening
        setTimeout(() => tryOpenChat(1), 1500);
        return;
    }

    // Already loaded, open immediately
    tryOpenChat(1);
};

export const closeBrevoChat = () => {
    if (window.BrevoConversations) {
        // @ts-ignore
        window.BrevoConversations('minimize', true);
    }
    // Remove visibility class after generic delay
    setTimeout(() => {
        document.body.classList.remove('brevo-visible');
    }, 300);
};

declare global {
    interface Window {
        BrevoConversations: any;
        BrevoConversationsID: string;
    }
}
