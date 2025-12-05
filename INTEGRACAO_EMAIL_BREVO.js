/**
 * INSTRUÇÕES PARA INTEGRAÇÃO MANUAL
 * 
 * Este arquivo contém as modificações necessárias para integrar as notificações
 * por e-mail do Brevo nos arquivos existentes.
 * 
 * Por favor, aplique as seguintes mudanças manualmente:
 */

// ===================================================================
// ARQUIVO 1: pages/BudgetFlow.tsx
// ===================================================================

/**
 * 1. ADICIONAR IMPORT (linha ~6, após os outros imports):
 */
import { notifyNewBudgetRequest } from '../src/utils/emailService';

/**
 * 2. ADICIONAR TRIGGER DE EMAIL (linha ~150, após itemsError check):
 * 
 * Localizar:
 *   if (itemsError) throw itemsError;
 * 
 * Adicionar APÓS esta linha:
 */

// Send email notification to admin (Lista 7)
notifyNewBudgetRequest({
    clientName: formData.clientName,
    clientEmail: formData.clientEmail,
    services: formData.selectedServices.map(id => {
        const service = services.find(s => s.id === id);
        return service?.name || 'Serviço não encontrado';
    }),
    projectDescription: formData.observations || 'Não informada',
    date: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}).catch(error => {
    console.error('[Brevo] Erro ao enviar email de orçamento:', error);
    // Não interrompe o fluxo se o e-mail falhar
});

// ===================================================================
// ARQUIVO 2: context/ProjectContext.tsx
// ===================================================================

/**
 * 1. ADICIONAR IMPORT (início do arquivo, após outros imports):
 */
import { notifyNewAppointment } from '../src/utils/emailService';

/**
 * 2. ADICIONAR TRIGGER DE EMAIL (linha ~720, dentro da função scheduleAppointment, após .insert().select().single()):
 * 
 * Localizar:
 *   const { data, error } = await supabase.from('appointments').insert(payload).select().single();
 *   if (error) { ... }
 * 
 * Adicionar APÓS o check de erro, antes de refresh de appointments:
 */

// Send email notification to admin (Lista 8)
if (data) {
    notifyNewAppointment({
        clientName: clientName || 'Cliente não identificado',
        clientEmail: clientEmail || '',
        clientPhone: clientPhone || '',
        type: type,
        date: new Date(date).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            weekday: 'long'
        }),
        time: time,
        location: location,
        notes: notes
    }).catch(error => {
        console.error('[Brevo] Erro ao enviar email de agendamento:', error);
        // Não interrompe o fluxo se o e-mail falhar
    });
}

// ===================================================================
// ARQUIVO 3: api/chat.ts
// ===================================================================

/**
 * 1. ADICIONAR IMPORT (início do arquivo):
 */
import { notifyNewChatbotNote } from '../src/utils/emailService';

/**
 * 2. ADICIONAR TRIGGER DE EMAIL (dentro do tool 'leave_note_for_admin', após salvar no Supabase):
 * 
 * Localizar a função que salva admin_notes no supabase
 * Adicionar APÓS o sucesso do .insert():
 */

// Send email notification to admin (Lista 6)
notifyNewChatbotNote({
    userName: userName || 'Usuário anôn imo',
    userContact: userContact || 'Não fornecido',
    message: message,
    date: new Date().toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}).catch(error => {
    console.error('[Brevo] Erro ao enviar email de recado:', error);
    // Não interrompe o fluxo se o e-mail falhar
});

/**
 * ===================================================================
 * CONFIGURAÇÃO DO .env
 * ===================================================================
 * 
 * Crie um arquivo .env na raiz do projeto (se não existir) e adicione:
 * 
 * VITE_BREVO_API_KEY=sua_chave_api_do_brevo_aqui
 * 
 * Substitua 'sua_chave_api_do_brevo_aqui' pela sua API key real do Brevo.
 * 
 *  ===================================================================
 * TESTE APÓS IMPLEMENTAÇÃO
 * ===================================================================
 * 
 * 1. Iniciar servidor: npm run dev
 * 2. Testar cada funcionalidade:
 *    - Enviar um recado pelo chatbot (Lista 6)
 *    - Solicit ar um orçamento (Lista 7)
 *    - Agendar uma reunião/visita (Lista 8)
 * 3. Verificar os emails nas listas do Brevo
 * 4. Verificar console do navegador para logs de sucesso/erro
 */
