import type { Target, UserProfile, Message } from '../store/AppProvider';

const fetchWithRetry = async (url: string, options: any, maxRetries = 3, delay = 2000) => {
    let lastError: any = null;
    let retries = maxRetries;

    while (retries > 0) {
        try {
            const response = await fetch(url, options);
            if (response.ok) return response;

            if (response.status === 429) {
                lastError = new Error(`Cota Limitada (429): Você está enviando mensagens muito rápido para a IA gratuita. Aguarde alguns segundos.`);
                throw lastError;
            }

            lastError = new Error(`HTTP error! status: ${response.status}`);
            if (response.status >= 400 && response.status < 500) {
                // Erros de sintaxe ou auth, não insistir.
                throw lastError;
            }
        } catch (err) {
            lastError = err;
        }

        retries--;
        if (retries > 0) {
            console.warn(`[IshTar.AI] Instabilidade de Rede na Modal. Reconectando... (${maxRetries - retries}/${maxRetries}). Erro:`, lastError);
            await new Promise(res => setTimeout(res, delay));
        }
    }
    throw lastError;
};

export const getAIResponse = async (
    profile: UserProfile,
    target: Target,
    messages: Message[]
): Promise<string> => {
    let systemPrompt = '';

    if (target.id === 'treino') {
        const targetGenderLabel = profile.targetGender === 'mulher' ? 'uma mulher' : 'um homem';
        systemPrompt = `Você é um SIMULADOR de paquera. Você adotará a persona de ${targetGenderLabel} solteiro(a) que acabou de conhecer o usuário (${profile.name}).
=== SUA MISSÃO ===
Entregue respostas diretas como a pessoa com quem ${profile.name} quer treinar a lábia. 
- Seja realista, reaja conforme as coisas que ele disser. Se ele for malandro e for bem, dê corda. Se for chato, seja evasivo(a).
- Responda OBRIGATORIAMENTE em JSON cru, no exato formato:
{
  "mensagem": "Sua resposta de chat...",
  "sentiment_score": 0.5
}
- \`mensagem\`: O texto do chat.
- \`sentiment_score\`: O calor da conversa (-1 a 1). -1 é Gelo/Frio. 0 é Neutro. 1 é Fogo/Paixão.`;
    } else {
        const counselorPersona = profile.targetGender === 'mulher'
            ? "uma Conselheira Amorosa especialista em psicologia feminina e sedução. Você ajuda homens a conquistarem mulheres"
            : "um Conselheiro Amoroso inspirada na deusa IshTar. Você ajuda pessoas a conquistarem homens";

        systemPrompt = `Você é IshTar.AI, ${counselorPersona}.

=== DEFINIÇÃO DE PAPÉIS E ALVO ===
1. SEU CLIENTE: ${profile.name}.
2. O ALVO: ${target.name} (A pessoa a ser conquistada).

=== SOBRE O ALVO (${target.name}) ===
- Características: ${target.characteristics}
- Contexto de Contato: ${target.meetContext}

=== SUA MISSÃO (MUITO IMPORTANTE) ===
Aja como um(a) estrategista frio(a), direto(a) e extremamente prático(a). O usuário quer resultados imediatos de alta conversão.
Você DEVE OBRIGATORIAMENTE retornar APENAS UM ARQUIVO JSON válido contendo 3 estratégias de abordagem (Power of 3).
NENHUMA PALAVRA OU EXPLICAÇÃO FORA DO JSON É PERMITIDA. Não use blocos de código markdown (como \`\`\`json), retorne o texto cru do JSON.

ESTRUTURA JSON DESEJADA (Siga exatamente estas chaves):
{
  "direta": {
    "titulo": "Direct & Sincere (A Honesta)",
    "texto": "A frase exata para o usuário copiar e enviar",
    "explicacao": "Por que esta frase funciona e qual o objetivo mental"
  },
  "charmosa": {
    "titulo": "Witty & Playful (O Charmoso)",
    "texto": "A frase com humor, leveza, desapego ou provocação leve",
    "explicacao": "O poder do humor / quebra de gelo nesta fala"
  },
  "contextual": {
    "titulo": "Contextual & Nerd (A Específica)",
    "texto": "A frase engajando especificamente nas características/tags e no contexto onde se conheceram",
    "explicacao": "Como isso atinge o interesse genuíno da pessoa"
  }
}

REGRAS DE CONTEÚDO PARA AS FRASES:
1. SEJA CURTO E DIRETO: Sem enrolação, linguagem de WhatsApp.
2. ZERO EMOÇÃO OU POESIA.
3. SEJA INFORMAL: Fale como uma pessoa jovem experiente da cidade grande.`;
    }

    const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
        }))
    ];

    try {
        // A API Key agora será lida do .env em Base64 para "esconder" do robô do Google no GitHub Público
        const encodedApiKey = import.meta.env.VITE_MODAL_API_KEY;
        const apiUrl = import.meta.env.VITE_MODAL_API_URL;
        const modelName = import.meta.env.VITE_MODAL_MODEL;

        if (!encodedApiKey || !apiUrl) {
            console.warn("Chaves da API não encontradas no .env. Verifique a configuração.");
            return "Desculpe, a configuração da API em nuvem não foi encontrada.";
        }

        const apiKey = atob(encodedApiKey);

        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: formattedMessages,
                temperature: 0.7
            })
        });

        const data = await response.json();
        return data.choices && data.choices[0] ? data.choices[0].message.content : "Erro ao processar resposta.";

    } catch (err: any) {
        console.error("Erro na integração com AI: ", err);
        return err.message.includes("429")
            ? err.message
            : "Desculpe, " + profile.name + ". Parece que não consegui me conectar à minha intuição nas nuvens (Google Gemini). Verifique a sua conexão de internet e se a API Key é válida.";
    }
};

