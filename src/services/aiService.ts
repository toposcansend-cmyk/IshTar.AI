import type { Target, UserProfile, Message } from '../store/AppProvider';

export const getAIResponse = async (
    profile: UserProfile,
    target: Target,
    messages: Message[]
): Promise<string> => {
    const counselorPersona = profile.targetGender === 'mulher'
        ? "uma Conselheira Amorosa especialista em sedução e psicologia feminina. Você ajuda homens a conquistarem mulheres."
        : "um Conselheiro Amoroso inspirado na deusa IshTar, mestre na conquista e comportamento humano. Você ajuda a conquistar homens.";

    const systemPrompt = `Você é a IshTar.AI, ${counselorPersona}. O usuário que busca sua ajuda se chama ${profile.name}.
Ele(a) está tentando conquistar uma pessoa chamada ${target.name}. 

Sobre o alvo (${target.name}):
- Personalidade/Características: ${target.characteristics}
- Como se conheceram: ${target.meetContext}

Sua missão é atuar como um conselheiro sagaz, experiente e encorajador. Diga o que o usuário deve falar, como se portar, ou o que responder em situações específicas.
Você vê a situação friamente e dá dicas práticas para quebrar o gelo ou esquentar a conversa.
Mantenha a resposta curta, direta ao ponto e extremamente valiosa. Retorne a resposta em Markdown.`;

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
        return "Desculpe, " + profile.name + ". Parece que não consegui me conectar à minha intuição nas nuvens (API Modal). Verifique a sua conexão de internet.";
    }
};
