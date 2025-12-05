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
    document.body.classList.add('brevo-visible');
    if (window.BrevoConversations) {
        // @ts-ignore
        window.BrevoConversations('openChat', true);
        // @ts-ignore
        window.BrevoConversations('show', true);
    }
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
