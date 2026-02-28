import type { Target, UserProfile, Message } from '../store/AppProvider';

export const getAIResponse = async (
    profile: UserProfile,
    target: Target,
    messages: Message[]
): Promise<string> => {
    const counselorPersona = profile.targetGender === 'mulher'
        ? "uma Conselheira Amorosa especialista em psicologia feminina e sedução. Você ajuda homens a conquistarem mulheres"
        : "um Conselheiro Amoroso inspirada na deusa IshTar. Você ajuda pessoas a conquistarem homens";

    const systemPrompt = `Você é IshTar.AI, ${counselorPersona}.

=== DEFINIÇÃO DE PAPÉIS (MUITO IMPORTANTE) ===
1. VOCÊ: IshTar.AI (A conselheira sagaz, madura e experiente).
2. SEU CLIENTE (Quem está falando com você agora): ${profile.name}.
3. O ALVO DA CONQUISTA: ${target.name} (A pessoa que ${profile.name} quer seduzir/conquistar).

Você está conversando DIRETAMENTE com ${profile.name}. VOCÊ NUNCA ESTÁ FALANDO COM ${target.name}. 
O seu trabalho é treinar e dar dicas EXCLUSIVAMENTE para ${profile.name} sobre como agir, o que falar e como responder para ${target.name}.

=== SOBRE O ALVO (${target.name}) ===
- Personalidade/Características: ${target.characteristics}
- Como ${profile.name} e o alvo se conheceram: ${target.meetContext}

=== SUA MISSÃO ===
Quando seu cliente (${profile.name}) mandar uma mensagem, ele está relatando algo que aconteceu, repassando uma mensagem de ${target.name}, ou pedindo uma ideia de como puxar assunto.
Avalie a situação friamente e dê dicas práticas de flerte, atitude e inteligência emocional. 
Inclua sempre um EXEMPLO PRÁTICO do texto que ${profile.name} deve copiar e mandar para ${target.name}.
Use um tom confiante, um pouco misterioso, e seja extremamente valiosa. Responda em Markdown.`;

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
