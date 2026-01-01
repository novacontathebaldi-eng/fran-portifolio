// src/utils/whatsappService.ts
// Serviço para enviar notificações via WhatsApp usando Edge Function do Supabase

import { supabase } from '../supabaseClient';
import { NotificationsConfig, defaultNotificationsConfig } from '../types';

// =============================================
// CONFIGURAÇÃO E CACHE
// =============================================

let cachedConfig: NotificationsConfig | null = null;
let cacheTime = 0;
const CACHE_DURATION = 60000; // 1 minuto

/**
 * Busca configuração de notificações do banco
 */
export const getNotificationsConfig = async (): Promise<NotificationsConfig> => {
    if (cachedConfig && Date.now() - cacheTime < CACHE_DURATION) {
        return cachedConfig;
    }

    try {
        const { data, error } = await supabase
            .from('site_settings')
            .select('settings')
            .eq('id', '00000000-0000-0000-0000-000000000001')
            .single();

        if (error || !data?.settings?.notificationsConfig) {
            return defaultNotificationsConfig;
        }

        // Merge com defaults para garantir que todas as propriedades existam
        cachedConfig = {
            ...defaultNotificationsConfig,
            ...data.settings.notificationsConfig,
            whatsapp: {
                ...defaultNotificationsConfig.whatsapp,
                ...data.settings.notificationsConfig.whatsapp,
                notifyAdmin: {
                    ...defaultNotificationsConfig.whatsapp.notifyAdmin,
                    ...data.settings.notificationsConfig.whatsapp?.notifyAdmin,
                },
                notifyClient: {
                    ...defaultNotificationsConfig.whatsapp.notifyClient,
                    ...data.settings.notificationsConfig.whatsapp?.notifyClient,
                },
                reminders: {
                    ...defaultNotificationsConfig.whatsapp.reminders,
                    ...data.settings.notificationsConfig.whatsapp?.reminders,
                    client: {
                        ...defaultNotificationsConfig.whatsapp.reminders.client,
                        ...data.settings.notificationsConfig.whatsapp?.reminders?.client,
                    },
                    admin: {
                        ...defaultNotificationsConfig.whatsapp.reminders.admin,
                        ...data.settings.notificationsConfig.whatsapp?.reminders?.admin,
                    },
                },
                templates: {
                    ...defaultNotificationsConfig.whatsapp.templates,
                    ...data.settings.notificationsConfig.whatsapp?.templates,
                },
            },
            email: {
                ...defaultNotificationsConfig.email,
                ...data.settings.notificationsConfig.email,
                templates: {
                    ...defaultNotificationsConfig.email.templates,
                    ...data.settings.notificationsConfig.email?.templates,
                },
            },
        };
        cacheTime = Date.now();
        return cachedConfig;
    } catch {
        return defaultNotificationsConfig;
    }
};

/**
 * Limpa o cache de configuração (chamar quando config mudar)
 */
export const clearNotificationsConfigCache = () => {
    cachedConfig = null;
    cacheTime = 0;
};

// Mantém compatibilidade com código legado
export const getWhatsAppConfig = getNotificationsConfig;
export const clearWhatsAppConfigCache = clearNotificationsConfigCache;

// =============================================
// TEMPLATES PADRÃO
// =============================================