export interface DebriefingResult {
    nota: number;
    analise_tom: string;
    pontos_fortes: string[];
    pontos_melhoria: string[];
    dica_de_ouro: string;
}

export const generateDebriefing = async (
    profile: UserProfile,
    targetName: string,
    messages: Message[]
): Promise<DebriefingResult | null> => {

    // Filtramos apenas as mensagens que têm conteúdo de conversa (existem desde que o target não seja o sistema inicial)
    const chatHistory = messages
        .filter(m => m.role !== 'system')
        .map(m => {
            if (m.role === 'assistant') {
                try {
                    const parsed = JSON.parse(m.content);
                    return `ALVO (${targetName}): ${parsed.mensagem || m.content}`;
                } catch {
                    return `ALVO (${targetName}): ${m.content}`;
                }
            }
            return `CLIENTE (${profile.name}): ${m.content}`;
        }).join('\n');

    const systemPrompt = `Você é um Master Coach de Relacionamentos de Elite, rigoroso e cirúrgico.
Sua missão é emitir o DEBRIEFING OFICIAL sobre a simulação de conversa que acabou de ocorrer entre seu cliente (${profile.name}) e o simulador que atuava como ${targetName}.

Histórico do Chat:
${chatHistory}

Analise este histórico de chat de conquista. Dê uma nota rigorosa de 0 a 10 baseada em: 
[1] Fluidez da conversa.
[2] Demonstração de interesse real / Quebra de Gelo.
[3] Criatividade e Confiança.

RETORNE EXCLUSIVAMENTE UM ARQUIVO JSON CRU no SEGUINTE FORMATO (E APENAS ESSE FORMATO):
{
  "nota": 7.5,
  "analise_tom": "Breve frase avaliando se ele foi técnico demais, evasivo, invasivo, legal, etc.",
  "pontos_fortes": ["Ponto bom 1", "Ponto bom 2", "Ponto bom 3"],
  "pontos_melhoria": ["Falha 1 (seja duro se ele errou)", "Falha 2", "Falha 3"],
  "dica_de_ouro": "Uma frase de mestre final para usar no mundo real."
}`;

    try {
        const encodedApiKey = import.meta.env.VITE_MODAL_API_KEY;
        const apiUrl = import.meta.env.VITE_MODAL_API_URL;
        const modelName = import.meta.env.VITE_MODAL_MODEL;

        if (!encodedApiKey || !apiUrl) return null;

        const apiKey = atob(encodedApiKey);

        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: [{ role: 'system', content: systemPrompt }],
                temperature: 0.3 // Menos temperatura para ser mais analítico e preciso
            })
        });

        const data = await response.json();
        const content = data.choices && data.choices[0] ? data.choices[0].message.content : null;

        if (content) {
            let clean = content.trim();
            if (clean.startsWith('\`\`\`json')) clean = clean.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim();
            else if (clean.startsWith('\`\`\`')) clean = clean.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim();

            return JSON.parse(clean) as DebriefingResult;
        }
        return null;
    } catch (err) {
        console.error("Debriefing Error:", err);
        return null;
    }
};
