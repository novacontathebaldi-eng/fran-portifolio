// supabase/functions/check-wuzapi/index.ts
// Edge Function para verificar saúde do WuzAPI e auto-recover se necessário
// Chamado via cron job a cada 5 minutos

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// WuzAPI Configuration - usando APENAS variáveis de ambiente (secrets)
const WUZAPI_URL = Deno.env.get('WUZAPI_URL');
const WUZAPI_TOKEN = Deno.env.get('WUZAPI_TOKEN');

// Configurações de restart (estas são menos críticas, podem ficar no código)
const VPS_RESTART_URL = Deno.env.get('VPS_RESTART_URL') || 'http://54.232.81.168:8090/restart';
const RESTART_SECRET = Deno.env.get('WUZAPI_RESTART_SECRET') || 'ApiRestartSecret2025';

interface WuzAPIStatus {
    Connected: boolean;
    LoggedIn: boolean;
    Jid?: string;
    error?: string;
}

interface HealthCheckResult {
    success: boolean;
    connected: boolean;
    loggedIn: boolean;
    jid?: string;
    action: 'none' | 'reconnect' | 'restart';
    actionSuccess: boolean;
    error?: string;
}

async function checkWuzAPIStatus(): Promise<WuzAPIStatus> {
    try {
        const response = await fetch(`${WUZAPI_URL}/session/status`, {
            method: 'GET',
            headers: {
                'token': WUZAPI_TOKEN!,
            },
        });

        if (!response.ok) {
            return { Connected: false, LoggedIn: false, error: `HTTP ${response.status}` };
        }

        const data = await response.json();
        return {
            Connected: data.Connected === true,
            LoggedIn: data.LoggedIn === true,
            Jid: data.Jid,
        };
    } catch (error) {
        console.error('[check-wuzapi] Erro ao verificar status:', error);
        return { Connected: false, LoggedIn: false, error: String(error) };
    }
}

async function attemptReconnect(): Promise<boolean> {
    try {
        console.log('[check-wuzapi] Tentando reconectar sessão...');

        const response = await fetch(`${WUZAPI_URL}/session/connect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': WUZAPI_TOKEN!,
            },
            body: JSON.stringify({}),
        });

        const data = await response.json();
        console.log('[check-wuzapi] Resposta da reconexão:', JSON.stringify(data));

        await new Promise(r => setTimeout(r, 5000));

        const status = await checkWuzAPIStatus();
        return status.Connected && status.LoggedIn;
    } catch (error) {
        console.error('[check-wuzapi] Erro na reconexão:', error);
        return false;
    }
}

async function attemptRestart(): Promise<boolean> {
    try {
        console.log('[check-wuzapi] Tentando reiniciar WuzAPI via VPS...');

        const response = await fetch(VPS_RESTART_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ secret: RESTART_SECRET }),
        });

        const data = await response.json();
        console.log('[check-wuzapi] Resposta do restart:', JSON.stringify(data));

        return data.success === true;
    } catch (error) {
        console.error('[check-wuzapi] Erro no restart:', error);
        return false;
    }
}

async function logHealthCheck(
    supabase: ReturnType<typeof createClient>,
    result: HealthCheckResult
): Promise<void> {
    try {
        const { error } = await supabase
            .from('wuzapi_health_logs')
            .insert({
                connected: result.connected,
                logged_in: result.loggedIn,
                jid: result.jid,
                action_taken: result.action,
                success: result.actionSuccess,
            });

        if (error) {
            console.log('[check-wuzapi] Log não salvo (tabela pode não existir):', error.message);
        }
    } catch {
        // Ignorar erros de log - não é crítico
    }
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    // Verificar se as variáveis de ambiente estão configuradas
    if (!WUZAPI_URL || !WUZAPI_TOKEN) {
        console.error('[check-wuzapi] ERRO: Variáveis de ambiente não configuradas');
        return new Response(JSON.stringify({
            success: false,
            error: 'Configuração do servidor incompleta',
            action: 'none',
            actionSuccess: false,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    try {
        console.log('[check-wuzapi] Iniciando verificação de saúde...');

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const status = await checkWuzAPIStatus();
        console.log('[check-wuzapi] Status atual:', JSON.stringify(status));

        const result: HealthCheckResult = {
            success: true,
            connected: status.Connected,
            loggedIn: status.LoggedIn,
            jid: status.Jid,
            action: 'none',
            actionSuccess: true,
        };

        if (!status.Connected || !status.LoggedIn) {
            console.log('[check-wuzapi] Sessão não conectada, tentando reconectar...');
            result.action = 'reconnect';

            const reconnected = await attemptReconnect();

            if (reconnected) {
                console.log('[check-wuzapi] Reconexão bem-sucedida!');
                result.actionSuccess = true;
                result.connected = true;
                result.loggedIn = true;
            } else {
                console.log('[check-wuzapi] Reconexão falhou, tentando restart...');
                result.action = 'restart';

                const restarted = await attemptRestart();
                result.actionSuccess = restarted;

                if (restarted) {
                    console.log('[check-wuzapi] Restart solicitado com sucesso!');
                } else {
                    console.log('[check-wuzapi] Restart falhou!');
                    result.success = false;
                    result.error = 'Falha na reconexão e restart';
                }
            }
        } else {
            console.log('[check-wuzapi] WuzAPI conectado e funcionando!');
        }

        await logHealthCheck(supabase, result);

        return new Response(JSON.stringify(result), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });

    } catch (error) {
        console.error('[check-wuzapi] Erro geral:', error);
        return new Response(JSON.stringify({
            success: false,
            error: String(error),
            action: 'none',
            actionSuccess: false,
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }
});
