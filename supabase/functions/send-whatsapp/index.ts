import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WuzAPI Configuration
const WUZAPI_URL = 'http://54.94.205.227:8080';
const WUZAPI_INSTANCE = 'fransiller';
const WUZAPI_TOKEN = 'MeuWhatsToken2025';
const DEFAULT_RECIPIENT = '352691214222';

interface SendWhatsAppRequest {
    phone?: string;
    message: string;
    type?: 'budget' | 'appointment' | 'contact' | 'chatbot';
}

Deno.serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body: SendWhatsAppRequest = await req.json();
        const { phone, message, type } = body;

        if (!message) {
            return new Response(JSON.stringify({
                success: false,
                error: 'Message is required'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400,
            });
        }

        // Use provided phone or default recipient
        const recipientPhone = (phone || DEFAULT_RECIPIENT).replace(/\D/g, '');

        console.log(`[send-whatsapp] Sending to ${recipientPhone} | Type: ${type || 'generic'}`);

        // Send message via WuzAPI
        const response = await fetch(`${WUZAPI_URL}/chat/send/text/${WUZAPI_INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': WUZAPI_TOKEN,
            },
            body: JSON.stringify({
                phone: recipientPhone,
                message: message,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[send-whatsapp] WuzAPI Error:', response.status, errorText);
            return new Response(JSON.stringify({
                success: false,
                error: `WuzAPI error: ${response.status}`
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500,
            });
        }

        const result = await response.json();
        console.log('[send-whatsapp] Message sent successfully:', result);

        return new Response(JSON.stringify({
            success: true,
            data: result
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('[send-whatsapp] Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }
});
