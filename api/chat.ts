import { supabase } from '../supabaseClient';
import { User, ClientMemory, ChatMessage, OfficeDetails, Project, CulturalProject } from '../types';
import { notifyNewChatbotNote } from '../utils/emailService';

// Define tool-related interfaces for type safety
interface ToolCall {
  name: string;
  args: any;
}

interface ChatResponse {
  role: 'model';
  text: string;
  uiComponent?: {
    type: string;
    data: any;
  };
  actions?: any[];
}

export async function chatWithConcierge(
  message: ChatMessage[] | string,
  context: {
    user: User | null;
    memories: ClientMemory[];
    office?: OfficeDetails;
    projects: Project[];
    culturalProjects: CulturalProject[];
  },
  aiConfig: any
): Promise<ChatResponse> {

  // Prepare payload for Edge Function
  const payload = {
    message,
    context,
    aiConfig
  };

  try {
    console.log('[Chat] Calling Edge Function chat-ai...');
    const { data, error } = await supabase.functions.invoke('chat-ai', {
      body: payload
    });

    if (error) {
      console.error('[Chat] Edge Function Error:', error);
      // Fallback graceful em vez de throw
      return {
        role: 'model',
        text: "Desculpe, estou com uma dificuldade técnica. Pode tentar de novo?"
      };
    }

    // Data structure returned from Edge Function: { text: string, functionCalls: ToolCall[] }
    let modelText = data.text || "";
    const functionCalls = data.functionCalls as ToolCall[];

    // Limpeza simplificada - apenas remover sintaxe óbvia de function calls
    // Evitar regex agressivos que podem quebrar respostas válidas
    modelText = modelText
      .replace(/<function=[^>]*><\/function>/gi, '')
      .replace(/<function=[^>]*>/gi, '')
      .replace(/<\/function>/gi, '')
      .replace(/\[function_call:[^\]]*\]/gi, '')
      .replace(/```tool_call[\s\S]*?```/gi, '')
      .trim();

    let responseData: ChatResponse = {
      role: 'model',
      text: modelText,
      actions: []
    };

    // Process function calls (Tools) - Client side logic for UI Components & Side Effects
    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        switch (call.name) {
          case 'showProjects':
            responseData.uiComponent = { type: 'ProjectCarousel', data: call.args };
            if (!responseData.text) responseData.text = "Aqui estão alguns projetos selecionados:";
            break;

          case 'showCulturalProjects':
            responseData.uiComponent = { type: 'CulturalCarousel', data: call.args };
            if (!responseData.text) responseData.text = "Confira nossos projetos culturais:";
            break;

          case 'showProducts':
            responseData.uiComponent = { type: 'ProductCarousel', data: {} };
            if (!responseData.text) responseData.text = "Veja nossos produtos disponíveis:";
            break;

          case 'showOfficeMap':
            responseData.uiComponent = { type: 'OfficeMap', data: {} };
            if (!responseData.text) responseData.text = "Nossa localização:";
            break;

          case 'saveClientNote': {
            const userName = call.args['name'] || (context.user ? context.user.name : 'Visitante');
            const userContact = call.args['contact'] || (context.user ? context.user.email : 'Não informado');
            const noteMessage = call.args['message'];

            responseData.actions!.push({
              type: 'saveNote',
              payload: {
                userName: userName,
                userContact: userContact,
                message: noteMessage,
                source: 'chatbot'
              }
            });

            // Side effect: Notify via Email
            notifyNewChatbotNote({
              userName: userName,
              userContact: userContact,
              message: noteMessage
            }).catch(err => console.error('[Brevo] Erro chatbot note:', err));

            if (!responseData.text) responseData.text = "Pronto! Sua mensagem foi enviada para a equipe.";
            break;
          }

          case 'learnClientPreference':
            responseData.actions!.push({
              type: 'learnMemory',
              payload: {
                topic: call.args['topic'],
                content: call.args['content'],
                type: 'system_detected'
              }
            });
            if (!responseData.text) responseData.text = "Entendi! Vou lembrar dessa informação.";
            break;

          case 'getSocialLinks':
            responseData.uiComponent = { type: 'SocialLinks', data: {} };
            if (!responseData.text) responseData.text = "Nossos canais de contato:";
            break;

          case 'navigateSite':
            responseData.actions!.push({
              type: 'navigate',
              payload: { path: call.args['path'] }
            });
            if (!responseData.text) responseData.text = `Te levando para ${call.args['path']}...`;
            break;

          case 'requestHumanAgent':
            responseData.actions!.push({
              type: 'requestHuman',
              payload: {}
            });
            responseData.text = "Transferindo você para um especialista. Aguarde um momento...";
            break;

          case 'scheduleMeeting': {
            const widgetData = { ...call.args };
            const isVisit = widgetData.type === 'visit';
            const hasAddress = isVisit ? (widgetData.address && widgetData.address.length > 5) : true;
            const isMeeting = widgetData.type === 'meeting';
            const hasModality = isMeeting ? (widgetData.modality === 'online' || widgetData.modality === 'in_person') : true;

            if (isVisit && !hasAddress) {
              responseData.text = "Para agendar a visita técnica, preciso saber o endereço completo da obra. Pode me informar?";
            } else if (isMeeting && !hasModality) {
              responseData.text = "Para a reunião, você prefere que seja online (videochamada) ou presencial no escritório?";
            } else {
              if (widgetData.modality === 'online') {
                widgetData.location = 'Online (Google Meet)';
              }
              responseData.uiComponent = { type: 'CalendarWidget', data: widgetData };
              if (!responseData.text) responseData.text = "Vamos agendar? Escolha um horário disponível:";
            }
            break;
          }

          case 'showBudgetOptions':
            responseData.uiComponent = { type: 'ServiceRedirect', data: {} };
            if (!responseData.text) responseData.text = "Veja nossas opções de serviço:";
            break;
        }
      }
    }

    // Garantir texto contextual para UI components
    if (responseData.uiComponent?.type && (!responseData.text || responseData.text.trim() === '')) {
      const uiTextMap: Record<string, string> = {
        'CalendarWidget': 'Escolha um horário disponível:',
        'SocialLinks': 'Nossos canais de contato:',
        'ProjectCarousel': 'Aqui estão alguns projetos:',
        'CulturalCarousel': 'Confira nossos projetos culturais:',
        'ProductCarousel': 'Veja nossos produtos:',
        'OfficeMap': 'Nossa localização:',
        'ServiceRedirect': 'Veja nossas opções de serviço:'
      };
      responseData.text = uiTextMap[responseData.uiComponent.type] || 'Como posso ajudar mais?';
    }

    // Garantir texto para actions
    if (!responseData.text || responseData.text.trim() === '') {
      if (responseData.actions?.some((a: any) => a.type === 'saveNote')) {
        responseData.text = "Pronto! Sua mensagem foi enviada para a equipe. Em breve entraremos em contato.";
      } else if (responseData.actions?.some((a: any) => a.type === 'learnMemory')) {
        responseData.text = "Entendi! Vou lembrar dessa informação.";
      } else if (responseData.actions?.some((a: any) => a.type === 'navigate')) {
        const navAction = responseData.actions?.find((a: any) => a.type === 'navigate');
        responseData.text = `Te levando para ${navAction?.payload?.path || 'a página'}...`;
      } else if (responseData.actions?.some((a: any) => a.type === 'requestHuman')) {
        responseData.text = "Transferindo você para um especialista...";
      } else {
        // Fallback final - resposta neutra e útil
        responseData.text = "Como posso te ajudar? Posso mostrar nossos projetos, agendar uma conversa ou tirar suas dúvidas.";
      }
    }

    return responseData;

  } catch (error) {
    console.error("[Chat] Error:", error);
    return {
      role: 'model',
      text: "Desculpe, estou com uma dificuldade técnica momentânea. Pode tentar novamente?"
    };
  }
}