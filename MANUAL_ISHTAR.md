# IshTar.AI - Manual do Desenvolvedor & Guia de Manutenção
Bem-vindo ao manual completo da aplicação \`IshTar.AI\`, o seu Conselheiro Amoroso baseado em Inteligência Artificial.
Este documento serve como fonte da verdade técnica para entender, dar manutenção e evoluir esta plataforma PWA responsiva.

---

## 1. Visão Geral (Overview)
**IshTar.AI** é uma aplicação focada em mobile (estilo "Mobile-first PWA") que ensina os usuários a flertar e conversar melhor com seus alvos românticos. O sistema armazena informações sobre as "Conquistas" (alvos) e simula uma consultoria através de integrações via AI, ditando estratégias contextuais baseadas nas vibrações da pessoa alvo.

Ele também possui um modo **Simulador de Treino** (Gamificado), onde o usuário interage diretamente com o alvo e recebe análises e notas pós-treino através do **Debriefing do Mestre**.

---

## 2. Stack Tecnológica
* **Frontend:** React 18 + TypeScript no empacotador Vite.
* **Estilização:** Vanilla CSS focado no efeito "Glassmorphism" e "Neon/Dark Mode". Não são usados frameworks como Tailwind propositalmente para manter controle total e leve do design (Arquitetura CSS Modular Base).
* **Gerência de Estado:** Context API (\`AppProvider.tsx\`) associado ao persistência no \`localStorage\`. Componentes não complexificam estado.
* **Ícones:** \`lucide-react\`.
* **Motor de Inteligência Artificial:** Google Gemini (anteriormente GLM-5/Qwen) acessada através de um Proxy Modal (\`api.us-west-2.modal.direct/v1/chat/completions\`). A API se comunica no padrão OpenAI.
* **Deploy e CI/CD:** Github Pages (via npm script \`npm run deploy\`).

---

## 3. Estrutura de Diretórios Clássica
```text
src/
├── assets/                  # Imagens de avatares base em .png (Homem/Mulher)
├── pages/                   # Views em tela cheia do sistema
│   ├── Onboarding.tsx       # Cadastro do jogador e gênero (tela inicial)
│   ├── Dashboard.tsx        # Lista de targets e botão de Treino
│   ├── TargetForm.tsx       # Formulação do alvo (Tags, Níveis de Dificuldade)
│   ├── Chat.tsx             # A Arena (Consultoria e Simulador)
│   └── *.css                # Css das páginas (ex: Chat.css)
├── services/                # Módulos estáticos e conexões externas
│   └── aiService.ts         # Orquestrador Absoluto da API Gemini vs Modal (Possui Engine de Retry)
├── store/                   # Estado Global
│   └── AppProvider.tsx      # React Context (Context API)
├── App.tsx                  # Roteador (react-router-dom)
└── main.tsx                 # Entrypoint Vite
```

---

## 4. Gerenciamento de Dados (Context)
Tudo mora dentro do \`AppProvider.tsx\`. O LocalStorage retém as memórias:
* \`love_counselor_profile\`: Dados do usuário logado (\`UserProfile\` -> nome, targetGender).
* \`love_counselor_targets\`: Array contendo todos os alvos cadastrados e os logs de chat inteiros.
Toda vez que uma nova mensagem de chat ocorre (ou a IA responde), o alvo é atualizado globalmente gravando imediatamente no cache do browser, então refreshs no celular são seguros.

---

## 5. Integração Neural com IA (\`aiService.ts\`)
O sistema da IA não é um Chatbot estático, é um **Estrategista Dinâmico**. Ele se divide em 2 núcleos dentro do serviço HTTP:

### 5.1 Modo de Consultoria (Power of 3)
A IA é instruída a cuspir um JSON com as **Três opções de estratégia**: Direta, Charmosa, Contextual.
A API processa os logs das tentativas do cliente, injeta no \`systemPrompt\` as \`Tags\` e o \`Contexto\` da pessoa a ser seduzida e devolve um JSON parseado que o Front-End projeta em Abas interativas elegantes.

### 5.2 Modo Simulador e Debriefing (Gamificação)
O target fixo cujo "id" é \`treino\` é magicamente interpretado pelo robô para mudar de personalidade de "coach" para o avatar da própria pessoa.
* **Mood Meter:** A IA retorna \`{ mensagem: "", sentiment_score: 0 a 1 }\`. Esse *score* reflete a barra de Frio, Neutro, Quente no \`Chat.tsx\`.
* **Função \`generateDebriefing\`:** Uma pipeline executada após o treino, enviando **apenas o log histórico**, para um Master Coach IA, que o devora e retorna um Relatório de Performance Completo (JSON com {nota, analise, pontos_fortes, pontos_melhoria, dica_ouro}). 
O score gerado tem \`(temperature: 0.3)\` para ser crítico e letal sobre as imperfeições da conversa.

### 5.3 Tolerância a Falhas (The Fallback Armor)
Pela cota do Gemini (15 RPM / Requests per minute) e gateways que quebram, o componente \`fetchWithRetry\` encapsula **todas as conexões** no serviço da internet, interceptando erros e aplicando Tentações com Backoff de 2 Segundos em falhas HTTP \`50*\`.
Se o limite da *Quota Grátis* for atingido (Erro 429), ele intercepta preventivamente, encerra a repetição e instrui graficamente o usuário por mensagem.

---

## 6. Evolução e Próximos Passos (Roadmap da Versão 2)

**Sprint 3: Fast Reply (Botão de Pânico)**
Deverá ser incluído no futuro um Input rápido direto da página \`Dashboard.tsx\`, onde o usuário gruda a mensagem que recebeu ("O que ela te mandou?"). Isso chama uma variação super compacta do \`aiService.ts\` que gera 2 linhas mágicas, com foco na resposta mais rápida possível.

**Sprint 4: Análise de Prints (Visão Computacional)**
A UI do Chat precisa de uma câmera/anexo. O base64 de um Print do WhatsApp/Instagram será remetido ao Modelo Multimodal (Gemini Flash) para reconhecer as interações, interpretar as figurinhas/gírias, e traçar a resposta baseada em imagem em vez de Input de texto.

---

## 7. Como Executar e Manter

* **Clone e Instale:** \`npm install\`
* **Desenvolvimento Local:** \`npm run dev\`
* **Env Keys:** Precisará de um arquivo \`.env\` na raiz:
    * \`VITE_MODAL_API_URL\` = "https://api.us-west-2.modal.direct/v1/chat/completions"
    * \`VITE_MODAL_MODEL\` = "gemini-2.5-flash"
    * \`VITE_MODAL_API_KEY\` = {A Chave de API encriptada em Base64 `btoa()` para burlar bots rastreadores}
* **Deploy via GitHub Pages:** Execute \`npm run deploy\`. O script \`gh-pages\` irá engolir o empacotamento (\`dist/\`) e subir automaticamente na árvore.

> **💡 Regra de Ouro do Design (Aesthetic First):** O IshTar.AI foi construído para sentir o charme até no Front-end. Se injetar novos inputs, adicione animações e backgrounds "Glassmorphism" escuros. Fuja da aparência de "Painel Administrativo chato". Faça as animações contarem a história de evolução.
