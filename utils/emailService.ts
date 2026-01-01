// src/utils/emailService.ts

import { supabase } from '../supabaseClient';
import { getNotificationsConfig, clearNotificationsConfigCache, queueNotifications } from './whatsappService';
import {
  notifyWhatsAppBudget,
  notifyWhatsAppAppointment,
  notifyWhatsAppContact,
  notifyWhatsAppChatbot,
  confirmBudgetToClient,
  confirmAppointmentToClient,
  confirmContactToClient,
  confirmChatbotToClient
} from './whatsappService';
import { defaultNotificationsConfig } from '../types';

// Delay helper para evitar sobrecarga do SQLite do WuzAPI
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface EmailPayload {
  subject: string;
  htmlContent: string;
  tags: string[];
}

// ============================================================================
// TEMPLATES PADRÃO DE EMAIL
// ============================================================================

const DEFAULT_EMAIL_TEMPLATES = {
  newBudgetAdmin: {
    subject: (name: string) => `💰 Novo Orçamento: ${name}`,
    body: (name: string, city: string, services: string) => `
      <p>Um cliente acabou de solicitar um orçamento pelo site.</p>
      <div class="info-box">
        <span class="label">Cliente</span>
        <span class="value">${name}</span>
        
        <span class="label">Localização</span>
        <span class="value">${city}</span>
        
        <span class="label">Serviços Interessados</span>
        <span class="value">${services}</span>
      </div>
      <p>Acesse o painel para ver os detalhes completos, incluindo telefone e observações.</p>
    `,
  },
  newAppointmentAdmin: {
    subject: (name: string, type: string) => `📅 Agenda: ${name} - ${type}`,
    body: (name: string, type: string, dateTime: string) => `
      <p>Um cliente solicitou um horário na agenda.</p>
      <div class="info-box">
        <span class="label">Cliente</span>
        <span class="value">${name}</span>
        
        <span class="label">Tipo</span>
        <span class="value">${type}</span>
        
        <span class="label">Data e Hora</span>
        <span class="value">${dateTime}</span>
      </div>
      <p>Este agendamento está com status <strong>Pendente</strong>. Necessário aprovação no painel.</p>
    `,
  },
  newContactAdmin: {
    subject: (subject: string, name: string) => `📬 Contato: ${subject} - ${name}`,
    body: (name: string, email: string, phone: string, subject: string, message: string) => `
      <p>Alguém entrou em contato através do formulário "Fale Conosco".</p>
      <div class="info-box">
        <span class="label">Nome</span>
        <span class="value">${name}</span>
        
        <span class="label">E-mail</span>
        <span class="value"><a href="mailto:${email}" style="color: #3B82F6;">${email}</a></span>
        
        ${phone ? `<span class="label">Telefone</span><span class="value">${phone}</span>` : ''}
        
        <span class="label">Assunto</span>
        <span class="value">${subject}</span>
        
        <span class="label">Mensagem</span>
        <span class="value" style="white-space: pre-wrap;">${message}</span>
      </div>
      <p>Responda diretamente pelo e-mail do cliente ou acesse o painel para gerenciar mensagens.</p>
    `,
  },
  chatbotNoteAdmin: {
    subject: (subject: string, name: string) => `💬 Novo Recado: ${subject} - ${name}`,
    body: (name: string, email: string, phone: string, subject: string, message: string, whatsappButton: string) => `
      <p>O assistente virtual capturou um novo recado de um visitante.</p>
      <div class="info-box">
        <span class="label">Nome</span>
        <span class="value">${name}</span>
        
        <span class="label">E-mail</span>
        <span class="value"><a href="mailto:${email}" style="color: #3B82F6;">${email}</a></span>
        
        ${phone ? `<span class="label">Telefone</span><span class="value">${phone}</span>` : ''}
        
        <span class="label">Assunto</span>
        <span class="value">${subject}</span>
        
        <span class="label">Mensagem</span>
        <span class="value" style="white-space: pre-wrap;">${message}</span>
      </div>
      <div class="action-buttons">
        <a href="mailto:${email}?subject=Re: ${subject}" class="btn-secondary" style="color: #ffffff;">Responder por E-mail</a>
        ${whatsappButton}
      </div>
    `,
  },
};

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

/**
 * Função interna para enviar o e-mail via Supabase Edge Function
 */
const sendBrevoEmail = async (data: EmailPayload): Promise<boolean> => {
  // Verificar se email está habilitado
  const config = await getNotificationsConfig();
  if (!config.email.enabled) {
    console.log('[Email] Envio desativado nas configurações');
    return false;
  }

  try {
    const { error } = await supabase.functions.invoke('send-email', {
      body: {
        subject: data.subject,
        htmlContent: data.htmlContent,
        tags: data.tags,
      },
    });

    if (error) {
      console.error('[Edge Function] Erro ao enviar email:', error);
      return false;
    }

    console.log('[Edge Function] E-mail enviado com sucesso via servidor seguro.');
    return true;

  } catch (error) {
    console.error('[Edge Function] Erro de conexão:', error);
    return false;
  }
};

