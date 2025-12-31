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
 * Envia mensagem via Edge Function do Supabase
 */
const sendWhatsAppMessage = async (phone: string, message: string): Promise<boolean> => {
    try {
        const cleanPhone = phone.replace(/\D/g, '');

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
 * Envia mensagem para todos os telefones de admin
 */
const sendToAllAdmins = async (message: string): Promise<{ sent: number; failed: number }> => {
    const config = await getNotificationsConfig();
    const phones = config.whatsapp.adminPhones || [];

    let sent = 0;
    let failed = 0;

    for (const phone of phones) {
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

export const testWhatsAppConnection = async (): Promise<{ success: boolean; error?: string }> => {
    const config = await getNotificationsConfig();
    const phones = config.whatsapp.adminPhones || [];

    if (phones.length === 0) {
        return { success: false, error: 'Nenhum número de admin configurado' };
    }

    const testPhone = phones[0];
    const success = await sendWhatsAppMessage(testPhone, '✅ *Teste de Conexão WhatsApp*\n\nEsta é uma mensagem de teste do sistema de notificações.\n\n_Fran Siller Arquitetura_');

    return success
        ? { success: true }
        : { success: false, error: 'Falha ao enviar mensagem de teste' };
};

// =============================================
// EXPORTS
// =============================================

export { NotificationsConfig } from '../types';
export { DEFAULT_TEMPLATES };
