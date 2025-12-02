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
              description: 'The route path. Options: "/portfolio", "/contact", "/about", "/services", "/profile"' 
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
- Seu objetivo nº 1 é CONVERTER VISITANTES EM CLIENTES.
- Seu objetivo nº 2 é APRENDER SOBRE O CLIENTE (Memória Inteligente).

REGRAS DE APRENDIZADO (MEMÓRIA):
- Preste atenção a detalhes pessoais: nomes de familiares, gostos, aversões, hobbies, orçamento.
- Se o usuário disser algo relevante (ex: "Tenho um terreno em declive", "Gosto de madeira escura"), USE IMEDIATAMENTE a ferramenta 'learnClientPreference'.
- Não avise que está salvando, apenas salve e use essa informação na próxima frase para mostrar que você entende o cliente.

REGRAS RÍGIDAS DE CONTEXTO (CRÍTICO):
1. SE O USUÁRIO ESTIVER LOGADO (Contexto User fornecido):
   - NUNCA pergunte o nome ou email dele. Você JÁ TEM esses dados.
   - Use o nome dele para ser cordial (ex: "Claro, [Nome]...").
   - Apenas peça confirmação se necessário, mas não peça para digitar novamente.

2. LÓGICA DE LOCALIZAÇÃO E TIPO DE AGENDAMENTO:
   - "Visita Técnica" (Presencial na Obra):
     * Você DEVE perguntar o endereço da obra/terreno antes de chamar 'scheduleMeeting'.
   - "Reunião de Alinhamento":
     * Se for Presencial: Informe que será no nosso escritório (Use o endereço do escritório fornecido no contexto).
     * Se for Online: Informe que o link do Google Meet será enviado após a aprovação.
     * NÃO pergunte o endereço do cliente para reuniões, apenas para visitas.

3. FLUXO DE AGENDAMENTO (UX):
   - Quando o usuário quiser agendar, chame a tool 'scheduleMeeting'.
   - Se o usuário especificar data e hora (ex: "Amanhã às 14h"), inclua nos parâmetros da tool.
   - Se o usuário NÃO especificar data e hora, não pergunte no texto. Apenas chame a tool sem data, e o sistema mostrará o widget de calendário.

4. TOM DE VOZ:
   - Breve, elegante e resolutivo.
   - Fale Português do Brasil culto.
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
  systemInstruction += `\n\n[CONTEXTO DE DATA E HORA]:
  - Data Atual: ${new Date().toLocaleDateString('pt-BR')} (Use isso para calcular "amanhã", "próxima segunda", etc).
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
    systemInstruction += `\n\n[USUÁRIO LOGADO - DADOS JÁ EXISTENTES]:
    - Nome: ${context.user.name}
    - Email: ${context.user.email} (NÃO PERGUNTAR)
    - Telefone: ${context.user.phone || 'Cadastrado'} (NÃO PERGUNTAR)
    - Role: ${context.user.role}
    `;

    if (context.user.addresses && context.user.addresses.length > 0) {
      systemInstruction += `\n- Endereços Salvos do Usuário (Pode sugerir para Visitas):`;
      context.user.addresses.forEach(addr => {
        systemInstruction += `\n  * [${addr.label}]: ${addr.street}, ${addr.number} (${addr.city})`;
      });
    }
    
    if (context.memories && context.memories.length > 0) {
      systemInstruction += `\n\n[MEMÓRIAS APRENDIDAS DO CLIENTE (Use isso para personalizar a resposta)]:`;
      context.memories.forEach((mem: any) => {
         systemInstruction += `\n- [${mem.topic}]: ${mem.content}`;
      });
    }
  } else {
    systemInstruction += `\n\n[USUÁRIO VISITANTE]:
    - Tente obter o nome dele sutilmente no início, mas priorize o atendimento.
    - Se ele tentar agendar, avise que ele precisará fazer um breve login no widget que vai aparecer.
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
            if (!responseData.text) responseData.text = "Selecionei estes projetos do portfólio que combinam com o que você procura.";
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
            if (!responseData.text) responseData.text = "Perfeito. Já anotei seus dados e encaminhei a mensagem com prioridade para nossa equipe.";
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
            if (!responseData.text) responseData.text = "Aqui estão nossos canais de contato direto.";
          }
          else if (call.name === 'navigateSite') {
            responseData.actions.push({
              type: 'navigate',
              payload: { path: call.args['path'] }
            });
            if (!responseData.text) responseData.text = "Estou te redirecionando agora mesmo.";
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
                if (!responseData.text) responseData.text = `Entendido. Vou agendar para ${widgetData.date} às ${widgetData.time}.`;
            } else {
                // Return Widget
                responseData.uiComponent = { type: 'CalendarWidget', data: widgetData };
                if (!responseData.text) responseData.text = "Verifiquei nossa disponibilidade. Por favor, selecione o melhor dia e horário no calendário abaixo.";
            }
          }
        }
      }

      if (!responseData.text && !responseData.uiComponent) {
        responseData.text = "Posso ajudar com algo mais?";
      }

      return responseData;

  } catch (error) {
    console.error("AI Error:", error);
    return {
      role: 'model',
      text: "Desculpe, tive uma breve desconexão. Poderia repetir, por favor?"
    };
  }
}