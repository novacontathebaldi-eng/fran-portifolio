/**
 * Brevo Email Service
 * 
 * Handles sending transactional emails via Brevo API
 * for admin notifications (chatbot messages, budgets, appointments)
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const BREVO_API_KEY = (import.meta as any).env.VITE_BREVO_API_KEY;

// Email configuration from environment variables
const SENDER_NAME = (import.meta as any).env.VITE_BREVO_SENDER_NAME || 'Thebaldi - Suporte';
const SENDER_EMAIL = (import.meta as any).env.VITE_BREVO_SENDER_EMAIL || 'suporte@othebaldi.me';
const ADMIN_EMAILS_STRING = (import.meta as any).env.VITE_BREVO_ADMIN_EMAILS || 'thebaldi.thebaldi@gmail.com';

// Parse admin emails (support multiple recipients separated by comma)
const ADMIN_EMAILS = ADMIN_EMAILS_STRING.split(',').map((email: string) => ({
  email: email.trim(),
  name: 'Administração'
}));

// Brevo List IDs for admin notifications
export const BREVO_LISTS = {
  CHATBOT_NOTES: 6,      // Lista 6: Novos recados do chatbot
  BUDGET_REQUESTS: 7,    // Lista 7: Novos orçamentos enviados
  APPOINTMENTS: 8,       // Lista 8: Novas reuniões/visitas técnicas
};

export interface EmailData {
  subject: string;
  htmlContent: string;
  listId: number;
}

/**
 * Send email to Brevo list
 * @param data Email configuration
 */
export async function sendToBrevoList(data: EmailData): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn('⚠️ Brevo API key not configured. Email not sent.');
    return false;
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          name: SENDER_NAME,
          email: SENDER_EMAIL,
        },
        to: ADMIN_EMAILS, // Send to all configured admin emails
        subject: data.subject,
        htmlContent: data.htmlContent,
        tags: [`list_${data.listId}`, 'admin_notification'],
        // Metadata for tracking
        params: {
          BREVO_LIST_ID: data.listId,
        },
      }),
    });
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('❌ Brevo API error:', response.status, errorText);
    return false;
  }

  const result = await response.json();
  console.log('✅ Email enviado com sucesso via Brevo:', result);
  return true;
} catch (error) {
  console.error('❌ Erro ao enviar email via Brevo:', error);
  return false;
}
}

/**
 * Send notification for new chatbot note
 */
export async function notifyNewChatbotNote(noteData: {
  userName: string;
  userContact: string;
  message: string;
  date: string;
}): Promise<boolean> {
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #667eea; margin: 15px 0; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>💬 Novo Recado do Chatbot</h2>
        </div>
        <div class="content">
          <p><strong>Um novo recado foi deixado através do chatbot!</strong></p>
          
          <div class="info-box">
            <p><strong>👤 Nome:</strong> ${noteData.userName}</p>
            <p><strong>📞 Contato:</strong> ${noteData.userContact}</p>
            <p><strong>📅 Data:</strong> ${noteData.date}</p>
          </div>
          
          <div class="info-box">
            <p><strong>💬 Mensagem:</strong></p>
            <p>${noteData.message}</p>
          </div>
          
          <p style="margin-top: 20px;">
            <a href="https://localhost:3000/admin" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver no Painel Admin
            </a>
          </p>
          
          <div class="footer">
            <p>Fran Siller Arquitetura - Sistema de Notificações</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendToBrevoList({
    subject: `💬 Novo Recado: ${noteData.userName}`,
    htmlContent,
    listId: BREVO_LISTS.CHATBOT_NOTES,
  });
}

/**
 * Send notification for new budget request
 */