/**
 * Template base HTML para emails
 */
const getBaseTemplate = (title: string, color: string, content: string) => `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
    .header { background: ${color}; padding: 30px 20px; text-align: center; color: #ffffff; }
    .header h1 { margin: 0; font-size: 24px; font-weight: 300; letter-spacing: 1px; }
    .content { padding: 30px; color: #333333; line-height: 1.6; }
    .info-box { background: #f9f9f9; border-left: 4px solid ${color}; padding: 15px; margin: 20px 0; border-radius: 4px; }
    .label { font-weight: bold; font-size: 12px; text-transform: uppercase; color: #888; display: block; margin-bottom: 4px; }
    .value { font-size: 16px; margin-bottom: 12px; display: block; color: #000; }
    .footer { background: #1a1a1a; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .btn { display: inline-block; padding: 12px 24px; background: #000; color: #fff; text-decoration: none; border-radius: 50px; font-weight: bold; margin-top: 20px; }
    .btn-secondary { display: inline-block; padding: 10px 20px; background: #3B82F6; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 5px; font-size: 14px; }
    .btn-whatsapp { background: #25D366; }
    .action-buttons { text-align: center; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${title}</h1>
    </div>
    <div class="content">
      ${content}
      <div style="text-align: center;">
        <a href="https://fransiller.othebaldi.me/#/admin" class="btn" style="color: #ffffff;">Acessar Painel Admin</a>
      </div>
    </div>
    <div class="footer">
      <p>Fran Siller Arquitetura - Sistema de Notificações</p>
      <p>Desenvolvido por Otávio Thebaldi</p>
    </div>
  </div>
</body>
</html>
`;

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

// ============================================================================
// FUNÇÕES PÚBLICAS DE NOTIFICAÇÃO
// ============================================================================

/**
 * Notificar novo recado do Chatbot
 */
export const notifyNewChatbotNote = async (data: {
  userName: string;
  userContact: string;
  message: string;
  subject?: string;
  phone?: string;
}) => {
  const config = await getNotificationsConfig();
  const subjectText = data.subject || 'Recado via Chat';
  const whatsappButton = data.phone
    ? `<a href="https://wa.me/55${data.phone.replace(/\D/g, '')}" class="btn-secondary btn-whatsapp" style="color: #ffffff;">Responder via WhatsApp</a>`
    : '';

  // Verificar se há template customizado
  const customTemplate = config.email.templates.chatbotNoteAdmin;

  let emailSubject: string;
  let bodyContent: string;

  if (customTemplate.subject && customTemplate.body) {
    emailSubject = processTemplate(customTemplate.subject, { assunto: subjectText, nome: data.userName });
    bodyContent = processTemplate(customTemplate.body, {
      nome: data.userName,
      email: data.userContact,
      telefone: data.phone || '',
      assunto: subjectText,
      mensagem: data.message,
    });
  } else {
    emailSubject = DEFAULT_EMAIL_TEMPLATES.chatbotNoteAdmin.subject(subjectText, data.userName);
    bodyContent = DEFAULT_EMAIL_TEMPLATES.chatbotNoteAdmin.body(
      data.userName,
      data.userContact,
      data.phone || '',
      subjectText,
      data.message,
      whatsappButton
    );
  }

  const html = getBaseTemplate('Novo Recado via Chatbot', '#8B5CF6', bodyContent);

  // Enviar email (rápido)
  const emailSent = await sendBrevoEmail({
    subject: emailSubject,
    htmlContent: html,
    tags: ['list_6', 'chatbot_note']
  });

  // Preparar notificações WhatsApp para a fila
  const config2 = await getNotificationsConfig();
  const adminPhones = config2.whatsapp.adminPhones || [];

  if (config2.whatsapp.enabled) {
    const notifications: Array<{ type: 'whatsapp'; phone: string; message: string }> = [];

    // Mensagem para admins
    if (config2.whatsapp.notifyAdmin.enabled && config2.whatsapp.notifyAdmin.chatbot && adminPhones.length > 0) {
      const adminMessage = `💬 *Novo Recado*\n\n👤 Nome: ${data.userName}\n✉️ Contato: ${data.userContact}${data.phone ? `\n📞 Tel: ${data.phone}` : ''}\n📝 Assunto: ${subjectText}\n\n💬 ${data.message.substring(0, 300)}${data.message.length > 300 ? '...' : ''}`;

      for (const phone of adminPhones) {
        notifications.push({ type: 'whatsapp', phone, message: adminMessage });
      }
    }

    // Mensagem de confirmação para cliente
    if (config2.whatsapp.notifyClient.enabled && data.phone) {
      const clientMessage = `✅ *Olá ${data.userName}!*\n\nRecebemos seu recado e logo entraremos em contato!\n\nObrigada! 😊\n\n_Fran Siller Arquitetura_`;
      notifications.push({ type: 'whatsapp', phone: data.phone, message: clientMessage });
    }

    // Adicionar à fila (retorna IMEDIATAMENTE)
    if (notifications.length > 0) {
      queueNotifications(notifications).catch(e => console.error('[Queue] Erro:', e));
    }
  }

  return emailSent;
};

