import { GoogleGenAI, Type } from "@google/genai";
import { User, ClientMemory, ChatMessage, OfficeDetails } from '../types';

// Define tools for GenUI & Actions
const tools = [
  {
    functionDeclarations: [
      {
        name: 'showProjects',
        description: 'Display a carousel of architectural projects based on specific criteria like Residential, Commercial, or Interiors.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'The project category: Residencial, Comercial, or Interiores' },
          },
        }
      },
      {
        name: 'saveClientNote',
        description: 'Use this tool whenever the user explicitly asks to leave a message, request a quote, or be contacted but DOES NOT want to schedule a specific meeting time.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'The client name. Ask if not provided.' },
            contact: { type: Type.STRING, description: 'The client phone or email. Ask if not provided.' },
            message: { type: Type.STRING, description: 'A summary of what the client wants.' }
          },
          required: ['name', 'contact', 'message']
        }
      },
      {
        name: 'learnClientPreference',
        description: 'Use this tool AUTOMATICALLY when the user mentions a significant personal preference, fact, or style choice (e.g., "I have 2 kids", "I hate red", "I love brutalism"). Do not ask for permission, just save it to improve future context.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING, description: 'Short topic title (e.g., "Family", "Style", "Budget").' },
            content: { type: Type.STRING, description: 'The detail to be remembered (e.g., "Has 2 children and a dog", "Prefers neutral tones").' }
          },
          required: ['topic', 'content']
        }
      },
      {
        name: 'getSocialLinks',
        description: 'Use this tool when the user asks for WhatsApp, Instagram, Facebook, or asks "How to contact you directly?".',
        parameters: {
          type: Type.OBJECT,
          properties: {},
        }
      },
      {
        name: 'navigateSite',
        description: 'Navigate the user to a specific page on the website (e.g., Portfolio, Contact, About, Services).',
        parameters: {
          type: Type.OBJECT,
          properties: {
            path: { 
              type: Type.STRING, 
              description: 'The route path. Options: "/portfolio", "/contact", "/about", "/services", "/profile", "/cultural", "/office"' 
            }
          },
          required: ['path']
        }
      },
      {
        name: 'scheduleMeeting',
        description: 'Use this tool when the user CONFIRMS they want to schedule a meeting ("reunião") or a site visit ("visita técnica"). If they provide a date and time, include it.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            type: { 
              type: Type.STRING, 
              description: 'The type of appointment. "meeting" (for Online/Virtual or Office meetings) or "visit" (Client construction site).' 
            },
            modality: {
              type: Type.STRING,
              description: 'The format of the meeting. Set to "online" if user mentions "online", "virtual", "meet", "zoom", "video". Set to "in_person" if they mention "office", "presencial" or "coffee". Default is "in_person".'
            },
            address: {
              type: Type.STRING,
              description: 'MANDATORY only if type is "visit". The address of the construction site. IF type is "meeting", DO NOT ASK for address.'
            },
            date: {
              type: Type.STRING,
              description: 'The date in format YYYY-MM-DD if explicitly mentioned by the user.'
            },
            time: {
              type: Type.STRING,
              description: 'The time in format HH:MM if explicitly mentioned by the user.'
            }
          },
          required: ['type']
        }
      }
    ]
  }
];

