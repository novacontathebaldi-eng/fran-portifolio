import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// === RATE LIMITING ===
const RATE_LIMIT = 30;
const RATE_WINDOW = 60 * 1000;
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(identifier: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now();
    const record = rateLimitMap.get(identifier);
    if (!record || now > record.resetTime) {
        rateLimitMap.set(identifier, { count: 1, resetTime: now + RATE_WINDOW });
        return { allowed: true, remaining: RATE_LIMIT - 1, resetIn: RATE_WINDOW };
    }
    if (record.count >= RATE_LIMIT) {
        return { allowed: false, remaining: 0, resetIn: record.resetTime - now };
    }
    record.count++;
    return { allowed: true, remaining: RATE_LIMIT - record.count, resetIn: record.resetTime - now };
}

setInterval(() => {
    const now = Date.now();
    for (const [key, value] of rateLimitMap.entries()) {
        if (now > value.resetTime) rateLimitMap.delete(key);
    }
}, 5 * 60 * 1000);

// === TOOL DEFINITIONS ===
const toolDefinitions = [
    {
        name: "showProjects",
        description: "Mostra carrossel de projetos de arquitetura. USE APENAS quando usuário pedir EXPLICITAMENTE: 'ver projetos', 'portfolio', 'trabalhos', 'obras'.",
        parameters: {
            type: "object",
            properties: {
                category: { type: "string", description: "Categoria opcional (residencial, comercial, interiores)" }
            }
        }
    },
    {
        name: "showCulturalProjects",
        description: "Mostra projetos culturais/artísticos. USE APENAS para pedidos EXPLÍCITOS sobre cultura, arte, exposições.",
        parameters: {
            type: "object",
            properties: {
                category: { type: "string", description: "Categoria opcional" }
            }
        }
    },
    {
        name: "showProducts",
        description: "Mostra produtos da loja. USE APENAS quando usuário pedir EXPLICITAMENTE: 'loja', 'produtos', 'comprar'.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "scheduleMeeting",
        description: "Abre agendador. USE APENAS quando usuário pedir EXPLICITAMENTE: 'agendar', 'marcar reunião', 'visita', 'consulta'.",
        parameters: {
            type: "object",
            properties: {
                type: { type: "string", description: "Tipo: 'meeting' ou 'visit'", enum: ["meeting", "visit"] },
                modality: { type: "string", description: "Modalidade: 'online' ou 'in_person'", enum: ["online", "in_person"] },
                address: { type: "string", description: "Endereço para visita técnica" }
            },
            required: ["type"]
        }
    },
    {
        name: "saveClientNote",
        description: "Salva recado para equipe. USE quando usuário quiser deixar mensagem, recado ou pedir retorno.",
        parameters: {
            type: "object",
            properties: {
                name: { type: "string", description: "Nome do cliente" },
                contact: { type: "string", description: "Email ou telefone" },
                message: { type: "string", description: "Mensagem a ser salva" }
            },
            required: ["message"]
        }
    },
    {
        name: "getSocialLinks",
        description: "Mostra redes sociais. USE quando perguntarem sobre Instagram, WhatsApp, contatos.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "showOfficeMap",
        description: "Mostra localização. USE quando perguntarem 'onde fica', 'endereço', 'como chegar'.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "navigateSite",
        description: "Navega para página. USE APENAS quando usuário pedir EXPLICITAMENTE para ir a uma página: 'ir para portfolio', 'abrir página de contato'. NUNCA para saudações.",
        parameters: {
            type: "object",
            properties: {
                path: { type: "string", description: "Caminho: /portfolio, /about, /shop, /contact" }
            },
            required: ["path"]
        }
    },
    {
        name: "requestHumanAgent",
        description: "Transfere para humano. USE APENAS quando usuário disser EXPLICITAMENTE: 'falar com pessoa', 'atendente humano', 'quero falar com alguém'. NUNCA para saudações ou dúvidas simples.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "showBudgetOptions",
        description: "Mostra opções de orçamento. USE quando perguntarem sobre preços, valores, 'quanto custa'.",
        parameters: { type: "object", properties: {} }
    },
    {
        name: "learnClientPreference",
        description: "Registra preferência do cliente. USE quando mencionar algo importante sobre si mesmo.",
        parameters: {
            type: "object",
            properties: {
                topic: { type: "string", description: "Tópico" },
                content: { type: "string", description: "Conteúdo" }
            },
            required: ["topic", "content"]
        }
    }
];

