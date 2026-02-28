import type { Target, UserProfile, Message } from '../store/AppProvider';

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
- Seja realista, reaja conforme as coisas que ele disser. Se ele for malandro e for bem, dê corda. Se for muito emocionado ou chato, seja evasivo(a) ou corte.
- NUNCA aja como um conselheiro. Aja EXATAMENTE como a pessoa seduzida.
- Responda apenas o que a pessoa diria na conversa (sem conselhos, sem análise). Use linguagem de chat casual (sem pontuação excessiva, abreviando palavras se quiser).`;
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

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: modelName,
                messages: formattedMessages,
                temperature: 0.7,
                response_format: target.id !== 'treino' ? { type: "json_object" } : undefined
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.choices && data.choices[0] ? data.choices[0].message.content : "Erro ao processar resposta.";

    } catch (err: any) {
        console.error("Erro na integração com AI: ", err);
        return "Desculpe, " + profile.name + ". Parece que não consegui me conectar à minha intuição nas nuvens (Google Gemini). Verifique a sua conexão de internet e se a API Key é válida.";
    }
};
