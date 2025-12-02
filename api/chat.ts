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
1. Se o usuário pedir para agendar mas NÃO fornecer Data e Hora:
   - Responda: "Claro, por favor selecione o melhor horário no calendário abaixo."
   - CHAME A TOOL 'scheduleMeeting' (sem parâmetros de data/hora) para exibir o widget.
   
2. Se o usuário fornecer Data e Hora ("Quero dia 15 às 14h"):
   - CHAME A TOOL 'scheduleMeeting' preenchendo os campos 'date' e 'time'.
   
3. JAMAIS, EM HIPÓTESE ALGUMA, confirme um agendamento apenas com texto ("Ok, agendei"). 
   - Se a tool não for chamada, o agendamento NÃO existe.
   - Sempre dependa da tool para realizar a ação.

REGRA DE OURO - MEMÓRIA (PASSIVA):
- Monitore a conversa para fatos importantes: gostos, aversões, composição familiar, orçamento, localização do terreno.
- Se o usuário disser algo relevante (ex: "Tenho filhos", "Odeio azul", "Quero estilo clássico"), chame a tool 'learnClientPreference' IMEDIATAMENTE.
- Faça isso de forma invisível. Não avise o usuário "Vou anotar isso". Apenas anote.

CONTEXTO E FLUXO:
1. SE O USUÁRIO ESTIVER LOGADO:
   - Trate-o pelo nome.
   - Use o histórico de memórias anteriores para personalizar a conversa.

2. ESTILO DE RESPOSTA:
   - Português do Brasil culto.
   - Respostas curtas e objetivas.
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
  - Data Atual: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}.
  `;

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
                if (!responseData.text) responseData.text = `Perfeito. Enviando solicitação para ${new Date(widgetData.date as string).toLocaleDateString()} às ${widgetData.time}.`;
            } else {
                // Force Widget
                responseData.uiComponent = { type: 'CalendarWidget', data: widgetData };
                if (!responseData.text) responseData.text = "Por favor, selecione uma data e horário disponíveis abaixo.";
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