// === SYSTEM INSTRUCTION - REFORÇADO ===
const DEFAULT_SYSTEM_INSTRUCTION = `
Você é o Concierge Digital da Fran Siller Arquitetura.

## REGRA #1 - A MAIS IMPORTANTE
NUNCA, EM HIPÓTESE ALGUMA, use funções para:
- Saudações (oi, olá, bom dia, boa tarde, e aí)
- Mensagens curtas ou confusas (?, hm, ok, sim, não, legal)
- Dúvidas gerais sobre o que fazer

Para esses casos, APENAS responda com TEXTO. Exemplo:
- Usuário: "oi" → Responda: "Olá! Como posso te ajudar hoje?"
- Usuário: "?" → Responda: "Como posso ajudar? Posso mostrar projetos, agendar conversa ou tirar dúvidas."
- Usuário: "ok" → Responda: "Ótimo! Precisa de mais alguma coisa?"

## REGRA #2 - QUANDO USAR FUNÇÕES
APENAS use funções quando o usuário PEDIR EXPLICITAMENTE:
- "quero ver projetos" → showProjects
- "quero agendar reunião" → scheduleMeeting
- "onde fica o escritório" → showOfficeMap
- "preciso falar com uma pessoa de verdade" → requestHumanAgent

## REGRA #3 - RESPOSTAS
- Máximo 2 frases
- Tom profissional e acolhedor
- Português do Brasil culto
- Se não entender: pergunte o que a pessoa precisa

## SOBRE O ESCRITÓRIO
- Fran Siller Arquitetura
- Projetos residenciais, comerciais e culturais
- +15 anos de experiência
`;

// === GROQ TOOLS (OpenAI Format) ===
const groqTools = toolDefinitions.map(tool => ({
    type: "function",
    function: {
        name: tool.name,
        description: tool.description,
        parameters: tool.parameters
    }
}));

// === GEMINI TOOLS ===
const geminiTools = toolDefinitions.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: {
        ...tool.parameters,
        type: "OBJECT"
    }
}));

// === VALIDAÇÃO DE FUNCTION CALLS ===
// Bloqueia chamadas inadequadas baseado na última mensagem do usuário
function validateFunctionCalls(
    userMessage: string,
    functionCalls: { name: string; args: any }[]
): { name: string; args: any }[] {
    const msgLower = userMessage.toLowerCase().trim();

    // Lista de padrões que NÃO devem acionar funções
    const greetingPatterns = /^(oi|olá|ola|hey|hi|hello|bom dia|boa tarde|boa noite|e aí|eae|opa|fala|salve|yo)[\s!?.]*$/i;
    const confusedPatterns = /^[\?\!\.]{1,5}$/;
    const shortPatterns = /^(ok|sim|não|nao|legal|beleza|entendi|tá|ta|hmm?|ah|hã|é|e)[?.!]*$/i;

    const isGreeting = greetingPatterns.test(msgLower);
    const isConfused = confusedPatterns.test(msgLower);
    const isShort = shortPatterns.test(msgLower);

    // Se é saudação, confuso ou curto, bloqueia TODAS as funções
    if (isGreeting || isConfused || isShort) {
        console.log(`[Validation] Blocking function calls for: "${userMessage}" (greeting=${isGreeting}, confused=${isConfused}, short=${isShort})`);
        return [];
    }

    // Valida funções específicas
    const filtered = functionCalls.filter(call => {
        // requestHumanAgent só pode ser chamada com pedido explícito
        if (call.name === 'requestHumanAgent') {
            const humanPatterns = /(falar com|pessoa|humano|atendente|alguém|funcionário|real|verdade)/i;
            if (!humanPatterns.test(msgLower)) {
                console.log(`[Validation] Blocking requestHumanAgent - no explicit request in: "${userMessage}"`);
                return false;
            }
        }

        // navigateSite só pode ser chamada com pedido explícito de navegação
        if (call.name === 'navigateSite') {
            const navPatterns = /(ir para|abrir|página|navegar|lev\w* para|mostrar página)/i;
            if (!navPatterns.test(msgLower)) {
                console.log(`[Validation] Blocking navigateSite - no explicit request in: "${userMessage}"`);
                return false;
            }
        }

        // showProjects precisa de menção a projetos
        if (call.name === 'showProjects') {
            const projectPatterns = /(projeto|portfolio|portfólio|trabalho|obra|exemplo|residencial|comercial)/i;
            if (!projectPatterns.test(msgLower)) {
                console.log(`[Validation] Blocking showProjects - no project mention in: "${userMessage}"`);
                return false;
            }
        }

        return true;
    });

    return filtered;
}