export async function notifyNewBudgetRequest(budgetData: {
  clientName: string;
  clientEmail: string;
  services: string[];
  projectDescription: string;
  date: string;
}): Promise<boolean> {
  const servicesList = budgetData.services.map(s => `<li>${s}</li>`).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid #f5576c; margin: 15px 0; }
        .services { background: white; padding: 15px; }
        .services ul { margin: 10px 0; padding-left: 20px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>💰 Novo Orçamento Solicitado</h2>
        </div>
        <div class="content">
          <p><strong>Um novo orçamento foi enviado!</strong></p>
          
          <div class="info-box">
            <p><strong>👤 Cliente:</strong> ${budgetData.clientName}</p>
            <p><strong>📧 E-mail:</strong> ${budgetData.clientEmail}</p>
            <p><strong>📅 Data:</strong> ${budgetData.date}</p>
          </div>
          
          <div class="services">
            <p><strong>📋 Serviços Solicitados:</strong></p>
            <ul>${servicesList}</ul>
          </div>
          
          <div class="info-box">
            <p><strong>📝 Descrição do Projeto:</strong></p>
            <p>${budgetData.projectDescription || 'Não informada'}</p>
          </div>
          
          <p style="margin-top: 20px;">
            <a href="https://localhost:3000/admin" style="background: #f5576c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver Orçamento no Admin
            </a>
          </p>
          
          <div class="footer">
            <p>Fran Siller Arquitetura - Sistema de Notificações</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendToBrevoList({
    subject: `💰 Novo Orçamento: ${budgetData.clientName}`,
    htmlContent,
    listId: BREVO_LISTS.BUDGET_REQUESTS,
  });
}

/**
 * Send notification for new appointment (meeting or visit)
 */
export async function notifyNewAppointment(appointmentData: {
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  type: 'meeting' | 'visit';
  date: string;
  time: string;
  location?: string;
  notes?: string;
}): Promise<boolean> {
  const typeText = appointmentData.type === 'meeting' ? '👥 Reunião' : '🏗️ Visita Técnica';
  const typeColor = appointmentData.type === 'meeting' ? '#4CAF50' : '#FF9800';

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
        .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
        .info-box { background: white; padding: 15px; border-left: 4px solid ${typeColor}; margin: 15px 0; }
        .type-badge { display: inline-block; background: ${typeColor}; color: white; padding: 6px 12px; border-radius: 4px; font-size: 14px; font-weight: bold; margin-bottom: 15px; }
        .footer { margin-top: 20px; padding-top: 20px; border-top: 1px solid #ddd; font-size: 12px; color: #666; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>📅 Novo Agendamento</h2>
        </div>
        <div class="content">
          <span class="type-badge">${typeText}</span>
          
          <p><strong>Um novo agendamento foi criado!</strong></p>
          
          <div class="info-box">
            <p><strong>👤 Cliente:</strong> ${appointmentData.clientName}</p>
            <p><strong>📧 E-mail:</strong> ${appointmentData.clientEmail}</p>
            <p><strong>📞 Telefone:</strong> ${appointmentData.clientPhone}</p>
          </div>
          
          <div class="info-box">
            <p><strong>📅 Data:</strong> ${appointmentData.date}</p>
            <p><strong>🕒 Horário:</strong> ${appointmentData.time}</p>
            ${appointmentData.location ? `<p><strong>📍 Local:</strong> ${appointmentData.location}</p>` : ''}
          </div>
          
          ${appointmentData.notes ? `
          <div class="info-box">
            <p><strong>📝 Observações:</strong></p>
            <p>${appointmentData.notes}</p>
          </div>
          ` : ''}
          
          <p style="margin-top: 20px;">
            <a href="https://localhost:3000/admin" style="background: ${typeColor}; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Ver na Agenda Admin
            </a>
          </p>
          
          <div class="footer">
            <p>Fran Siller Arquitetura - Sistema de Notificações</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendToBrevoList({
    subject: `📅 ${typeText}: ${appointmentData.clientName} - ${appointmentData.date}`,
    htmlContent,
    listId: BREVO_LISTS.APPOINTMENTS,
  });
}
