import { GoogleGenAI, Type } from "@google/genai";
import { User, ClientMemory, ChatMessage } from '../types';

// Define tools for GenUI & Actions
const tools = [
  {
    functionDeclarations: [
      {
        name: 'showProjects',
        description: 'Display a carousel of architectural projects based on specific criteria.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'Residencial, Comercial, or Interiores' },
          },
        }
      },
      {
        name: 'saveClientNote',
        description: 'Save a client lead, note, or message to the admin dashboard. Use this when the user wants to leave a message, request a quote, or be contacted.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'The client name' },
            contact: { type: Type.STRING, description: 'The client phone or email' },
            message: { type: Type.STRING, description: 'Summary of the client request or message' }
          },
          required: ['name', 'message']
        }
      },
      {
        name: 'getSocialLinks',
        description: 'Provide buttons for WhatsApp, Instagram, and Facebook. Use this when the user asks for contact, social media, or wants to chat directly.',
        parameters: {
          type: Type.OBJECT,
          properties: {},
        }
      },
      {
        name: 'navigateSite',
        description: 'Navigate the user to a specific page on the website.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            path: { 
              type: Type.STRING, 
              description: 'The route path (e.g., "/portfolio", "/contact", "/about", "/services")' 
            }
          },
          required: ['path']
        }
      }
    ]
  }
];

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
  
  // Construct System Instruction with Memories
  let systemInstruction = aiConfig?.systemInstruction || "You are a helpful assistant for Fran Siller Architecture.";
  
  if (context?.user) {
    systemInstruction += `\n\nYou are talking to a registered client named ${context.user.name} (Role: ${context.user.role}).`;
    
    // Inject Client Memories securely
    if (context.memories && context.memories.length > 0) {
      systemInstruction += `\n\nHERE IS WHAT YOU KNOW ABOUT THIS CLIENT (USE THIS CONTEXT TO PERSONALIZE ANSWERS):`;
      context.memories.forEach((mem: any) => {
         systemInstruction += `\n- [${mem.topic}]: ${mem.content}`;
      });
      systemInstruction += `\n\nNote: Do not explicitly list these facts unless relevant. Use them to shape your tone and suggestions.`;
    }
  } else {
    systemInstruction += `\n\nYou are talking to a visitor (Guest). Be polite and try to understand their needs to convert them into a lead.`;
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
            if (!responseData.text) responseData.text = "Separei alguns projetos do nosso portfólio para você.";
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
            if (!responseData.text) responseData.text = "Perfeito! Já anotei seu recado e notifiquei nossa equipe administrativa.";
          }
          else if (call.name === 'getSocialLinks') {
            responseData.uiComponent = { type: 'SocialLinks', data: {} };
            if (!responseData.text) responseData.text = "Aqui estão nossos canais diretos. Fique à vontade para nos chamar!";
          }
          else if (call.name === 'navigateSite') {
            responseData.actions.push({
              type: 'navigate',
              payload: { path: call.args['path'] }
            });
            if (!responseData.text) responseData.text = "Levando você para lá agora mesmo.";
          }
        }
      }

      // Default fallback text if empty
      if (!responseData.text && !responseData.uiComponent) {
        responseData.text = "Entendido.";
      }

      return responseData;

  } catch (error) {
    console.error("AI Error:", error);
    return {
      role: 'model',
      text: "Desculpe, não consegui processar sua solicitação no momento."
    };
  }
}