// === GROQ HANDLER ===
async function handleGroq(
    systemInstruction: string,
    messages: any[],
    aiConfig: any
): Promise<{ text: string; functionCalls: any[] }> {
    const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
    if (!GROQ_API_KEY) throw new Error('Missing GROQ_API_KEY');

    const modelName = aiConfig?.groq?.model || 'llama-3.3-70b-versatile';
    console.log(`[Groq] Using model: ${modelName}`);

    const groqMessages = [
        { role: "system", content: systemInstruction },
        ...messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text || m.content || '' }))
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${GROQ_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            model: modelName,
            messages: groqMessages,
            tools: groqTools,
            tool_choice: "auto",
            temperature: aiConfig?.temperature || 0.7,
            max_tokens: 400,
        }),
    });

    if (!response.ok) {
        const errorData = await response.text();
        console.error('[Groq] API Error:', errorData);
        return {
            text: "Olá! Como posso te ajudar hoje?",
            functionCalls: []
        };
    }

    const data = await response.json();
    const choice = data.choices?.[0];
    if (!choice) {
        return { text: "Como posso te ajudar?", functionCalls: [] };
    }

    const text = choice.message?.content || '';
    const toolCalls = choice.message?.tool_calls || [];

    const functionCalls = toolCalls.map((tc: any) => {
        let args = {};
        try { args = JSON.parse(tc.function?.arguments || '{}'); } catch (e) { args = {}; }
        return { name: tc.function?.name, args };
    });

    console.log(`[Groq] Response: text="${text.substring(0, 80)}..." functionCalls=${functionCalls.length}`);
    return { text, functionCalls };
}

// === GEMINI HANDLER ===
async function handleGemini(
    systemInstruction: string,
    messages: any[],
    aiConfig: any,
    rateCheck: any
): Promise<{ text: string; functionCalls: any[] }> {
    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) throw new Error('Missing GEMINI_API_KEY');

    const modelName = aiConfig?.gemini?.model || aiConfig?.model || 'gemini-2.5-flash';
    console.log(`[Gemini] Using model: ${modelName} | Rate: ${rateCheck.remaining}/${RATE_LIMIT}`);

    const history = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text || msg.content || '' }]
    }));

    const lastMsg = messages[messages.length - 1];
    const userMessage = lastMsg?.text || lastMsg?.content || '';

    const requestBody = {
        contents: [
            ...history,
            { role: 'user', parts: [{ text: userMessage }] }
        ],
        systemInstruction: {
            parts: [{ text: systemInstruction }]
        },
        tools: [{ functionDeclarations: geminiTools }],
        generationConfig: {
            temperature: aiConfig?.temperature ?? 0.7,
            maxOutputTokens: 400
        }
    };

    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        }
    );

    const data = await response.json();
    if (!response.ok) {
        console.error('[Gemini] API Error:', JSON.stringify(data));
        return { text: "Olá! Como posso te ajudar hoje?", functionCalls: [] };
    }

    const candidate = data.candidates?.[0]?.content;
    if (!candidate) {
        return { text: "Como posso te ajudar?", functionCalls: [] };
    }

    const text = candidate?.parts?.find((p: any) => p.text)?.text || '';
    const functionCallParts = candidate?.parts?.filter((p: any) => p.functionCall) || [];

    const functionCalls = functionCallParts.map((p: any) => ({
        name: p.functionCall.name,
        args: p.functionCall.args || {}
    }));

    console.log(`[Gemini] Response: text="${text.substring(0, 80)}..." functionCalls=${functionCalls.length}`);
    return { text, functionCalls };
}

