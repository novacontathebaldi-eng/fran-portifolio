
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

export const config = {
  runtime: 'edge',
};

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

export default async function handler(req: Request) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
  }

  try {
    const { message, context, config: aiConfig } = await req.json();
    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return new Response(JSON.stringify({ 
        text: "O sistema de IA está em modo de demonstração (Sem API Key).",
        role: 'model'
      }), { status: 200 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct System Instruction
    let systemInstruction = aiConfig?.systemInstruction || "You are a helpful assistant for Fran Siller Architecture.";
    if (context?.user) {
      systemInstruction += `\n\nYou are talking to ${context.user.name} (${context.user.role}).`;
    }

    const modelName = aiConfig?.model || 'gemini-2.5-flash';

    const response = await ai.models.generateContent({
      model: modelName,
      contents: message,
      config: {
        systemInstruction: systemInstruction,
        tools: tools,
        temperature: aiConfig?.temperature || 0.7,
      },
    });

    const candidate = response.candidates?.[0];
    const modelText = candidate?.content?.parts?.find(p => p.text)?.text;
    const functionCalls = candidate?.content?.parts?.filter(p => p.functionCall).map(p => p.functionCall);

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
          // Send action to frontend to save via Context
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

    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}