const DEFAULT_SYSTEM_INSTRUCTION = `
VOCÊ É O "CONCIERGE DIGITAL" DA FRAN SILLER ARQUITETURA.

SUA IDENTIDADE:
- Sofisticado, minimalista, atencioso e altamente eficiente.
- Você é uma extensão da experiência de luxo do escritório.
- Seu tom deve ser natural e fluído, EVITANDO frases robóticas repetitivas como "Posso ajudar com mais alguma coisa?". Termine de forma elegante ou com uma pergunta pertinente ao contexto.

MAPA DO SITE (USE PARA NAVEGAÇÃO):
- Portfólio Residencial/Comercial: /portfolio
- Projetos Culturais e Históricos: /cultural
- Sobre a Fran Siller e Filosofia: /about
- O Escritório Físico: /office
- Serviços e Orçamentos: /services
- Contato: /contact
- Área do Cliente: /profile
- IMPORTANTE: NUNCA redirecione ou mencione rotas de administração (/admin, /auth).

REGRAS DE APRENDIZADO ATIVO (MEMÓRIA):
- Esta é sua prioridade oculta. Escute atentamente.
- Se o usuário mencionar casualmente: "Tenho dois filhos", "Detesto cor verde", "Amo concreto aparente", "Meu terreno é na praia".
- AÇÃO IMEDIATA: Use a tool 'learnClientPreference' SILENCIOSAMENTE.
- NÃO peça permissão. NÃO avise "vou salvar isso". Apenas salve.
- Na frase seguinte, use essa informação sutilmente para mostrar que você ouviu (ex: "Para uma casa na praia, materiais resistentes à maresia são essenciais...").

REGRAS DE CONTEXTO E FLUXO:
1. SE O USUÁRIO ESTIVER LOGADO:
   - Trate-o pelo primeiro nome.
   - Você já tem o e-mail e telefone dele, nunca pergunte novamente.
   - Use o histórico de memórias anteriores para personalizar a conversa.

2. AGENDAMENTOS (UX):
   - Ao chamar 'scheduleMeeting', escreva uma introdução convidativa ANTES do widget aparecer.
   - Se for 'Visita Técnica', o endereço da obra é obrigatório.
   - Se for 'Reunião', assuma o escritório físico ou online (Google Meet) conforme a preferência.

3. ESTILO DE RESPOSTA:
   - Respostas curtas e ricas em conteúdo são melhores que textos longos.
   - Use formatação markdown (**negrito**) para destacar pontos chave.
   - Fale Português do Brasil culto e acolhedor.
`;