const DEFAULT_TEMPLATES = {
    // CLIENTE
    welcome: (name: string) => `🎉 *Bem-vindo(a), ${name}!*

Sua conta na *Fran Siller Arquitetura* foi criada com sucesso!

Agora você pode:
✨ Solicitar orçamentos personalizados
📅 Agendar reuniões e visitas técnicas
💬 Conversar com nossa assistente virtual
📁 Acompanhar seus projetos

Acesse: https://fransiller.othebaldi.me

Estamos à disposição para transformar seus sonhos em realidade! 🏠

_Fran Siller Arquitetura_`,

    budgetConfirmationClient: (name: string, services: string) =>
        `✅ *Olá ${name}!*\n\nRecebemos sua solicitação de orçamento para:\n🔧 ${services}\n\nNossa equipe analisará seu pedido e retornará em breve com todos os detalhes.\n\n_Fran Siller Arquitetura_`,

    appointmentConfirmationClient: (name: string, type: string, date: string, time: string) =>
        `✅ *Olá ${name}!*\n\nSua solicitação de *${type}* foi recebida!\n\n📆 Data: ${date}\n⏰ Horário: ${time}\n\n⏳ Aguarde a confirmação da nossa equipe.\n\n_Fran Siller Arquitetura_`,

    contactConfirmationClient: (name: string) =>
        `✅ *Olá ${name}!*\n\nRecebemos sua mensagem e retornaremos em breve.\n\nObrigada pelo contato!\n\n_Fran Siller Arquitetura_`,

    chatbotConfirmationClient: (name: string) =>
        `✅ *Olá ${name}!*\n\nRecebemos seu recado e logo entraremos em contato!\n\nObrigada! 😊\n\n_Fran Siller Arquitetura_`,

    reminderClient: (name: string, type: string, date: string, time: string) =>
        `📅 *Lembrete de ${type}*\n\nOlá ${name}!\n\nLembramos que você tem um(a) *${type}* agendado(a) para:\n\n📆 Data: ${date}\n⏰ Horário: ${time}\n\nEm caso de dúvidas ou necessidade de reagendamento, entre em contato conosco.\n\n_Fran Siller Arquitetura_`,

    // ADMIN
    newBudgetAdmin: (name: string, city: string, services: string) =>
        `💰 *Novo Orçamento*\n\n👤 Cliente: ${name}\n📍 Cidade: ${city}\n🔧 Serviços: ${services}\n\nAcesse o painel admin para ver detalhes.`,

    newAppointmentAdmin: (name: string, type: string, date: string, time: string) =>
        `📅 *Novo Agendamento*\n\n👤 Cliente: ${name}\n📋 Tipo: ${type}\n📆 Data: ${date}\n⏰ Horário: ${time}\n\nStatus: Pendente`,

    newContactAdmin: (name: string, email: string, phone: string, subject: string, message: string) => {
        const phoneInfo = phone ? `\n📞 Tel: ${phone}` : '';
        return `📬 *Nova Mensagem*\n\n👤 Nome: ${name}\n✉️ Email: ${email}${phoneInfo}\n📝 Assunto: ${subject}\n\n💬 ${message.substring(0, 300)}${message.length > 300 ? '...' : ''}`;
    },

    chatbotNoteAdmin: (name: string, contact: string, phone: string, subject: string, message: string) => {
        const phoneInfo = phone ? `\n📞 Tel: ${phone}` : '';
        return `💬 *Novo Recado*\n\n👤 Nome: ${name}\n✉️ Contato: ${contact}${phoneInfo}\n📝 Assunto: ${subject}\n\n💬 ${message.substring(0, 300)}${message.length > 300 ? '...' : ''}`;
    },

    reminderAdmin: (name: string, type: string, date: string, time: string) =>
        `🔔 *Lembrete de ${type}*\n\nVocê tem um(a) ${type} agendado(a):\n\n👤 Cliente: ${name}\n📆 Data: ${date}\n⏰ Horário: ${time}`,
};

/**
 * Processa template customizado substituindo variáveis
 */
const processTemplate = (template: string, vars: Record<string, string>): string => {
    let result = template;
    for (const [key, value] of Object.entries(vars)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value);
    }
    return result;
};

// =============================================
// ENVIO DE MENSAGENS
// =============================================

/**
 * Normaliza número de telefone para formato internacional
 * - Remove caracteres não numéricos
 * - Adiciona código do Brasil (55) se necessário
 */
const normalizePhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/\D/g, '');

    // Se começa com +, já é internacional, só limpa
    if (phone.startsWith('+')) {
        return cleaned;
    }

    // Se tem 10-11 dígitos e começa com DDD válido do Brasil (1x-9x), adiciona 55
    if (cleaned.length >= 10 && cleaned.length <= 11) {
        const ddd = parseInt(cleaned.substring(0, 2));
        // DDDs brasileiros são de 11 a 99
        if (ddd >= 11 && ddd <= 99) {
            cleaned = '55' + cleaned;
        }
    }

    return cleaned;
};

/**
 * Envia mensagem via Edge Function do Supabase
 */
const sendWhatsAppMessage = async (phone: string, message: string): Promise<boolean> => {
    try {
        const cleanPhone = normalizePhoneNumber(phone);

        if (!cleanPhone || cleanPhone.length < 10) {
            console.log('[WhatsApp] Número inválido:', phone);
            return false;
        }

        console.log(`[WhatsApp] Enviando para: ${cleanPhone}`);

        const { data, error } = await supabase.functions.invoke('send-whatsapp', {
            body: { phone: cleanPhone, message }
        });

        if (error) {
            console.error('[WhatsApp] Edge Function error:', error);
            return false;
        }

        if (!data?.success) {
            console.error('[WhatsApp] Falha:', data?.error);
            return false;
        }

        console.log('[WhatsApp] ✅ Mensagem enviada!');
        return true;
    } catch (err) {
        console.error('[WhatsApp] Erro:', err);
        return false;
    }
};

