import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WuzAPI Configuration - usar variáveis de ambiente para maior segurança
const WUZAPI_URL = Deno.env.get('WUZAPI_URL') || 'http://54.232.81.168:8080';
const WUZAPI_TOKEN = Deno.env.get('WUZAPI_TOKEN') || '';
const DEFAULT_DDD = '27';
const DEFAULT_COUNTRY = '55';

function normalizePhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (!cleaned) return '';

    const length = cleaned.length;

    if (length === 8) {
        cleaned = DEFAULT_COUNTRY + DEFAULT_DDD + cleaned;
    } else if (length === 9) {
        cleaned = DEFAULT_COUNTRY + DEFAULT_DDD + cleaned;
    } else if (length === 10 || length === 11) {
        cleaned = DEFAULT_COUNTRY + cleaned;
    }

    return cleaned;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { phone: rawPhone, message } = await req.json();
        const phone = normalizePhone(rawPhone || '');

        if (!phone || phone.length < 10) {
            console.log(`[send-whatsapp] Número inválido após normalização: ${rawPhone}`);
            return new Response(JSON.stringify({
                success: false,
                error: 'Número de telefone inválido'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        if (!message) {
            return new Response(JSON.stringify({ success: false, error: 'Message is required' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        if (!WUZAPI_TOKEN) {
            console.error('[send-whatsapp] WUZAPI_TOKEN não configurado');
            return new Response(JSON.stringify({
                success: false,
                error: 'WUZAPI_TOKEN não configurado'
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        console.log(`[send-whatsapp] Enviando para ${phone} (original: ${rawPhone})`);

        const response = await fetch(`${WUZAPI_URL}/chat/send/text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': WUZAPI_TOKEN,
            },
            body: JSON.stringify({
                Phone: phone,
                Body: message,
            }),
        });

        const result = await response.json();
        console.log('[send-whatsapp] WuzAPI response:', JSON.stringify(result));

        if (!result.success) {
            return new Response(JSON.stringify({ success: false, error: result.error || 'WuzAPI error' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        return new Response(JSON.stringify({ success: true, data: result }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('[send-whatsapp] Error:', error);
        return new Response(JSON.stringify({ success: false, error: String(error) }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }
});