/**
 * Notificar novo orçamento
 */
export const notifyNewBudgetRequest = async (data: { clientName: string; city: string; services: string[]; clientPhone?: string }) => {
  const config = await getNotificationsConfig();
  const services = data.services.join(', ');

  const customTemplate = config.email.templates.newBudgetAdmin;

  let emailSubject: string;
  let bodyContent: string;

  if (customTemplate.subject && customTemplate.body) {
    emailSubject = processTemplate(customTemplate.subject, { nome: data.clientName });
    bodyContent = processTemplate(customTemplate.body, {
      nome: data.clientName,
      cidade: data.city,
      servicos: services,
    });
  } else {
    emailSubject = DEFAULT_EMAIL_TEMPLATES.newBudgetAdmin.subject(data.clientName);
    bodyContent = DEFAULT_EMAIL_TEMPLATES.newBudgetAdmin.body(data.clientName, data.city, services);
  }

  const html = getBaseTemplate('Nova Solicitação de Orçamento', '#EC4899', bodyContent);

  // Enviar email (rápido)
  const emailSent = await sendBrevoEmail({
    subject: emailSubject,
    htmlContent: html,
    tags: ['list_7', 'budget_request']
  });

  // Preparar notificações WhatsApp para a fila
  const config2 = await getNotificationsConfig();
  const adminPhones = config2.whatsapp.adminPhones || [];

  if (config2.whatsapp.enabled) {
    const notifications: Array<{ type: 'whatsapp'; phone: string; message: string }> = [];

    // Mensagem para admins
    if (config2.whatsapp.notifyAdmin.enabled && config2.whatsapp.notifyAdmin.budget && adminPhones.length > 0) {
      const adminMessage = `💰 *Novo Orçamento*\n\n👤 Cliente: ${data.clientName}\n📍 Cidade: ${data.city}\n🔧 Serviços: ${services}\n\nAcesse o painel admin para ver detalhes.`;

      for (const phone of adminPhones) {
        notifications.push({ type: 'whatsapp', phone, message: adminMessage });
      }
    }

    // Mensagem de confirmação para cliente
    if (config2.whatsapp.notifyClient.enabled && config2.whatsapp.notifyClient.budgetConfirmation && data.clientPhone) {
      const clientMessage = `✅ *Olá ${data.clientName}!*\n\nRecebemos sua solicitação de orçamento para:\n🔧 ${services}\n\nNossa equipe analisará seu pedido e retornará em breve com todos os detalhes.\n\n_Fran Siller Arquitetura_`;
      notifications.push({ type: 'whatsapp', phone: data.clientPhone, message: clientMessage });
    }

    // Adicionar à fila (retorna IMEDIATAMENTE)
    if (notifications.length > 0) {
      queueNotifications(notifications).catch(e => console.error('[Queue] Erro:', e));
    }
  }

  return emailSent;
};

/**
 * Notificar novo agendamento
 */
