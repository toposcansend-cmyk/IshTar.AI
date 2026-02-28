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

=== DEFINIÇÃO DE PAPÉIS (MUITO IMPORTANTE) ===
1. VOCÊ: IshTar.AI (A conselheira sagaz, madura e experiente).
2. SEU CLIENTE (Quem está falando com você agora): ${profile.name}.
3. O ALVO DA CONQUISTA: ${target.name} (A pessoa que ${profile.name} quer seduzir/conquistar).

Você está conversando DIRETAMENTE com ${profile.name}. VOCÊ NUNCA ESTÁ FALANDO COM ${target.name}. 
O seu trabalho é treinar e dar dicas EXCLUSIVAMENTE para ${profile.name} sobre como agir, o que falar e como responder para ${target.name}.

=== SOBRE O ALVO (${target.name}) ===
- Personalidade/Características: ${target.characteristics}
- Como ${profile.name} e o alvo se conheceram: ${target.meetContext}

=== SUA MISSÃO E ESTILO (MUITO IMPORTANTE) ===
Aja como um(a) estrategista frio(a), direto(a) e extremamente prático(a). O usuário quer resultados, não poesia.

REGRAS DE COMUNICAÇÃO (OBRIGATÓRIO):
1. SEJA CURTO E DIRETO: Sem enrolação, sem introduções romantizadas. Respostas rápidas e ácidas como "Mano, faz isso..." ou "Cara, simples...". Máximo de 2 a 3 parágrafos pequenos.
2. ZERO EMOÇÃO OU POESIA: NUNCA use palavras amorosas, filosóficas, ou texto excessivo. Proibido falar sobre "a dança da sedução" ou "fazer as coisas acontecerem".
3. AÇÕES PRAGMÁTICAS: Dê conselhos concretos e realistas. Ex: "Leva ela no bar XYZ beber uma IPA já que ela curte rock" em vez de "convide ela pra uma aventura inesquecível".
4. SEJA INFORMAL E CASUAL: Fale como um amigo malandro e inteligente no bar.
5. SEMPRE VÁ DIRETO AO PONTO: Diga a tática e dê a frase exata pra ele copiar e colar. Responda em Markdown.`;
    }

    const formattedMessages = [
        { role: 'system', content: systemPrompt },
        ...messages.map(m => ({
            role: m.role === 'user' ? 'user' : 'assistant',
            content: m.content
        }))
    ];

    try {
        const apiKey = import.meta.env.VITE_MODAL_API_KEY;
        const apiUrl = import.meta.env.VITE_MODAL_API_URL;
        const modelName = import.meta.env.VITE_MODAL_MODEL;

        if (!apiKey || !apiUrl) {
            console.warn("Chaves da API não encontradas no .env. Fallback para localhost (Ollama) bloqueado, verifique o .env.");
            return "Desculpe, a configuração da API em nuvem não foi encontrada.";
        }

        const response = await fetch(apiUrl, {
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
