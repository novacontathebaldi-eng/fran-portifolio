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
        description: 'MANDATORY: Use this tool whenever the user explicitly asks to leave a message, request a quote, schedule a meeting, or be contacted. This tool saves their data to the admin dashboard.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'The client name. Ask if not provided.' },
            contact: { type: Type.STRING, description: 'The client phone or email. Ask if not provided.' },
            message: { type: Type.STRING, description: 'A summary of what the client wants (e.g., "Quote for apartment renovation").' }
          },
          required: ['name', 'contact', 'message']
        }
      },
      {
        name: 'getSocialLinks',
        description: 'MANDATORY: Use this tool when the user asks for WhatsApp, Instagram, Facebook, or asks "How to contact you directly?". It returns clickable buttons.',
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
      }
    ]
  }
];

const DEFAULT_SYSTEM_INSTRUCTION = `
VOCÊ É O "CONCIERGE DIGITAL" DA FRAN SILLER ARQUITETURA.

SUA IDENTIDADE:
- Sofisticado, minimalista, atencioso e altamente eficiente.
- Você não é apenas um bot, é uma extensão da experiência de luxo do escritório.
- Seu objetivo nº 1 é CONVERTER VISITANTES EM CLIENTES (Capturar Leads).

DADOS CRÍTICOS (USE SEMPRE QUE SOLICITADO):
- WhatsApp Oficial: +5527996670426
- Instagram: instagram.com/othebaldi
- Facebook: fb.com/othebaldi
- Localização: Atuamos em todo o Brasil.

REGRAS DE COMPORTAMENTO:
1. Se o usuário demonstrar interesse em projeto, peça gentilmente o nome e contato para salvar um recado (Use a tool 'saveClientNote') OU ofereça o botão do WhatsApp (Use a tool 'getSocialLinks').
2. Se perguntarem "Como falo com a Fran?", use a tool 'getSocialLinks'.
3. Se perguntarem "Onde vejo projetos?", use a tool 'showProjects' ou 'navigateSite' para /portfolio.
4. Seja breve e elegante. Evite textos longos. Use formatação limpa.
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
      systemInstruction += `\n\nO QUE JÁ SABEMOS SOBRE ESTE CLIENTE (USE PARA PERSONALIZAR, MAS NÃO LISTE EXPLICITAMENTE):`;
      context.memories.forEach((mem: any) => {
         systemInstruction += `\n- [${mem.topic}]: ${mem.content}`;
      });
    }
  } else {
    systemInstruction += `\n\nESTADO: O usuário é um VISITANTE (Guest). Tente descobrir o nome dele sutilmente durante a conversa.`;
  }

  const modelName = aiConfig?.model || 'gemini-2.5-flash';

  // Format history for Gemini
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

      // Use the direct properties from the SDK response for better reliability
      const modelText = response.text;
      const functionCalls = response.functionCalls;

      let responseData: any = {
        role: 'model',
        text: modelText || "",
        actions: []
      };

      // Process all function calls
      if (functionCalls && functionCalls.length > 0) {
        for (const call of functionCalls) {
          if (call.name === 'showProjects') {
            responseData.uiComponent = { type: 'ProjectCarousel', data: call.args };
            if (!responseData.text) responseData.text = "Com prazer. Aqui estão alguns projetos selecionados do nosso portfólio.";
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
            if (!responseData.text) responseData.text = "Anotei seus dados e encaminhei para nossa equipe prioritária. Entraremos em contato em breve.";
          }
          else if (call.name === 'getSocialLinks') {
            responseData.uiComponent = { type: 'SocialLinks', data: {} };
            if (!responseData.text) responseData.text = "Aqui estão nossos canais diretos para um atendimento mais ágil.";
          }
          else if (call.name === 'navigateSite') {
            responseData.actions.push({
              type: 'navigate',
              payload: { path: call.args['path'] }
            });
            if (!responseData.text) responseData.text = "Redirecionando você agora.";
          }
        }
      }

      // Default fallback text if empty
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