export const notifyNewAppointment = async (data: { clientName: string; date: string; time: string; type: string; clientPhone?: string }) => {
  const config = await getNotificationsConfig();
  const typeLabel = data.type === 'visit' ? 'Visita Técnica' : 'Reunião';
  const dateTime = `${new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR')} às ${data.time}`;

  const customTemplate = config.email.templates.newAppointmentAdmin;

  let emailSubject: string;
  let bodyContent: string;

  if (customTemplate.subject && customTemplate.body) {
    emailSubject = processTemplate(customTemplate.subject, { nome: data.clientName, tipo: typeLabel });
    bodyContent = processTemplate(customTemplate.body, {
      nome: data.clientName,
      tipo: typeLabel,
      data: new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR'),
      hora: data.time,
    });
  } else {
    emailSubject = DEFAULT_EMAIL_TEMPLATES.newAppointmentAdmin.subject(data.clientName, typeLabel);
    bodyContent = DEFAULT_EMAIL_TEMPLATES.newAppointmentAdmin.body(data.clientName, typeLabel, dateTime);
  }

  const html = getBaseTemplate('Novo Agendamento Solicitado', '#10B981', bodyContent);

  // Enviar email (rápido)
  const emailSent = await sendBrevoEmail({
    subject: emailSubject,
    htmlContent: html,
    tags: ['list_8', 'new_appointment']
  });

  // Preparar notificações WhatsApp para a fila
  const config2 = await getNotificationsConfig();
  const adminPhones = config2.whatsapp.adminPhones || [];

  const formattedDate = new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  });

  if (config2.whatsapp.enabled) {
    const notifications: Array<{ type: 'whatsapp'; phone: string; message: string }> = [];

    // Mensagem para admins
    if (config2.whatsapp.notifyAdmin.enabled && config2.whatsapp.notifyAdmin.appointment && adminPhones.length > 0) {
      const adminMessage = `📅 *Novo Agendamento*\n\n👤 Cliente: ${data.clientName}\n📋 Tipo: ${typeLabel}\n📆 Data: ${formattedDate}\n⏰ Horário: ${data.time}\n\nStatus: Pendente`;

      for (const phone of adminPhones) {
        notifications.push({ type: 'whatsapp', phone, message: adminMessage });
      }
    }

    // Mensagem de confirmação para cliente
    if (config2.whatsapp.notifyClient.enabled && config2.whatsapp.notifyClient.appointmentConfirmation && data.clientPhone) {
      const clientMessage = `✅ *Olá ${data.clientName}!*\n\nSua solicitação de *${typeLabel}* foi recebida!\n\n📆 Data: ${formattedDate}\n⏰ Horário: ${data.time}\n\n⏳ Aguarde a confirmação da nossa equipe.\n\n_Fran Siller Arquitetura_`;
      notifications.push({ type: 'whatsapp', phone: data.clientPhone, message: clientMessage });
    }

    // Adicionar à fila (retorna IMEDIATAMENTE)
    if (notifications.length > 0) {
      queueNotifications(notifications).catch(e => console.error('[Queue] Erro:', e));
    }
  }

  return emailSent;
};

/**
 * Notificar nova mensagem de contato (Fale Conosco)
 */
export const notifyNewContactMessage = async (data: {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) => {
  const config = await getNotificationsConfig();
  const customTemplate = config.email.templates.newContactAdmin;

  let emailSubject: string;
  let bodyContent: string;

  if (customTemplate.subject && customTemplate.body) {
    emailSubject = processTemplate(customTemplate.subject, { assunto: data.subject, nome: data.name });
    bodyContent = processTemplate(customTemplate.body, {
      nome: data.name,
      email: data.email,
      telefone: data.phone || '',
      assunto: data.subject,
      mensagem: data.message,
    });
  } else {
    emailSubject = DEFAULT_EMAIL_TEMPLATES.newContactAdmin.subject(data.subject, data.name);
    bodyContent = DEFAULT_EMAIL_TEMPLATES.newContactAdmin.body(
      data.name,
      data.email,
      data.phone || '',
      data.subject,
      data.message
    );
  }

  const html = getBaseTemplate('Nova Mensagem de Contato', '#3B82F6', bodyContent);

  // Enviar email (rápido)
  const emailSent = await sendBrevoEmail({
    subject: emailSubject,
    htmlContent: html,
    tags: ['contact_form', 'fale_conosco']
  });

  // Preparar notificações WhatsApp para a fila
  const config2 = await getNotificationsConfig();
  const adminPhones = config2.whatsapp.adminPhones || [];

  if (config2.whatsapp.enabled) {
    const notifications: Array<{ type: 'whatsapp'; phone: string; message: string }> = [];

    // Mensagem para admins
    if (config2.whatsapp.notifyAdmin.enabled && config2.whatsapp.notifyAdmin.contact && adminPhones.length > 0) {
      const phoneInfo = data.phone ? `\n📞 Tel: ${data.phone}` : '';
      const adminMessage = `📬 *Nova Mensagem*\n\n👤 Nome: ${data.name}\n✉️ Email: ${data.email}${phoneInfo}\n📝 Assunto: ${data.subject}\n\n💬 ${data.message.substring(0, 300)}${data.message.length > 300 ? '...' : ''}`;

      for (const phone of adminPhones) {
        notifications.push({ type: 'whatsapp', phone, message: adminMessage });
      }
    }

    // Mensagem de confirmação para cliente
    if (config2.whatsapp.notifyClient.enabled && data.phone) {
      const clientMessage = `✅ *Olá ${data.name}!*\n\nRecebemos sua mensagem e retornaremos em breve.\n\nObrigada pelo contato!\n\n_Fran Siller Arquitetura_`;
      notifications.push({ type: 'whatsapp', phone: data.phone, message: clientMessage });
    }

    // Adicionar à fila (retorna IMEDIATAMENTE)
    if (notifications.length > 0) {
      queueNotifications(notifications).catch(e => console.error('[Queue] Erro:', e));
    }
  }

  return emailSent;
};

// Re-export para uso externo
export { clearNotificationsConfigCache, getNotificationsConfig };