/**
 * Helper: Delay entre envios para evitar sobrecarga do WuzAPI
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Envia mensagem para todos os telefones de admin
 * Inclui delay de 1.5s entre cada envio para evitar travamento do SQLite do WuzAPI
 */
const sendToAllAdmins = async (message: string): Promise<{ sent: number; failed: number }> => {
    const config = await getNotificationsConfig();
    const phones = config.whatsapp.adminPhones || [];

    let sent = 0;
    let failed = 0;

    for (let i = 0; i < phones.length; i++) {
        const phone = phones[i];

        // Delay antes de enviar (exceto no primeiro)
        if (i > 0) {
            await delay(1500); // 1.5 segundos entre cada envio
        }

        const success = await sendWhatsAppMessage(phone, message);
        if (success) sent++;
        else failed++;
    }

    return { sent, failed };
};

// =============================================
// NOTIFICAÇÕES PARA O ADMIN
// =============================================

export const notifyWhatsAppBudget = async (data: {
    clientName: string;
    city: string;
    services: string[];
    clientPhone?: string;
}): Promise<boolean> => {
    const config = await getNotificationsConfig();
    if (!config.whatsapp.enabled || !config.whatsapp.notifyAdmin.enabled || !config.whatsapp.notifyAdmin.budget) {
        return false;
    }

    const services = data.services.join(', ');
    const customTemplate = config.whatsapp.templates.newBudgetAdmin;
    const message = customTemplate
        ? processTemplate(customTemplate, { nome: data.clientName, cidade: data.city, servicos: services })
        : DEFAULT_TEMPLATES.newBudgetAdmin(data.clientName, data.city, services);

    const result = await sendToAllAdmins(message);
    return result.sent > 0;
};

export const notifyWhatsAppAppointment = async (data: {
    clientName: string;
    date: string;
    time: string;
    type: string;
}): Promise<boolean> => {
    const config = await getNotificationsConfig();
    if (!config.whatsapp.enabled || !config.whatsapp.notifyAdmin.enabled || !config.whatsapp.notifyAdmin.appointment) {
        return false;
    }

    const typeLabel = data.type === 'visit' ? 'Visita Técnica' : 'Reunião';
    const formattedDate = new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR');

    const customTemplate = config.whatsapp.templates.newAppointmentAdmin;
    const message = customTemplate
        ? processTemplate(customTemplate, { nome: data.clientName, tipo: typeLabel, data: formattedDate, hora: data.time })
        : DEFAULT_TEMPLATES.newAppointmentAdmin(data.clientName, typeLabel, formattedDate, data.time);

    const result = await sendToAllAdmins(message);
    return result.sent > 0;
};

export const notifyWhatsAppContact = async (data: {
    name: string;
    email: string;
    phone?: string;
    subject: string;
    message: string;
}): Promise<boolean> => {
    const config = await getNotificationsConfig();
    if (!config.whatsapp.enabled || !config.whatsapp.notifyAdmin.enabled || !config.whatsapp.notifyAdmin.contact) {
        return false;
    }

    const customTemplate = config.whatsapp.templates.newContactAdmin;
    const message = customTemplate
        ? processTemplate(customTemplate, { nome: data.name, email: data.email, telefone: data.phone || '', assunto: data.subject, mensagem: data.message })
        : DEFAULT_TEMPLATES.newContactAdmin(data.name, data.email, data.phone || '', data.subject, data.message);

    const result = await sendToAllAdmins(message);
    return result.sent > 0;
};

export const notifyWhatsAppChatbot = async (data: {
    userName: string;
    userContact: string;
    message: string;
    subject?: string;
    phone?: string;
}): Promise<boolean> => {
    const config = await getNotificationsConfig();
    if (!config.whatsapp.enabled || !config.whatsapp.notifyAdmin.enabled || !config.whatsapp.notifyAdmin.chatbot) {
        return false;
    }

    const subjectText = data.subject || 'Recado via Chat';
    const customTemplate = config.whatsapp.templates.chatbotNoteAdmin;
    const message = customTemplate
        ? processTemplate(customTemplate, { nome: data.userName, email: data.userContact, telefone: data.phone || '', assunto: subjectText, mensagem: data.message })
        : DEFAULT_TEMPLATES.chatbotNoteAdmin(data.userName, data.userContact, data.phone || '', subjectText, data.message);

    const result = await sendToAllAdmins(message);
    return result.sent > 0;
};

