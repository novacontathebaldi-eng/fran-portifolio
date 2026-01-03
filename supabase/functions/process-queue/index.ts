// supabase/functions/process-queue/index.ts
// Edge Function para processar fila de notificações WhatsApp
// Chamado via cron job a cada 1 minuto

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WuzAPI Configuration - IP FIXO
const WUZAPI_URL = 'http://54.232.81.168:8080';
const WUZAPI_TOKEN = Deno.env.get('WUZAPI_TOKEN') || 'MeuWhatsToken2025';
const DEFAULT_DDD = '27';
const DEFAULT_COUNTRY = '55';

function normalizePhone(phone: string): string {
    let cleaned = phone.replace(/\D/g, '');
    if (!cleaned) return '';

    const length = cleaned.length;

    if (length === 8 || length === 9) {
        cleaned = DEFAULT_COUNTRY + DEFAULT_DDD + cleaned;
    } else if (length === 10 || length === 11) {
        cleaned = DEFAULT_COUNTRY + cleaned;
    }

    return cleaned;
}

interface WuzAPIStatus {
    Connected: boolean;
    LoggedIn: boolean;
}

async function checkWuzAPIHealth(): Promise<WuzAPIStatus> {
    try {
        const response = await fetch(`${WUZAPI_URL}/session/status`, {
            method: 'GET',
            headers: { 'token': WUZAPI_TOKEN },
        });

        if (!response.ok) {
            return { Connected: false, LoggedIn: false };
        }

        const data = await response.json();
        return {
            Connected: data.Connected === true,
            LoggedIn: data.LoggedIn === true,
        };
    } catch (error) {
        console.error('[process-queue] Erro ao verificar saúde:', error);
        return { Connected: false, LoggedIn: false };
    }
}

async function attemptReconnect(): Promise<boolean> {
    try {
        console.log('[process-queue] Tentando reconectar sessão...');
        const response = await fetch(`${WUZAPI_URL}/session/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': WUZAPI_TOKEN,
            },
        });
        const data = await response.json();
        console.log('[process-queue] Resposta reconexão:', JSON.stringify(data));

        // Aguardar conexão estabilizar
        await new Promise(r => setTimeout(r, 5000));
        return true;
    } catch (error) {
        console.error('[process-queue] Erro na reconexão:', error);
        return false;
    }
}

async function sendWhatsApp(phone: string, message: string): Promise<{ success: boolean; error?: string }> {
    const normalizedPhone = normalizePhone(phone);
    if (!normalizedPhone) return { success: false, error: 'Invalid phone' };

    try {
        const response = await fetch(`${WUZAPI_URL}/chat/send/text`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': WUZAPI_TOKEN,
            },
            body: JSON.stringify({
                Phone: normalizedPhone,
                Body: message,
            }),
        });

        const result = await response.json();

        if (!response.ok || !result.success) {
            return { success: false, error: result.error || `HTTP ${response.status}` };
        }

        return { success: true };
    } catch (error) {
        console.error('[process-queue] Erro ao enviar:', error);
        return { success: false, error: String(error) };
    }
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        console.log('[process-queue] Iniciando processamento...');

        // Initialize Supabase client
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // 1. Verificar saúde do WuzAPI ANTES de processar
        const health = await checkWuzAPIHealth();
        console.log('[process-queue] Saúde WuzAPI:', JSON.stringify(health));

        if (!health.Connected || !health.LoggedIn) {
            console.log('[process-queue] ⚠️ WuzAPI desconectado, tentando reconectar...');

            const reconnected = await attemptReconnect();

            if (!reconnected) {
                console.log('[process-queue] ❌ Reconexão falhou, abortando processamento');
                return new Response(JSON.stringify({
                    success: false,
                    error: 'WuzAPI não conectado',
                    processed: 0,
                    sent: 0,
                    failed: 0,
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }

            // Verificar novamente após reconexão
            const healthAfter = await checkWuzAPIHealth();
            if (!healthAfter.Connected || !healthAfter.LoggedIn) {
                console.log('[process-queue] ❌ Ainda desconectado após reconexão');
                return new Response(JSON.stringify({
                    success: false,
                    error: 'Falha na reconexão do WuzAPI',
                    processed: 0,
                    sent: 0,
                    failed: 0,
                }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    status: 200,
                });
            }

            console.log('[process-queue] ✅ Reconexão bem-sucedida!');
        }

        // 2. Buscar itens pendentes (limitar para evitar timeout)
        const { data: items, error: fetchError } = await supabase
            .from('notification_queue')
            .select('*')
            .eq('status', 'pending')
            .lte('scheduled_for', new Date().toISOString())
            .order('created_at', { ascending: true })
            .limit(10);

        if (fetchError) {
            console.error('[process-queue] Erro ao buscar fila:', fetchError);
            return new Response(JSON.stringify({
                success: false,
                error: fetchError.message
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        if (!items || items.length === 0) {
            console.log('[process-queue] Nenhum item pendente');
            return new Response(JSON.stringify({
                success: true,
                message: 'Nenhum item pendente',
                processed: 0,
                sent: 0,
                failed: 0,
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        console.log(`[process-queue] ${items.length} item(ns) para processar`);

        let sent = 0;
        let failed = 0;

        // 3. Processar cada item
        for (const item of items) {
            // Marcar como 'processing' primeiro
            await supabase
                .from('notification_queue')
                .update({
                    status: 'processing',
                    attempts: item.attempts + 1
                })
                .eq('id', item.id);

            let result: { success: boolean; error?: string };

            if (item.type === 'whatsapp' && item.phone) {
                result = await sendWhatsApp(item.phone, item.message);
            } else {
                result = { success: false, error: 'Invalid notification type or missing phone' };
            }

            if (result.success) {
                // Marcar como 'sent'
                await supabase
                    .from('notification_queue')
                    .update({
                        status: 'sent',
                        processed_at: new Date().toISOString()
                    })
                    .eq('id', item.id);
                sent++;
                console.log(`[process-queue] ✅ Enviado: ${item.id}`);
            } else {
                // Marcar como 'failed' ou voltar para 'pending' se ainda tem tentativas
                const newStatus = item.attempts + 1 >= 3 ? 'failed' : 'pending';
                await supabase
                    .from('notification_queue')
                    .update({
                        status: newStatus,
                        error_message: result.error || 'Unknown error'
                    })
                    .eq('id', item.id);
                failed++;
                console.log(`[process-queue] ❌ Falha: ${item.id} - ${result.error}`);
            }

            // Delay entre envios para não sobrecarregar
            if (items.indexOf(item) < items.length - 1) {
                await new Promise(r => setTimeout(r, 1500));
            }
        }

        console.log(`[process-queue] Resultado: ${sent} enviados, ${failed} falhas`);

        return new Response(JSON.stringify({
            success: true,
            message: `Processamento completo`,
            processed: items.length,
            sent,
            failed
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('[process-queue] Error:', error);
        return new Response(JSON.stringify({
            success: false,
            error: String(error)
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }
});
