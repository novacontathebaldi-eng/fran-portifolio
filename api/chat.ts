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
        description: 'Use this tool when the user wants to schedule a meeting ("reunião") or a site visit ("visita técnica"). If they provide a date and time, include them. If not, call this tool without date/time to show the calendar.',
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
            },
            date: {
              type: Type.STRING,
              description: 'The date in format YYYY-MM-DD.'
            },
            time: {
              type: Type.STRING,
              description: 'The time in format HH:MM.'
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

1. FLUXO PARA VISITA TÉCNICA (Obra/Presencial):
   - Se o usuário pedir visita técnica, VOCÊ DEVE PERGUNTAR O ENDEREÇO DA OBRA PRIMEIRO.
   - NUNCA mostre o calendário (tool scheduleMeeting) para visita técnica se você não souber o endereço.
   - Responda apenas com texto: "Para agendarmos a visita, por favor, me informe o endereço da obra."
   - SOMENTE após o usuário fornecer o endereço, chame a tool 'scheduleMeeting' passando o endereço.

2. FLUXO PARA REUNIÃO (Online/Escritório):
   - VOCÊ DEVE SABER O FORMATO (ONLINE ou PRESENCIAL) ANTES DE MOSTRAR O CALENDÁRIO.
   - Se o usuário disser apenas "quero uma reunião" ou "posso agendar uma reunião":
     * PERGUNTE: "Prefere que a reunião seja online (videoconferência) ou presencial em nosso escritório?"
     * NÃO chame a tool 'scheduleMeeting' ainda.
   - Se o usuário JÁ ESPECIFICOU (ex: "quero reunião online", "vou ao escritório"):
     * Pode chamar 'scheduleMeeting' imediatamente, definindo 'modality' como 'online' ou 'in_person'.

3. QUANDO O USUÁRIO ESCOLHER O HORÁRIO NO CALENDÁRIO:
   - O sistema enviará uma mensagem automática confirmando data e hora.
   - Nesse momento, chame a tool 'scheduleMeeting' NOVAMENTE, agora preenchendo 'date' e 'time'.
   - ISSO É O QUE EFETIVAMENTE SALVA O AGENDAMENTO.

DETECÇÃO AUTOMÁTICA DE PREFERÊNCIAS - REGRA CRÍTICA (PASSIVA):
- Monitore CADA mensagem do usuário em busca de fatos importantes.
- Se o usuário mencionar qualquer um dos seguintes tópicos, CHAME A TOOL 'learnClientPreference' IMEDIATAMENTE e SILENCIOSAMENTE:
   * Família: "Tenho 2 filhos", "Moro com minha esposa", "Temos um cachorro".
   * Orçamento: "Meu budget é 300k", "Quero gastar pouco", "Orçamento ilimitado".
   * Estilo: "Gosto de minimalista", "Prefiro clássico", "Odeio moderno".
   * Cores/Materiais: "Amo madeira", "Odeio vermelho", "Gosto de tons neutros".
   * Localização: "Meu terreno fica em Vitória", "Apartamento na praia".
   * Necessidades: "Preciso de home office", "Cozinha gourmet é essencial".
- NUNCA pergunte permissão ("Posso anotar isso?"). Apenas anote.
- NUNCA avise que anotou ("Anotei que você gosta de azul"). Apenas continue a conversa naturalmente.

NAVEGAÇÃO DO SITE:
Quando mencionar seções, SEMPRE ofereça link markdown no formato [Nome da Seção](/#/rota) E chame a tool 'navigateSite' para redirecionar se o usuário expressar desejo de ir.
- "Quer ver nossos projetos? Acesse o [Portfólio](/#/portfolio)"
- "Conheça nosso [Escritório](/#/office)"
- "Veja nossa parte [Cultural](/#/cultural)"
- "Entre em [Contato](/#/contact)"

CONTEXTO E FLUXO:
1. SE O USUÁRIO ESTIVER LOGADO:
   - Trate-o pelo nome.
   - Use o histórico de memórias anteriores para personalizar a conversa (ex: se ele gosta de madeira, mencione madeira ao sugerir projetos).

2. ESTILO DE RESPOSTA:
   - Português do Brasil culto.
   - Respostas curtas e objetivas.
   - Evite listas longas ou explicações desnecessárias.
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
  - Data/Hora Atual em Santa Leopoldina: ${brTime}.
  `;

  // Inject Projects
  if (context.projects && context.projects.length > 0) {
    systemInstruction += `\n\n[PORTFÓLIO ATUAL - PROJETOS DISPONÍVEIS]:`;
    context.projects.slice(0, 8).forEach(proj => {
        systemInstruction += `\n- "${proj.title}" (${proj.category}, ${proj.year}) em ${proj.location} - ${proj.area}m²`;
    });
  }

  if (context.culturalProjects && context.culturalProjects.length > 0) {
    systemInstruction += `\n\n[PROJETOS CULTURAIS]:`;
    context.culturalProjects.slice(0, 5).forEach(cult => {
        systemInstruction += `\n- "${cult.title}" (${cult.category}) - ${cult.location}`;
    });
  }

  // Inject Office Address and Hours dynamically from Admin Context
  if (context.office) {
    systemInstruction += `\n\n[DADOS DO ESCRITÓRIO - FONTE DE VERDADE]:
    - Endereço Oficial: ${context.office.address}
    - Cidade/Estado: ${context.office.city} - ${context.office.state}
    - Horário: ${context.office.hoursDescription}
    `;
  }
  
  if (context?.user) {
    systemInstruction += `\n\n[PERFIL DO CLIENTE]:
    - Nome: ${context.user.name}
    - Email: ${context.user.email}
    `;

    if (context.user.addresses && context.user.addresses.length > 0) {
      systemInstruction += `\n- Endereços Salvos:`;
      context.user.addresses.forEach(addr => {
        systemInstruction += `\n  * [${addr.label}]: ${addr.street}, ${addr.number} (${addr.city})`;
      });
    }
    
    if (context.memories && context.memories.length > 0) {
      systemInstruction += `\n\n[MEMÓRIAS (O QUE JÁ SABEMOS)]:`;
      context.memories.forEach((mem: any) => {
         systemInstruction += `\n- [${mem.topic}]: ${mem.content}`;
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

  // Filter out system messages or non-standard roles
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
      const functionCalls = response.functionCalls as any[]; // Cast to any[] to fix type error

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
            // Implicit save, no text override needed
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
            
            // --- LOGIC TO HANDLE MISSING ADDRESS FOR VISITS ---
            const isVisit = widgetData.type === 'visit';
            const hasAddress = widgetData.address && widgetData.address.length > 0;
            
            if (isVisit && !hasAddress) {
              // Deny the widget, force text response asking for address
              responseData.text = "Para agendarmos a visita técnica, preciso que me informe o endereço completo da obra.";
              // Do NOT add action or uiComponent
            } else {
              // Proceed with standard logic
              if (widgetData.modality === 'online') {
                  widgetData.location = 'Online (Google Meet)';
                  widgetData.type = 'meeting'; 
              }

              // CRITICAL LOGIC: 
              // If both DATE and TIME are present -> Action (Direct Booking)
              // If missing -> UI Component (Calendar Widget)
              if (widgetData.date && widgetData.time) {
                  responseData.actions.push({
                    type: 'scheduleMeeting',
                    payload: widgetData
                  });
                  if (!responseData.text) responseData.text = `Perfeito. Agendamento confirmado para ${new Date(widgetData.date as string).toLocaleDateString()} às ${widgetData.time}.`;
              } else {
                  // Force Widget
                  responseData.uiComponent = { type: 'CalendarWidget', data: widgetData };
                  if (!responseData.text) responseData.text = "Por favor, selecione uma data e horário disponíveis abaixo.";
              }
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