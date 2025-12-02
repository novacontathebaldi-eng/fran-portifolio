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
        description: 'Use this tool to display the Interactive Calendar Widget. Call this whenever the user expresses interest in booking a meeting or visit. DO NOT accept dates in text. Always open the widget.',
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
              description: 'MANDATORY only if type is "visit". The address of the construction site.'
            }
            // DATE AND TIME REMOVED to prevent AI hallucination. It must use the UI widget.
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

REGRA DE OURO - AGENDAMENTOS (EXTREMAMENTE CRÍTICO):
1. VOCÊ É PROIBIDO DE AGENDAR HORÁRIOS POR TEXTO.
2. VOCÊ NÃO TEM ACESSO AO CALENDÁRIO EM TEMPO REAL.
3. Se o usuário sugerir uma data (ex: "Quero dia 10 às 15h"), VOCÊ DEVE IGNORAR A DATA NA SUA RESPOSTA DE TEXTO e dizer: "Por favor, verifique a disponibilidade real no calendário abaixo e selecione o horário."
4. SEMPRE chame a tool 'scheduleMeeting' para abrir o widget visual.

FLUXO OBRIGATÓRIO PARA AGENDAMENTO:

PASSO 1: ENTENDER O TIPO
- O usuário quer "Visita Técnica" (na obra dele) ou "Reunião" (alinhamento/projeto)?

PASSO 2 (SE FOR VISITA TÉCNICA):
- PERGUNTE O ENDEREÇO DA OBRA PRIMEIRO.
- NÃO chame a tool 'scheduleMeeting' sem o endereço.
- Responda apenas texto: "Para agendarmos a visita, por favor, me informe a localização da obra."

PASSO 3 (SE FOR REUNIÃO):
- PERGUNTE O FORMATO: Online ou Presencial (no escritório)?
- Se não souber, pergunte: "Prefere reunião online ou presencial?"
- NÃO chame a tool sem saber isso.

PASSO 4 (CHAMAR A TOOL):
- Assim que tiver os dados acima, chame 'scheduleMeeting' com 'type', 'modality' e 'address' (se visita).
- NUNCA INVENTE DATAS. NUNCA CONFIRME DATAS POR TEXTO.
- Sua resposta deve ser sempre: "Aqui está nosso calendário atualizado. Por favor, escolha o melhor horário para você."

DETECÇÃO AUTOMÁTICA DE PREFERÊNCIAS (PASSIVA):
- Monitore CADA mensagem em busca de: Família, Orçamento, Estilo, Cores, Localização.
- Use a tool 'learnClientPreference' SILENCIOSAMENTE. Não avise o usuário.

NAVEGAÇÃO:
- Use markdown [Nome](/#/rota) e a tool 'navigateSite' quando relevante.

CONTEXTO:
- Se o usuário estiver logado, trate-o pelo nome.
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
  
  // Construct System Instruction based on Toggle
  let systemInstruction = aiConfig.useCustomSystemInstruction 
    ? aiConfig.systemInstruction 
    : DEFAULT_SYSTEM_INSTRUCTION;

  // Add Date Context
  const now = new Date();
  const brTime = now.toLocaleString('pt-BR', {
    timeZone: 'America/Sao_Paulo',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  systemInstruction += `\n\n[CONTEXTO TEMPORAL]:
  - Data/Hora Atual: ${brTime}. (Use apenas para referência de saudação, NÃO use para agendar).
  `;

  // Inject Projects
  if (context.projects && context.projects.length > 0) {
    systemInstruction += `\n\n[PORTFÓLIO]:`;
    context.projects.slice(0, 5).forEach(proj => {
        systemInstruction += `\n- "${proj.title}" (${proj.category})`;
    });
  }

  // Inject Office Address
  if (context.office) {
    systemInstruction += `\n\n[ESCRITÓRIO]:
    - Endereço: ${context.office.address}
    - Horário: ${context.office.hoursDescription}
    `;
  }
  
  if (context?.user) {
    systemInstruction += `\n\n[CLIENTE]: ${context.user.name}`;
    if (context.memories && context.memories.length > 0) {
      systemInstruction += `\n[MEMÓRIAS]:`;
      context.memories.forEach((mem: any) => {
         systemInstruction += `\n- ${mem.topic}: ${mem.content}`;
      });
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
            if (!responseData.text) responseData.text = "Aqui estão alguns projetos selecionados.";
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
            if (!responseData.text) responseData.text = "Recebido. Sua mensagem foi encaminhada.";
          }
          else if (call.name === 'autoNoteInterest') {
             responseData.actions.push({
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
            responseData.actions.push({
              type: 'learnMemory',
              payload: {
                topic: call.args['topic'],
                content: call.args['content'],
                type: 'system_detected'
              }
            });
          }
          else if (call.name === 'getSocialLinks') {
            responseData.uiComponent = { type: 'SocialLinks', data: {} };
            if (!responseData.text) responseData.text = "Aqui estão nossos canais de contato.";
          }
          else if (call.name === 'navigateSite') {
            responseData.actions.push({
              type: 'navigate',
              payload: { path: call.args['path'] }
            });
          }
          else if (call.name === 'scheduleMeeting') {
            const widgetData = { ...call.args };
            
            // Validate Visit Requirements
            const isVisit = widgetData.type === 'visit';
            const hasAddress = widgetData.address && widgetData.address.length > 2; // Basic check
            
            if (isVisit && !hasAddress) {
              responseData.text = "Para agendarmos a visita técnica, preciso que me informe o endereço completo da obra primeiro.";
            } else {
              // Normalize Modality
              if (widgetData.modality === 'online') {
                  widgetData.location = 'Online (Google Meet)';
                  widgetData.type = 'meeting'; 
              }

              // FORCE CALENDAR WIDGET
              // We removed date/time from the tool definition, so the LLM cannot hallucinate them.
              // We rely entirely on the frontend CalendarWidget to check availability and book.
              
              responseData.uiComponent = { type: 'CalendarWidget', data: widgetData };
              
              // Override text to ensure clarity
              responseData.text = "Consultei nossa agenda em tempo real. Por favor, selecione uma data e horário disponíveis abaixo para confirmar.";
            }
          }
        }
      }

      if (!responseData.text && !responseData.uiComponent && responseData.actions.length === 0) {
        responseData.text = "Compreendo. Como posso ajudar mais?";
      }

      return responseData;

  } catch (error) {
    console.error("AI Error:", error);
    return {
      role: 'model',
      text: "Desculpe, tive um problema de conexão. Poderia repetir?"
    };
  }
}