// =============================================
// CONFIRMAÇÕES PARA O CLIENTE
// =============================================

export const confirmBudgetToClient = async (data: {
    clientName: string;
    clientPhone: string;
    services: string[];
}): Promise<boolean> => {
    const config = await getNotificationsConfig();
    if (!config.whatsapp.enabled || !config.whatsapp.notifyClient.enabled || !config.whatsapp.notifyClient.budgetConfirmation) {
        return false;
    }
    if (!data.clientPhone) return false;

    const services = data.services.join(', ');
    const customTemplate = config.whatsapp.templates.budgetConfirmationClient;
    const message = customTemplate
        ? processTemplate(customTemplate, { nome: data.clientName, servicos: services })
        : DEFAULT_TEMPLATES.budgetConfirmationClient(data.clientName, services);

    return sendWhatsAppMessage(data.clientPhone, message);
};

export const confirmAppointmentToClient = async (data: {
    clientName: string;
    clientPhone: string;
    date: string;
    time: string;
    type: string;
}): Promise<boolean> => {
    const config = await getNotificationsConfig();
    if (!config.whatsapp.enabled || !config.whatsapp.notifyClient.enabled || !config.whatsapp.notifyClient.appointmentConfirmation) {
        return false;
    }
    if (!data.clientPhone) return false;

    const typeLabel = data.type === 'visit' ? 'Visita Técnica' : 'Reunião Online';
    const formattedDate = new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const customTemplate = config.whatsapp.templates.appointmentConfirmationClient;
    const message = customTemplate
        ? processTemplate(customTemplate, { nome: data.clientName, tipo: typeLabel, data: formattedDate, hora: data.time })
        : DEFAULT_TEMPLATES.appointmentConfirmationClient(data.clientName, typeLabel, formattedDate, data.time);

    return sendWhatsAppMessage(data.clientPhone, message);
};

export const confirmContactToClient = async (data: {
    clientName: string;
    clientPhone: string;
}): Promise<boolean> => {
    const config = await getNotificationsConfig();
    if (!config.whatsapp.enabled || !config.whatsapp.notifyClient.enabled || !config.whatsapp.notifyClient.contactConfirmation) {
        return false;
    }
    if (!data.clientPhone) return false;

    const customTemplate = config.whatsapp.templates.contactConfirmationClient;
    const message = customTemplate
        ? processTemplate(customTemplate, { nome: data.clientName })
        : DEFAULT_TEMPLATES.contactConfirmationClient(data.clientName);

    return sendWhatsAppMessage(data.clientPhone, message);
};

export const confirmChatbotToClient = async (data: {
    clientName: string;
    clientPhone: string;
}): Promise<boolean> => {
    const config = await getNotificationsConfig();
    if (!config.whatsapp.enabled || !config.whatsapp.notifyClient.enabled) {
        return false;
    }
    if (!data.clientPhone) return false;

    const customTemplate = config.whatsapp.templates.chatbotConfirmationClient;
    const message = customTemplate
        ? processTemplate(customTemplate, { nome: data.clientName })
        : DEFAULT_TEMPLATES.chatbotConfirmationClient(data.clientName);

    return sendWhatsAppMessage(data.clientPhone, message);
};

export const sendWelcomeMessage = async (data: {
    clientName: string;
    clientPhone: string;
}): Promise<boolean> => {
    const config = await getNotificationsConfig();
    if (!config.whatsapp.enabled || !config.whatsapp.notifyClient.enabled || !config.whatsapp.notifyClient.welcome) {
        return false;
    }
    if (!data.clientPhone) return false;

    const firstName = data.clientName.split(' ')[0];
    const customTemplate = config.whatsapp.templates.welcome;
    const message = customTemplate
        ? processTemplate(customTemplate, { nome: firstName })
        : DEFAULT_TEMPLATES.welcome(firstName);

    return sendWhatsAppMessage(data.clientPhone, message);
};

// =============================================
// LEMBRETES DE REUNIÃO
// =============================================

