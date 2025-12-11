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
      throw new Error(error.message || 'Erro na comunicação com o servidor de IA');
    }

    // Data structure returned from Edge Function: { text: string, functionCalls: ToolCall[] }
    let modelText = data.text || "";
    const functionCalls = data.functionCalls as ToolCall[];

    // Clean up any function call syntax that the model might have included in the text
    // Some models (especially smaller ones) may output function calls as text
    const functionNames = 'showProjects|showCulturalProjects|showProducts|scheduleMeeting|saveClientNote|getSocialLinks|showOfficeMap|navigateSite|requestHumanAgent|showBudgetOptions|learnClientPreference';
    modelText = modelText
      .replace(/<function=[^>]*><\/function>/gi, '')
      .replace(/<function=[^>]*>/gi, '')
      .replace(/<\/function>/gi, '')
      .replace(/\[function_call:[^\]]*\]/gi, '')
      .replace(/```tool_call[\s\S]*?```/gi, '')
      // Catch function calls written as text like: saveClientNote("message")
      .replace(new RegExp(`\\b(${functionNames})\\s*\\([^)]*\\)`, 'gi'), '')
      // Catch markdown-style function calls
      .replace(new RegExp(`\\*\\*(${functionNames})[^*]*\\*\\*`, 'gi'), '')
      // Catch standalone function names on their own line
      .replace(new RegExp(`^\\s*(${functionNames})\\s*$`, 'gim'), '')
      // Catch function names at end of text
      .replace(new RegExp(`\\s+(${functionNames})\\s*$`, 'gi'), '')
      // Catch function descriptions written as text
      .replace(/OBRIGATÓRIO quando pedir[^.]*\./gi, '')
      .replace(/Transfere para humano\./gi, '')
      .replace(/Mostra [^.]*\./gi, '')
      .replace(/Salva [^.]*\./gi, '')
      // Catch JSON arguments written as text (from 8B models)
      .replace(/\{"type":\s*"[^"]*"\}/gi, '')
      .replace(/\{"message":\s*"[^"]*"\}/gi, '')
      .replace(/\{[^{}]*"type"[^{}]*\}/gi, '')
      .trim();

    let responseData: ChatResponse = {
      role: 'model',
      text: modelText,
      actions: []
    };


    // Process function calls (Tools) - Client side logic for UI Components & Side Effects
    if (functionCalls && functionCalls.length > 0) {
      for (const call of functionCalls) {
        if (call.name === 'showProjects') {
          responseData.uiComponent = { type: 'ProjectCarousel', data: call.args };
          if (!responseData.text) responseData.text = "Aqui estão alguns projetos selecionados.";
        }
        else if (call.name === 'showCulturalProjects') {
          responseData.uiComponent = { type: 'CulturalCarousel', data: call.args };
          if (!responseData.text) responseData.text = "Aqui estão alguns dos nossos projetos culturais:";
        }
        else if (call.name === 'showProducts') {
          responseData.uiComponent = { type: 'ProductCarousel', data: {} };
          if (!responseData.text) responseData.text = "Confira alguns produtos disponíveis na nossa loja:";
        }
        else if (call.name === 'showOfficeMap') {
          responseData.uiComponent = { type: 'OfficeMap', data: {} };
          if (!responseData.text) responseData.text = "Aqui está a localização do nosso escritório:";
        }
        else if (call.name === 'saveClientNote') {
          const userName = call.args['name'] || (context.user ? context.user.name : 'Anônimo');
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

          // Side effect: Notify via Email (Frontend initiates this for now)
          notifyNewChatbotNote({
            userName: userName,
            userContact: userContact,
            message: noteMessage
          }).catch(err => console.error('[Brevo] Erro chatbot note:', err));

          if (!responseData.text) responseData.text = "Recebido. Sua mensagem foi encaminhada.";
        }
        else if (call.name === 'autoNoteInterest') {
          responseData.actions!.push({
            type: 'saveNote',
            payload: {
              userName: context.user ? context.user.name : 'Visitante Interessado',
              userContact: context.user ? context.user.email : 'Não identificado',
              message: `[INTERESSE AUTOMÁTICO] ${call.args['interest']} - Contexto: ${call.args['context']}`,
              source: 'chatbot'
            }
          });
        }
        else if (call.name === 'learnClientPreference') {
          responseData.actions!.push({
            type: 'learnMemory',
            payload: {
              topic: call.args['topic'],
              content: call.args['content'],
              type: 'system_detected'
            }
          });
          if (!responseData.text || responseData.text.trim() === '') {
            responseData.text = "Entendido! Vou lembrar dessa informação para melhor atendê-lo.";
          }
        }
        else if (call.name === 'getSocialLinks') {
          responseData.uiComponent = { type: 'SocialLinks', data: {} };
          if (!responseData.text) responseData.text = "Aqui estão nossos canais de contato.";
        }
        else if (call.name === 'navigateSite') {
          responseData.actions!.push({
            type: 'navigate',
            payload: { path: call.args['path'] }
          });
          if (!responseData.text) responseData.text = `Redirecionando para ${call.args['path']}...`;
        }
        else if (call.name === 'requestHumanAgent') {
          responseData.actions!.push({
            type: 'requestHuman',
            payload: {}
          });
          responseData.text = "Estou transferindo você para um de nossos arquitetos especializados. Aguarde um momento...";
        }
        else if (call.name === 'scheduleMeeting') {
          const widgetData = { ...call.args };
          const isVisit = widgetData.type === 'visit';
          const hasAddress = isVisit ? (widgetData.address && widgetData.address.length > 5) : true;
          const isMeeting = widgetData.type === 'meeting';
          const hasModality = isMeeting ? (widgetData.modality === 'online' || widgetData.modality === 'in_person') : true;

          if (isVisit && !hasAddress) {
            responseData.text = "Para agendar a visita técnica, preciso saber o endereço completo da obra.";
          } else if (isMeeting && !hasModality) {
            responseData.text = "Para a reunião, você prefere que seja online ou presencial?";
          } else {
            if (widgetData.modality === 'online') {
              widgetData.location = 'Online (Google Meet)';
            }
            responseData.uiComponent = { type: 'CalendarWidget', data: widgetData };
            if (!responseData.text) responseData.text = "Verifiquei nossa agenda. Por favor, selecione abaixo o melhor dia e horário para você.";
          }
        }
        else if (call.name === 'showBudgetOptions') {
          responseData.uiComponent = { type: 'ServiceRedirect', data: {} };
          if (!responseData.text) responseData.text = "Para orçamentos, veja nossas opções de serviços.";
        }
      }
    }

    // Override de Texto para Widgets de UI
    if (responseData.uiComponent?.type === 'CalendarWidget') {
      responseData.text = "Verifiquei nossa agenda. Por favor, selecione abaixo o melhor dia e horário para você.";
    } else if (responseData.uiComponent?.type === 'SocialLinks') {
      responseData.text = "Aqui estão nossos canais de contato direto:";
    } else if (responseData.uiComponent?.type === 'ProjectCarousel') {
      responseData.text = "Aqui estão alguns projetos selecionados para você:";
    }

    // Fallback message arrays for variety
    const fallbackMessages = {
      notUnderstood: [
        "Hmm, acho que me perdi um pouco aí. Pode explicar de outro jeito?",
        "Opa, não captei bem. Me conta mais sobre o que você precisa?",
        "Eita, essa eu não peguei! Pode dar mais contexto?",
        "Me ajuda aqui: o que exatamente você tá buscando?",
        "Interessante! Mas me explica melhor pra eu poder te ajudar direitinho.",
        "Quase lá! Só preciso entender melhor o que você quer dizer.",
        "Hm, fiquei na dúvida. Pode reformular de outra forma?"
      ],
      noteSaved: [
        "✓ Pronto! Sua mensagem já tá com a equipe. Logo entram em contato!",
        "✓ Anotado! Já repassei pra galera e em breve te retornam.",
        "✓ Beleza! Encaminhei sua mensagem. Fique tranquilo que vão te responder.",
        "✓ Feito! A equipe já recebeu e logo volta pra você.",
        "✓ Recado anotado! Nossa equipe vai te contatar em breve."
      ],
      memoryLearned: [
        "Show! Vou guardar essa info pra te atender ainda melhor.",
        "Boa! Anotei aqui. Isso vai ajudar nas nossas próximas conversas.",
        "Legal saber disso! Guardei pra referência futura.",
        "Entendi! Essa informação vai ser útil.",
        "Perfeito, vou lembrar disso!"
      ],
      navigating: [
        "Vou te levar pra lá agora mesmo!",
        "Bora! Te redirecionando...",
        "Já tô te levando pra essa página!",
        "Em um segundo você tá lá!"
      ],
      budgetInterest: [
        "Ótimo que você tá interessado! Dá uma olhada nos nossos serviços aqui:",
        "Show! Pra ter uma ideia de valores, confere nossa página de serviços:",
        "Legal! Preparei aqui as opções de serviços pra você dar uma olhada:"
      ]
    };

    // Helper function to get random fallback
    const getRandomFallback = (array: string[]): string => {
      return array[Math.floor(Math.random() * array.length)];
    };

    if (!responseData.text || responseData.text.trim() === '') {
      if (responseData.actions?.some((a: any) => a.type === 'saveNote')) {
        responseData.text = getRandomFallback(fallbackMessages.noteSaved);
      } else if (responseData.actions?.some((a: any) => a.type === 'learnMemory')) {
        responseData.text = getRandomFallback(fallbackMessages.memoryLearned);
      } else if (responseData.actions?.some((a: any) => a.type === 'navigate')) {
        const navAction = responseData.actions.find((a: any) => a.type === 'navigate');
        responseData.text = `${getRandomFallback(fallbackMessages.navigating)} (${navAction.payload.path})`;
      } else if (responseData.uiComponent?.type === 'ServiceRedirect') {
        responseData.text = getRandomFallback(fallbackMessages.budgetInterest);
      } else {
        responseData.text = getRandomFallback(fallbackMessages.notUnderstood);
      }
    }

    return responseData;

  } catch (error) {
    console.error("AI Error:", error);
    return {
      role: 'model',
      text: "Desculpe, tive um problema de conexão com a inteligência artificial. Tente novamente em alguns segundos."
    };
  }
}