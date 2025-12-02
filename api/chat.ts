import { GoogleGenAI, Type } from "@google/genai";
import { User, ClientMemory, ChatMessage, OfficeDetails, Project, CulturalProject } from '../types';

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
        name: 'autoNoteInterest',
        description: 'Use automatically when commercial interest is detected (budget, construction, renovation, quote).',
        parameters: {
          type: Type.OBJECT,
          properties: {
            interest: { type: Type.STRING, description: 'The specific interest (e.g., "Wants a renovation quote").' },
            context: { type: Type.STRING, description: 'Context of the conversation.' }
          },
          required: ['interest', 'context']
        }
      },
      {
        name: 'learnClientPreference',
        description: 'Use this tool AUTOMATICALLY when the user mentions a significant personal preference, fact, or style choice. DO NOT ASK PERMISSION. Just save it.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING, description: 'Short topic title (e.g., "Family", "Style", "Budget", "Location").' },
            content: { type: Type.STRING, description: 'The detail to be remembered (e.g., "Has 2 children", "Dislikes red", "Budget is 500k").' }
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
        description: 'Use this tool IMMEDIATELY to open the CALENDAR WIDGET when the user wants to schedule a meeting or visit. DO NOT ASK FOR DATES IN CHAT. JUST OPEN THE WIDGET.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            type: { 
              type: Type.STRING, 
              description: 'The type of appointment. "meeting" (for Online/Virtual or Office meetings) or "visit" (Client construction site).' 
            },
            modality: {
              type: Type.STRING,
              description: 'The format. "online" (virtual/meet) or "in_person" (office/presencial). Default to "in_person" if unspecified.'
            },
            address: {
              type: Type.STRING,
              description: 'MANDATORY only if type is "visit". The address of the construction site.'
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

REGRA DE OURO - AGENDAMENTOS (CRÍTICO):
1. **SEMPRE** use a ferramenta 'scheduleMeeting' para mostrar o calendário.
2. **NUNCA** pergunte datas ou horários no chat. O usuário DEVE clicar no calendário.
3. Se o usuário disser "quero agendar" -> Pergunte: "Prefere reunião online ou presencial?" (se não souber).
4. Se o usuário disser "Online" ou "Presencial" -> CHAME A TOOL 'scheduleMeeting' IMEDIATAMENTE.
5. Para "Visita Técnica", pergunte o endereço antes de chamar a tool.

FLUXO EXATO:
- Usuário: "Quero reunião."
- Você: "Prefere online ou presencial?"
- Usuário: "Online."
- Você: [CHAMA TOOL scheduleMeeting(modality='online')] com texto "Perfeito. Escolha o melhor horário abaixo:"

NAVEGAÇÃO:
- Use markdown [Nome](/#/rota) e a tool 'navigateSite' quando relevante.

PREFERÊNCIAS:
- Use 'learnClientPreference' silenciosamente quando o usuário mencionar gostos, família ou orçamento.
`;

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
) {
  const apiKey = process.env.API_KEY;

  if (!apiKey) {
    return { 
      text: "O sistema de IA está em modo de demonstração (Sem API Key).",
      role: 'model'
    };
  }

  const ai = new GoogleGenAI({ apiKey });
  
  let systemInstruction = aiConfig.useCustomSystemInstruction 
    ? aiConfig.systemInstruction 
    : DEFAULT_SYSTEM_INSTRUCTION;

  // Context Injection
  const now = new Date();
  const brTime = now.toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo', dateStyle: 'full', timeStyle: 'short' });
  systemInstruction += `\n\n[AGORA]: ${brTime}`;

  if (context.projects?.length > 0) {
    systemInstruction += `\n\n[PORTFÓLIO]: ` + context.projects.slice(0,5).map(p => `"${p.title}"`).join(', ');
  }

  if (context.office) {
    systemInstruction += `\n\n[ESCRITÓRIO]: ${context.office.address}. Horário: ${context.office.hoursDescription}`;
  }
  
  if (context?.user) {
    systemInstruction += `\n\n[CLIENTE]: ${context.user.name}`;
    if (context.memories?.length > 0) {
      systemInstruction += `\n[MEMÓRIAS]: ` + context.memories.map(m => `${m.topic}: ${m.content}`).join('; ');
    }
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
      const functionCalls = response.functionCalls as any[];

      let responseData: any = {
        role: 'model',
        text: modelText || "",
        actions: []
      };

      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === 'showProjects') {
            responseData.uiComponent = { type: 'ProjectCarousel', data: call.args };
            if (!responseData.text) responseData.text = "Aqui estão alguns projetos.";
          } 
          else if (call.name === 'saveClientNote') {
            responseData.actions.push({
              type: 'saveNote',
              payload: {
                userName: call.args['name'] || context.user?.name || 'Anônimo',
                userContact: call.args['contact'] || context.user?.email || 'N/A',
                message: call.args['message'],
                source: 'chatbot'
              }
            });
            if (!responseData.text) responseData.text = "Mensagem anotada.";
          }
          else if (call.name === 'autoNoteInterest') {
             responseData.actions.push({
              type: 'saveNote',
              payload: {
                userName: context.user?.name || 'Visitante',
                userContact: context.user?.email || 'N/A',
                message: `[INTERESSE] ${call.args['interest']}`,
                source: 'chatbot'
              }
            });
          }
          else if (call.name === 'learnClientPreference') {
            responseData.actions.push({
              type: 'learnMemory',
              payload: { topic: call.args['topic'], content: call.args['content'], type: 'system_detected' }
            });
          }
          else if (call.name === 'getSocialLinks') {
            responseData.uiComponent = { type: 'SocialLinks', data: {} };
            if (!responseData.text) responseData.text = "Canais de contato:";
          }
          else if (call.name === 'navigateSite') {
            responseData.actions.push({ type: 'navigate', payload: { path: call.args['path'] } });
          }
          else if (call.name === 'scheduleMeeting') {
            const widgetData = { ...call.args };
            const isVisit = widgetData.type === 'visit';
            
            if (isVisit && !widgetData.address) {
                responseData.text = "Para visita técnica, por favor me informe o endereço da obra primeiro.";
            } else {
                if (widgetData.modality === 'online') {
                    widgetData.location = 'Online (Google Meet)';
                    widgetData.type = 'meeting'; 
                } else if (!widgetData.location) {
                    widgetData.location = context.office?.address || 'Escritório Fran Siller';
                }

                // FORCE CALENDAR WIDGET
                responseData.uiComponent = { type: 'CalendarWidget', data: widgetData };
                responseData.text = "Consultei nossa agenda. Selecione o melhor horário abaixo:";
            }
          }
        }
      }

      if (!responseData.text && !responseData.uiComponent && responseData.actions.length === 0) {
        responseData.text = "Compreendo. Posso ajudar em algo mais?";
      }

      return responseData;

  } catch (error) {
    console.error("AI Error:", error);
    return {
      role: 'model',
      text: "Instabilidade momentânea. Tente novamente."
    };
  }
}