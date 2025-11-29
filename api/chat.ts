
import { GoogleGenAI, Type, FunctionDeclaration } from "@google/genai";

export const config = {
  runtime: 'edge',
};

// Define tools for GenUI
const tools = [
  {
    functionDeclarations: [
      {
        name: 'showProjects',
        description: 'Display a carousel of architectural projects based on specific criteria like category or style.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: 'Residencial, Comercial, or Interiores' },
            style: { type: Type.STRING, description: 'Minimalist, Industrial, etc.' }
          },
          required: ['category']
        }
      },
      {
        name: 'showContact',
        description: 'Show the contact card or lead form to the user.',
        parameters: {
          type: Type.OBJECT,
          properties: {},
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
      // Fallback for development/demo if no key is present in env
      return new Response(JSON.stringify({ 
        text: "O sistema de IA está em modo de demonstração (Sem API Key). Por favor configure a GEMINI_API_KEY na Vercel.",
        role: 'model'
      }), { status: 200 });
    }

    const ai = new GoogleGenAI({ apiKey });
    
    // Construct System Instruction with Context
    let systemInstruction = aiConfig?.systemInstruction || "You are a helpful assistant for Fran Siller Architecture.";
    if (context?.user) {
      systemInstruction += `\n\nYou are talking to ${context.user.name} (${context.user.role}).`;
      if (context.user.role === 'client') {
        systemInstruction += ` They have active projects. Be professional and reassuring.`;
      }
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
      text: modelText || "Entendido.",
    };

    // Handle "GenUI" by mapping function calls to UI components
    if (functionCalls && functionCalls.length > 0) {
      const call = functionCalls[0];
      if (call.name === 'showProjects') {
        responseData.uiComponent = {
          type: 'ProjectCarousel',
          data: call.args
        };
        responseData.text = modelText || "Aqui estão alguns projetos que selecionei para você.";
      } else if (call.name === 'showContact') {
        responseData.uiComponent = {
          type: 'ContactCard',
          data: {}
        };
        responseData.text = modelText || "Claro, aqui estão as informações para entrar em contato conosco.";
      }
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