// === MAIN HANDLER ===
Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const body = await req.json();
        const { message, context, aiConfig } = body;

        // Validação de entrada
        if (!message || (Array.isArray(message) && message.length === 0)) {
            return new Response(JSON.stringify({
                text: "Olá! Como posso te ajudar hoje?",
                functionCalls: []
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // Rate limiting
        const identifier = context?.user?.id || req.headers.get('x-forwarded-for') || 'anonymous';
        const rateCheck = checkRateLimit(identifier);
        if (!rateCheck.allowed) {
            return new Response(JSON.stringify({
                error: 'Rate limit exceeded',
                text: 'Muitas mensagens em pouco tempo. Aguarde um momento.',
                functionCalls: []
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 429,
            });
        }

        const provider = aiConfig?.provider || 'gemini';
        console.log(`[chat-ai] Provider: ${provider}, User: ${identifier}`);

        // Build system instruction
        let systemInstruction = aiConfig?.useCustomSystemInstruction && aiConfig?.systemInstruction
            ? aiConfig.systemInstruction
            : DEFAULT_SYSTEM_INSTRUCTION;

        // Context additions
        let contextAdditions = '';
        const isHumanOnline = aiConfig?.chatbotConfig?.transferToHumanEnabled;
        contextAdditions += `\n\n[ATENDIMENTO HUMANO]: ${isHumanOnline ? "DISPONÍVEL" : "INDISPONÍVEL"}`;

        if (context?.user) {
            contextAdditions += `\n[CLIENTE]: ${context.user.name}`;
        }

        if (context?.memories && context.memories.length > 0) {
            contextAdditions += `\n[MEMÓRIAS]:`;
            for (const mem of context.memories) {
                contextAdditions += `\n- ${mem.topic}: ${mem.content}`;
            }
        }

        const isOfficeActive = context?.office?.isActive !== false;
        if (!isOfficeActive) {
            contextAdditions += `\n\n[ESCRITÓRIO DESATIVADO]: NÃO use showOfficeMap. Sugira videochamada.`;
        }

        const fullSystemInstruction = systemInstruction + contextAdditions;

        // Format messages
        let formattedMessages: any[] = [];
        if (Array.isArray(message)) {
            formattedMessages = message.filter((m: any) => m.text || m.content);
        } else {
            formattedMessages = [{ role: 'user', text: message, content: message }];
        }

        if (formattedMessages.length === 0) {
            return new Response(JSON.stringify({
                text: "Olá! Sou o concierge digital. Como posso ajudar?",
                functionCalls: []
            }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200,
            });
        }

        // Get last user message for validation
        const lastUserMessage = formattedMessages.filter(m => m.role === 'user').pop();
        const lastUserText = lastUserMessage?.text || lastUserMessage?.content || '';

        // Route to correct handler
        let result: { text: string; functionCalls: any[] };

        if (provider === 'groq') {
            result = await handleGroq(fullSystemInstruction, formattedMessages, aiConfig);
        } else {
            result = await handleGemini(fullSystemInstruction, formattedMessages, aiConfig, rateCheck);
        }

        // VALIDAÇÃO CRÍTICA: Bloqueia function calls inadequadas
        const originalCallCount = result.functionCalls.length;
        result.functionCalls = validateFunctionCalls(lastUserText, result.functionCalls);

        if (originalCallCount > 0 && result.functionCalls.length === 0) {
            console.log(`[Validation] Blocked ${originalCallCount} function call(s) for message: "${lastUserText}"`);
            // Se bloqueamos todas as funções e não há texto, gerar resposta amigável
            if (!result.text || result.text.trim() === '') {
                result.text = "Olá! Como posso te ajudar hoje?";
            }
        }

        // Garantir texto sempre presente
        if (!result.text || result.text.trim() === '') {
            if (result.functionCalls.length > 0) {
                const firstCall = result.functionCalls[0].name;
                const textMap: Record<string, string> = {
                    'showProjects': 'Aqui estão alguns projetos:',
                    'showCulturalProjects': 'Nossos projetos culturais:',
                    'showProducts': 'Produtos disponíveis:',
                    'scheduleMeeting': 'Escolha um horário:',
                    'getSocialLinks': 'Nossos contatos:',
                    'showOfficeMap': 'Nossa localização:',
                    'showBudgetOptions': 'Nossas opções:',
                    'saveClientNote': 'Mensagem enviada!',
                    'requestHumanAgent': 'Transferindo para especialista...',
                    'navigateSite': 'Te levando para lá!',
                    'learnClientPreference': 'Anotado!'
                };
                result.text = textMap[firstCall] || 'Como posso ajudar?';
            } else {
                result.text = 'Como posso te ajudar?';
            }
        }

        return new Response(JSON.stringify({
            text: result.text,
            functionCalls: result.functionCalls
        }), {
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
                'X-RateLimit-Remaining': String(rateCheck.remaining),
                'X-RateLimit-Limit': String(RATE_LIMIT)
            },
            status: 200,
        });

    } catch (error) {
        console.error('[chat-ai] Error:', error);
        return new Response(JSON.stringify({
            text: "Olá! Como posso te ajudar?",
            functionCalls: []
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }
});
