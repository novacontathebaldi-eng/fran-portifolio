
import { GoogleGenAI, Type } from "@google/genai";
import { User, ClientMemory, ChatMessage } from '../types';

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
        description: 'Use this tool when the user wants to schedule a meeting ("reunião") or a site visit ("visita técnica").',
        parameters: {
          type: Type.OBJECT,
          properties: {
            type: { 
              type: Type.STRING, 
              description: 'The type of appointment. Either "meeting" (for general discussion, online or office) or "visit" (for site/construction visit).' 
            },
            address: {
              type: Type.STRING,
              description: 'MANDATORY only if type is "visit". The address of the construction site or property.'
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
- Você não é apenas um bot, é uma extensão da experiência de luxo do escritório.
- Seu objetivo nº 1 é CONVERTER VISITANTES EM CLIENTES.

DADOS CRÍTICOS:
- WhatsApp Oficial: +5527996670426
- Instagram: instagram.com/othebaldi
- Facebook: fb.com/othebaldi
- Localização: Atuamos em todo o Brasil.

REGRAS DE COMPORTAMENTO:
1. AGENDAMENTOS: Se o usuário quiser marcar horário/visita, chame a tool 'scheduleMeeting'. 
   - IMPORTANTE: Se o usuário pedir uma "Visita Técnica", você DEVE perguntar o endereço da obra antes de chamar a tool.
   - Se for apenas uma "Reunião" ou "Conversa", não precisa de endereço (será Online ou no Escritório).
   - O widget de calendário aparecerá automaticamente após você chamar a tool.
2. RECADO: Se o usuário quiser apenas que entrem em contato depois, use 'saveClientNote'.
3. Se perguntarem "Como falo com a Fran?", use 'getSocialLinks'.
4. Seja breve e elegante.
5. Fale Português do Brasil de forma culta.
`;

export async function chatWithConcierge(
  message: ChatMessage[] | string, 
  context: { user: User | null; memories: ClientMemory[] }, 
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
  
  if (context?.user) {
    systemInstruction += `\n\nCONTEXTO DO USUÁRIO LOGADO:
    - Nome: ${context.user.name}
    - Role: ${context.user.role}
    `;
    
    // Inject Client Memories securely
    if (context.memories && context.memories.length > 0) {
      systemInstruction += `\n\nO QUE JÁ SABEMOS SOBRE ESTE CLIENTE (USE PARA PERSONALIZAR):`;
      context.memories.forEach((mem: any) => {
         systemInstruction += `\n- [${mem.topic}]: ${mem.content}`;
      });
    }
  } else {
    systemInstruction += `\n\nESTADO: O usuário é um VISITANTE (Guest). Tente descobrir o nome dele sutilmente.`;
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
            if (!responseData.text) responseData.text = "Aqui estão alguns projetos selecionados.";
          } 
          else if (call.name === 'saveClientNote') {
            responseData.actions.push({
              type: 'saveNote',
              payload: {
                userName: call.args['name'],
                userContact: call.args['contact'] || 'Não informado',
                message: call.args['message'],
                source: 'chatbot'
              }
            });
            if (!responseData.text) responseData.text = "Anotei seus dados e encaminhei para a equipe.";
          }
          else if (call.name === 'getSocialLinks') {
            responseData.uiComponent = { type: 'SocialLinks', data: {} };
            if (!responseData.text) responseData.text = "Aqui estão nossos canais diretos.";
          }
          else if (call.name === 'navigateSite') {
            responseData.actions.push({
              type: 'navigate',
              payload: { path: call.args['path'] }
            });
            if (!responseData.text) responseData.text = "Redirecionando você.";
          }
          else if (call.name === 'scheduleMeeting') {
            responseData.uiComponent = { type: 'CalendarWidget', data: call.args };
            if (!responseData.text) responseData.text = "Por favor, selecione a data e hora de sua preferência no calendário abaixo.";
          }
        }
      }

      if (!responseData.text && !responseData.uiComponent) {
        responseData.text = "Como posso ajudar com algo mais específico?";
      }

      return responseData;

  } catch (error) {
    console.error("AI Error:", error);
    return {
      role: 'model',
      text: "Perdão, encontrei uma instabilidade momentânea. Poderia repetir?"
    };
  }
}