export const sendReminderToClient = async (data: {
    clientName: string;
    clientPhone: string;
    date: string;
    time: string;
    type: string;
}): Promise<boolean> => {
    const config = await getNotificationsConfig();
    if (!config.whatsapp.enabled || !config.whatsapp.reminders.enabled || !config.whatsapp.reminders.client.enabled) {
        return false;
    }
    if (!data.clientPhone) return false;

    const typeLabel = data.type === 'visit' ? 'Visita Técnica' : 'Reunião';
    const formattedDate = new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    });

    const customTemplate = config.whatsapp.templates.reminderClient;
    const message = customTemplate
        ? processTemplate(customTemplate, { nome: data.clientName, tipo: typeLabel, data: formattedDate, hora: data.time })
        : DEFAULT_TEMPLATES.reminderClient(data.clientName, typeLabel, formattedDate, data.time);

    return sendWhatsAppMessage(data.clientPhone, message);
};

export const sendReminderToAdmins = async (data: {
    clientName: string;
    date: string;
    time: string;
    type: string;
}): Promise<{ sent: number; failed: number }> => {
    const config = await getNotificationsConfig();
    if (!config.whatsapp.enabled || !config.whatsapp.reminders.enabled || !config.whatsapp.reminders.admin.enabled) {
        return { sent: 0, failed: 0 };
    }

    const typeLabel = data.type === 'visit' ? 'Visita Técnica' : 'Reunião';
    const formattedDate = new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR');

    const customTemplate = config.whatsapp.templates.reminderAdmin;
    const message = customTemplate
        ? processTemplate(customTemplate, { nome: data.clientName, tipo: typeLabel, data: formattedDate, hora: data.time })
        : DEFAULT_TEMPLATES.reminderAdmin(data.clientName, typeLabel, formattedDate, data.time);

    return sendToAllAdmins(message);
};

// =============================================
// TESTE DE CONEXÃO
// =============================================

/**
 * Testa conexão WhatsApp enviando mensagem para todos os números de admin
 * @param phonesToTest - Lista opcional de números para testar (se não fornecido, busca do banco)
 */
export const testWhatsAppConnection = async (phonesToTest?: string[]): Promise<{ success: boolean; sent: number; failed: number; error?: string }> => {
    let phones: string[];

    if (phonesToTest && phonesToTest.length > 0) {
        // Usa lista fornecida (estado local)
        phones = phonesToTest;
    } else {
        // Busca do banco
        const config = await getNotificationsConfig();
        phones = config.whatsapp.adminPhones || [];
    }

    if (phones.length === 0) {
        return { success: false, sent: 0, failed: 0, error: 'Nenhum número de admin configurado' };
    }

    const testMessage = '✅ *Teste de Conexão WhatsApp*\n\nEsta é uma mensagem de teste do sistema de notificações.\n\n_Fran Siller Arquitetura_';

    let sent = 0;
    let failed = 0;

    for (const phone of phones) {
        console.log(`[WhatsApp Test] Testando número: ${phone}`);
        const success = await sendWhatsAppMessage(phone, testMessage);
        if (success) {
            sent++;
        } else {
            failed++;
        }
    }

    return {
        success: sent > 0,
        sent,
        failed,
        error: sent === 0 ? 'Nenhuma mensagem enviada com sucesso' : undefined
    };
};

// =============================================
// WUZAPI RESTART REMOTO
// =============================================

const WUZAPI_RESTART_URL = 'http://54.94.205.227:8090/restart';
const WUZAPI_RESTART_SECRET = 'FranSillerRestart2025';

/**
 * Reinicia o WuzAPI remotamente via servidor HTTP no VPS
 */
export const restartWuzAPI = async (): Promise<{ success: boolean; message: string }> => {
    try {
        console.log('[WuzAPI] Solicitando restart remoto...');

        const response = await fetch(WUZAPI_RESTART_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ secret: WUZAPI_RESTART_SECRET }),
        });

        const data = await response.json();

        if (data.success) {
            console.log('[WuzAPI] ✅ Restart realizado com sucesso!');
            return { success: true, message: 'WuzAPI reiniciado com sucesso!' };
        } else {
            console.error('[WuzAPI] ❌ Erro no restart:', data.error || data.message);
            return { success: false, message: data.error || data.message || 'Erro desconhecido' };
        }
    } catch (error) {
        console.error('[WuzAPI] ❌ Erro ao conectar:', error);
        return { success: false, message: `Erro de conexão: ${error}` };
    }
};

// =============================================
// EXPORTS
// =============================================

export type { NotificationsConfig } from '../types';
export { DEFAULT_TEMPLATES };

