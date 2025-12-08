
// src/utils/emailService.ts

interface EmailPayload {
  subject: string;
  htmlContent: string;
  tags: string[];
}

import { supabase } from '../supabaseClient';

interface EmailPayload {
  subject: string;
  htmlContent: string;
  tags: string[];
}

/**
 * Função interna para enviar o e-mail via Supabase Edge Function
 * Removemos a exposição da API KEY no frontend.
 * A função no servidor se encarrega de usar a chave segura.
 */
const sendBrevoEmail = async (data: EmailPayload): Promise<boolean> => {
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


// ============================================================================
// TEMPLATES E FUNÇÕES PÚBLICAS
// ============================================================================

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
      <p>Powered by Thebaldi</p>
    </div>
  </div>
</body>
</html>
`;

/**
 * Notificar novo recado do Chatbot (Lista 6)
 */
export const notifyNewChatbotNote = async (data: { userName: string; userContact: string; message: string }) => {
  const html = getBaseTemplate(
    'Novo Recado via Chatbot',
    '#8B5CF6', // Roxo
    `
    <p>O assistente virtual capturou um novo recado de um visitante.</p>
    <div class="info-box">
      <span class="label">Nome</span>
      <span class="value">${data.userName}</span>
      
      <span class="label">Contato</span>
      <span class="value">${data.userContact}</span>
      
      <span class="label">Mensagem</span>
      <span class="value">${data.message}</span>
    </div>
    `
  );

  return sendBrevoEmail({
    subject: `💬 Novo Recado: ${data.userName}`,
    htmlContent: html,
    tags: ['list_6', 'chatbot_note']
  });
};

/**
 * Notificar novo orçamento (Lista 7)
 */
export const notifyNewBudgetRequest = async (data: { clientName: string; city: string; services: string[] }) => {
  const html = getBaseTemplate(
    'Nova Solicitação de Orçamento',
    '#EC4899', // Rosa
    `
    <p>Um cliente acabou de solicitar um orçamento pelo site.</p>
    <div class="info-box">
      <span class="label">Cliente</span>
      <span class="value">${data.clientName}</span>
      
      <span class="label">Localização</span>
      <span class="value">${data.city}</span>
      
      <span class="label">Serviços Interessados</span>
      <span class="value">${data.services.join(', ')}</span>
    </div>
    <p>Acesse o painel para ver os detalhes completos, incluindo telefone e observações.</p>
    `
  );

  return sendBrevoEmail({
    subject: `💰 Novo Orçamento: ${data.clientName}`,
    htmlContent: html,
    tags: ['list_7', 'budget_request']
  });
};

/**
 * Notificar novo agendamento (Lista 8)
 */
export const notifyNewAppointment = async (data: { clientName: string; date: string; time: string; type: string }) => {
  const typeLabel = data.type === 'visit' ? 'Visita Técnica' : 'Reunião';
  const html = getBaseTemplate(
    'Novo Agendamento Solicitado',
    '#10B981', // Verde
    `
    <p>Um cliente solicitou um horário na agenda.</p>
    <div class="info-box">
      <span class="label">Cliente</span>
      <span class="value">${data.clientName}</span>
      
      <span class="label">Tipo</span>
      <span class="value">${typeLabel}</span>
      
      <span class="label">Data e Hora</span>
      <span class="value">${new Date(data.date + 'T00:00:00').toLocaleDateString('pt-BR')} às ${data.time}</span>
    </div>
    <p>Este agendamento está com status <strong>Pendente</strong>. Necessário aprovação no painel.</p>
    `
  );

  return sendBrevoEmail({
    subject: `📅 Agenda: ${data.clientName} - ${typeLabel}`,
    htmlContent: html,
    tags: ['list_8', 'new_appointment']
  });
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
  const html = getBaseTemplate(
    'Nova Mensagem de Contato',
    '#3B82F6', // Azul
    `
    <p>Alguém entrou em contato através do formulário "Fale Conosco".</p>
    <div class="info-box">
      <span class="label">Nome</span>
      <span class="value">${data.name}</span>
      
      <span class="label">E-mail</span>
      <span class="value"><a href="mailto:${data.email}" style="color: #3B82F6;">${data.email}</a></span>
      
      ${data.phone ? `<span class="label">Telefone</span><span class="value">${data.phone}</span>` : ''}
      
      <span class="label">Assunto</span>
      <span class="value">${data.subject}</span>
      
      <span class="label">Mensagem</span>
      <span class="value" style="white-space: pre-wrap;">${data.message}</span>
    </div>
    <p>Responda diretamente pelo e-mail do cliente ou acesse o painel para gerenciar mensagens.</p>
    `
  );

  return sendBrevoEmail({
    subject: `📬 Contato: ${data.subject} - ${data.name}`,
    htmlContent: html,
    tags: ['contact_form', 'fale_conosco']
  });
};
