import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WuzAPI Configuration - usando APENAS variáveis de ambiente (secrets)
const WUZAPI_URL = Deno.env.get('WUZAPI_URL');
const WUZAPI_TOKEN = Deno.env.get('WUZAPI_TOKEN');
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

async function sendMessage(phone: string, message: string): Promise<{ success: boolean; data?: unknown; error?: string }> {
    const response = await fetch(`${WUZAPI_URL}/chat/send/text`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'token': WUZAPI_TOKEN!,
        },
        body: JSON.stringify({
            Phone: phone,
            Body: message,
        }),
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
        return { success: false, error: result.error || `HTTP ${response.status}` };
    }

    return { success: true, data: result };
}

async function attemptReconnect(): Promise<boolean> {
    try {
        console.log('[send-whatsapp] Tentando reconectar sessão...');
        const response = await fetch(`${WUZAPI_URL}/session/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': WUZAPI_TOKEN!,
            },
            body: JSON.stringify({}),
        });
        const data = await response.json();
        console.log('[send-whatsapp] Resposta reconexão:', JSON.stringify(data));

        await new Promise(r => setTimeout(r, 3000));
        return true;
    } catch (error) {
        console.error('[send-whatsapp] Erro na reconexão:', error);
        return false;
    }
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Verificar se as variáveis de ambiente estão configuradas
    if (!WUZAPI_URL || !WUZAPI_TOKEN) {
        console.error('[send-whatsapp] ERRO: Variáveis de ambiente não configuradas');
        return new Response(JSON.stringify({
            success: false,
            error: 'Configuração do servidor incompleta'
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
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

        console.log(`[send-whatsapp] Enviando para ${phone}`);

        // Primeira tentativa
        let result = await sendMessage(phone, message);

        // Se falhou com erro de sessão, tentar reconectar e enviar novamente
        if (!result.success && result.error) {
            const sessionErrors = ['not connected', 'no session', 'logged out', 'disconnected'];
            const isSessionError = sessionErrors.some(e => result.error!.toLowerCase().includes(e));

            if (isSessionError) {
                console.log('[send-whatsapp] Sessão perdida detectada, tentando reconectar...');

                const reconnected = await attemptReconnect();
                if (reconnected) {
                    console.log('[send-whatsapp] Retentando envio após reconexão...');
                    result = await sendMessage(phone, message);
                }
            }
        }

        console.log('[send-whatsapp] Resultado:', result.success ? 'OK' : result.error);

        if (!result.success) {
            return new Response(JSON.stringify({ success: false, error: result.error || 'WuzAPI error' }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        return new Response(JSON.stringify({ success: true, data: result.data }), {
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
