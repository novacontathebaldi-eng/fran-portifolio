// src/utils/whatsappService.ts
// Serviço para enviar notificações via WhatsApp usando WuzAPI

import { supabase } from '../supabaseClient';

// Configuração da API WuzAPI
const WUZAPI_URL = 'http://54.94.205.227:8080';
const WUZAPI_INSTANCE = 'fransiller';
const WUZAPI_TOKEN = 'MeuWhatsToken2025';

interface WhatsAppConfig {
    enabled: boolean;
    recipientPhone: string;
    notifyBudget: boolean;
    notifyAppointment: boolean;
    notifyContact: boolean;
    notifyChatbot: boolean;
}

// Cache da configuração para evitar múltiplas consultas
let cachedConfig: WhatsAppConfig | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60000; // 1 minuto

/**
 * Obtém a configuração do WhatsApp do banco de dados
 */
export const getWhatsAppConfig = async (): Promise<WhatsAppConfig> => {
    // Usar cache se válido
    if (cachedConfig && Date.now() - cacheTime < CACHE_DURATION) {
        return cachedConfig;
    }

    // Configuração padrão
    const defaultConfig: WhatsAppConfig = {
        enabled: true,
        recipientPhone: '352691214222',
        notifyBudget: true,
        notifyAppointment: true,
        notifyContact: true,
        notifyChatbot: true,
    };

    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('settings')
            .eq('id', '00000000-0000-0000-0000-000000000001')
            .single();

        if (error || !data?.settings?.global?.whatsappConfig) {
            return defaultConfig;
        }

        cachedConfig = { ...defaultConfig, ...data.settings.global.whatsappConfig } as WhatsAppConfig;
        cacheTime = Date.now();
        return cachedConfig;
    } catch (error) {
        console.error('[WhatsApp] Erro ao buscar config:', error);
        return defaultConfig;
    }
};

/**
 * Limpa o cache da configuração (chamar ao atualizar config)
 */
export const clearWhatsAppConfigCache = () => {
    cachedConfig = null;
    cacheTime = 0;
};

/**
 * Envia uma mensagem via WuzAPI
 */
const sendWhatsAppMessage = async (phone: string, message: string): Promise<boolean> => {
    try {
        // Formatar número (remover +, espaços, etc.)
        const formattedPhone = phone.replace(/\D/g, '');

        const response = await fetch(`${WUZAPI_URL}/chat/send/text/${WUZAPI_INSTANCE}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'token': WUZAPI_TOKEN,
            },
            body: JSON.stringify({
                phone: formattedPhone,
                message: message,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('[WhatsApp] Erro na API:', response.status, errorText);
            return false;
        }

        console.log('[WhatsApp] Mensagem enviada com sucesso para:', formattedPhone);
        return true;
    } catch (error) {
        console.error('[WhatsApp] Erro ao enviar mensagem:', error);
        return false;
    }
};

/**
 * Notifica novo orçamento via WhatsApp
 */
export const notifyWhatsAppBudget = async (data: {
    clientName: string;
    city: string;
    services: string[];
}): Promise<boolean> => {
    const config = await getWhatsAppConfig();

    if (!config.enabled || !config.notifyBudget) {
        console.log('[WhatsApp] Notificação de orçamento desativada');
        return false;
    }

    const message = `💰 *Novo Orçamento*

👤 Cliente: ${data.clientName}
📍 Cidade: ${data.city}
🔧 Serviços: ${data.services.join(', ')}

Acesse o painel admin para ver detalhes completos.`;

    return sendWhatsAppMessage(config.recipientPhone, message);
};

/**
 * Notifica novo agendamento via WhatsApp
 */
export const notifyWhatsAppAppointment = async (data: {
    clientName: string;
    date: string;
    time: string;
    type: string;
}): Promise<boolean> => {
    const config = await getWhatsAppConfig();

    if (!config.enabled || !config.notifyAppointment) {
        console.log('[WhatsApp] Notificação de agendamento desativada');
        return false;
    }

    const typeLabel = data.type === 'visit' ? 'Visita Técnica' : 'Reunião';
    const formattedDate = new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR');

    const message = `📅 *Novo Agendamento*

👤 Cliente: ${data.clientName}
📋 Tipo: ${typeLabel}
📆 Data: ${formattedDate}
⏰ Horário: ${data.time}

Status: Pendente - Requer aprovação no painel.`;

    return sendWhatsAppMessage(config.recipientPhone, message);
};

/**
 * Notifica nova mensagem de contato via WhatsApp
 */
export const notifyWhatsAppContact = async (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}): Promise<boolean> => {
    const config = await getWhatsAppConfig();

    if (!config.enabled || !config.notifyContact) {
        console.log('[WhatsApp] Notificação de contato desativada');
        return false;
    }

    const phoneInfo = data.phone ? `\n📞 Tel: ${data.phone}` : '';

    const message = `📬 *Nova Mensagem de Contato*

👤 Nome: ${data.name}
✉️ Email: ${data.email}${phoneInfo}
📝 Assunto: ${data.subject}

💬 Mensagem:
${data.message.substring(0, 500)}${data.message.length > 500 ? '...' : ''}`;

    return sendWhatsAppMessage(config.recipientPhone, message);
};

/**
 * Notifica novo recado do chatbot via WhatsApp
 */
export const notifyWhatsAppChatbot = async (data: {
    userName: string;
    userContact: string;
    message: string;
    subject?: string;
    phone?: string;
}): Promise<boolean> => {
    const config = await getWhatsAppConfig();

    if (!config.enabled || !config.notifyChatbot) {
        console.log('[WhatsApp] Notificação de chatbot desativada');
        return false;
    }

    const phoneInfo = data.phone ? `\n📞 Tel: ${data.phone}` : '';
    const subjectText = data.subject || 'Recado via Chat';

    const message = `💬 *Novo Recado via Chatbot*

👤 Nome: ${data.userName}
✉️ Contato: ${data.userContact}${phoneInfo}
📝 Assunto: ${subjectText}

💬 Mensagem:
${data.message.substring(0, 500)}${data.message.length > 500 ? '...' : ''}`;

    return sendWhatsAppMessage(config.recipientPhone, message);
};

// Exportar tipo para uso no admin
export type { WhatsAppConfig };
