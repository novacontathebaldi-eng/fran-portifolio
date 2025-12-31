// src/utils/whatsappService.ts
// Serviço para enviar notificações via WhatsApp usando Edge Function do Supabase

import { supabase } from '../supabaseClient';

interface WhatsAppConfig {
    enabled: boolean;
    recipientPhone: string;
    notifyBudget: boolean;
    notifyAppointment: boolean;
    notifyContact: boolean;
    notifyChatbot: boolean;
}

let cachedConfig: WhatsAppConfig | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60000;

export const getWhatsAppConfig = async (): Promise<WhatsAppConfig> => {
    if (cachedConfig && Date.now() - cacheTime < CACHE_DURATION) {
        return cachedConfig;
    }

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
    } catch {
        return defaultConfig;
    }
};

export const clearWhatsAppConfigCache = () => {
    cachedConfig = null;
    cacheTime = 0;
};

/**
 * Envia mensagem via Edge Function do Supabase (chama WuzAPI do servidor)
 */
const sendWhatsAppMessage = async (phone: string, message: string): Promise<boolean> => {
    try {
        console.log(`[WhatsApp] Enviando via Edge Function para: ${phone}`);

        const { data, error } = await supabase.functions.invoke('send-whatsapp', {
            body: { phone, message }
        });

        if (error) {
            console.error('[WhatsApp] Edge Function error:', error);
            return false;
        }

        if (!data?.success) {
            console.error('[WhatsApp] Falha:', data?.error);
            return false;
        }

        console.log('[WhatsApp] ✅ Mensagem enviada com sucesso!');
        return true;
    } catch (err) {
        console.error('[WhatsApp] Erro:', err);
        return false;
    }
};

export const notifyWhatsAppBudget = async (data: {
    clientName: string;
    city: string;
    services: string[];
}): Promise<boolean> => {
    const config = await getWhatsAppConfig();
    if (!config.enabled || !config.notifyBudget) return false;

    const message = `💰 *Novo Orçamento*\n\n👤 Cliente: ${data.clientName}\n📍 Cidade: ${data.city}\n🔧 Serviços: ${data.services.join(', ')}\n\nAcesse o painel admin para ver detalhes.`;
    return sendWhatsAppMessage(config.recipientPhone, message);
};

export const notifyWhatsAppAppointment = async (data: {
    clientName: string;
    date: string;
    time: string;
    type: string;
}): Promise<boolean> => {
    const config = await getWhatsAppConfig();
    if (!config.enabled || !config.notifyAppointment) return false;

    const typeLabel = data.type === 'visit' ? 'Visita Técnica' : 'Reunião';
    const formattedDate = new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR');
    const message = `📅 *Novo Agendamento*\n\n👤 Cliente: ${data.clientName}\n📋 Tipo: ${typeLabel}\n📆 Data: ${formattedDate}\n⏰ Horário: ${data.time}\n\nStatus: Pendente`;
    return sendWhatsAppMessage(config.recipientPhone, message);
};

export const notifyWhatsAppContact = async (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}): Promise<boolean> => {
    const config = await getWhatsAppConfig();
    if (!config.enabled || !config.notifyContact) return false;

    const phoneInfo = data.phone ? `\n📞 Tel: ${data.phone}` : '';
    const message = `📬 *Nova Mensagem*\n\n👤 Nome: ${data.name}\n✉️ Email: ${data.email}${phoneInfo}\n📝 Assunto: ${data.subject}\n\n💬 ${data.message.substring(0, 300)}${data.message.length > 300 ? '...' : ''}`;
    return sendWhatsAppMessage(config.recipientPhone, message);
};

export const notifyWhatsAppChatbot = async (data: {
    userName: string;
    userContact: string;
    message: string;
    subject?: string;
    phone?: string;
}): Promise<boolean> => {
    const config = await getWhatsAppConfig();
    if (!config.enabled || !config.notifyChatbot) return false;

    const phoneInfo = data.phone ? `\n📞 Tel: ${data.phone}` : '';
    const subjectText = data.subject || 'Recado via Chat';
    const message = `💬 *Novo Recado*\n\n👤 Nome: ${data.userName}\n✉️ Contato: ${data.userContact}${phoneInfo}\n📝 Assunto: ${subjectText}\n\n💬 ${data.message.substring(0, 300)}${data.message.length > 300 ? '...' : ''}`;
    return sendWhatsAppMessage(config.recipientPhone, message);
};

export type { WhatsAppConfig };