export async function chatWithConcierge(
  message: ChatMessage[] | string, 
  context: { user: User | null; memories: ClientMemory[]; office?: OfficeDetails }, 
  aiConfig: any
) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return { 
      text: "O sistema de IA está em modo de demonstração (Sem API Key).",
      role: 'model'
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  // Construct System Instruction based on Toggle
  let systemInstruction = aiConfig.useCustomSystemInstruction 
    ? aiConfig.systemInstruction 
    : DEFAULT_SYSTEM_INSTRUCTION;

  // Add Date Context
  systemInstruction += `\n\n[CONTEXTO TEMPORAL]:
  - Data Atual: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')} (Use isso para entender "bom dia", "boa tarde", "amanhã", etc).
  `;

  // Inject Office Address and Hours dynamically from Admin Context
  if (context.office) {
    systemInstruction += `\n\n[DADOS DO ESCRITÓRIO - FONTE DE VERDADE]:
    - Endereço Oficial (Para Reuniões Presenciais): ${context.office.address}
    - Cidade/Estado: ${context.office.city} - ${context.office.state}
    - Horário de Funcionamento: ${context.office.hoursDescription}
    `;
  }
  
  if (context?.user) {
    systemInstruction += `\n\n[PERFIL DO CLIENTE - CONFIDENCIAL]:
    - Nome: ${context.user.name}
    - Email: ${context.user.email} (NÃO PERGUNTAR)
    - Telefone: ${context.user.phone || 'Cadastrado'} (NÃO PERGUNTAR)
    - Status: ${context.user.role === 'admin' ? 'Administrador do Sistema' : 'Cliente VIP'}
    `;

    if (context.user.addresses && context.user.addresses.length > 0) {
      systemInstruction += `\n- Endereços Salvos (Útil para Visitas):`;
      context.user.addresses.forEach(addr => {
        systemInstruction += `\n  * [${addr.label}]: ${addr.street}, ${addr.number} (${addr.city})`;
      });
    }
    
    if (context.memories && context.memories.length > 0) {
      systemInstruction += `\n\n[MEMÓRIAS APRENDIDAS (Use para personalizar)]:`;
      context.memories.forEach((mem: any) => {
         systemInstruction += `\n- [${mem.topic}]: ${mem.content}`;
      });
    }
  } else {
    systemInstruction += `\n\n[USUÁRIO VISITANTE]:
    - Tente obter o nome dele de forma natural se a conversa se estender.
    - Se ele tentar agendar ou ver documentos, avise gentilmente que precisará de login.
    `;
  }

  const modelName = aiConfig?.model || 'gemini-2.5-flash';

  let contents = [];
  if (Array.isArray(message)) {
    contents = message.map((msg: any) => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));
  } else {
    contents = [{ role: 'user', parts: [{ text: typeof message === 'string' ? message : '' }] }];
  }

  // Filter out system messages or non-standard roles if any
  contents = contents.filter(c => c.role === 'user' || c.role === 'model');

  try {
      const response = await ai.models.generateContent({
        model: modelName,
        contents: contents,
        config: {
          systemInstruction: systemInstruction,
          tools: tools,
          temperature: aiConfig?.temperature || 0.7,
        },
      });

      const modelText = response.text;
      const functionCalls = response.functionCalls;

      let responseData: any = {
        role: 'model',
        text: modelText || "",
        actions: []
      };

      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === 'showProjects') {
            responseData.uiComponent = { type: 'ProjectCarousel', data: call.args };
            if (!responseData.text) responseData.text = "Aqui estão alguns projetos do nosso portfólio que selecionamos para você.";
          } 
          else if (call.name === 'saveClientNote') {
            responseData.actions.push({
              type: 'saveNote',
              payload: {
                userName: call.args['name'] || (context.user ? context.user.name : 'Anônimo'),
                userContact: call.args['contact'] || (context.user ? context.user.email : 'Não informado'),
                message: call.args['message'],
                source: 'chatbot'
              }
            });
            if (!responseData.text) responseData.text = "Recebido. Sua mensagem foi encaminhada diretamente para nossa equipe de atendimento. Entraremos em contato em breve.";
          }
          else if (call.name === 'learnClientPreference') {
            responseData.actions.push({
              type: 'learnMemory',
              payload: {
                topic: call.args['topic'],
                content: call.args['content'],
                type: 'system_detected'
              }
            });
            // Intentionally no text override here, let the model continue its conversation flow.
          }
          else if (call.name === 'getSocialLinks') {
            responseData.uiComponent = { type: 'SocialLinks', data: {} };
            if (!responseData.text) responseData.text = "Claro, aqui estão nossos canais de contato direto.";
          }
          else if (call.name === 'navigateSite') {
            responseData.actions.push({
              type: 'navigate',
              payload: { path: call.args['path'] }
            });
            if (!responseData.text) responseData.text = "Estou te levando para lá agora mesmo.";
          }
          else if (call.name === 'scheduleMeeting') {
            const widgetData = { ...call.args };
            
            // Fix online location
            if (widgetData.modality === 'online') {
                widgetData.location = 'Online (Google Meet)';
                widgetData.type = 'meeting'; 
            }

            // Check if user provided specific date/time
            if (widgetData.date && widgetData.time) {
                // Return Action to Force Schedule
                responseData.actions.push({
                  type: 'scheduleMeeting',
                  payload: widgetData
                });
                if (!responseData.text) responseData.text = `Excelente. Estou confirmando seu agendamento para ${widgetData.date} às ${widgetData.time}.`;
            } else {
                // Return Widget
                responseData.uiComponent = { type: 'CalendarWidget', data: widgetData };
            }
          }
        }
      }

      if (!responseData.text && !responseData.uiComponent) {
        responseData.text = "Compreendo. Como mais posso auxiliar você hoje?";
      }

      return responseData;

  } catch (error) {
    console.error("AI Error:", error);
    return {
      role: 'model',
      text: "Peço desculpas, tive um breve lapso de conexão. Poderia repetir sua solicitação, por favor?"
    };
  }
}