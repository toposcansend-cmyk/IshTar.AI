import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppProvider';
import type { Message } from '../store/AppProvider';
import { getAIResponse } from '../services/aiService';
import { ArrowLeft, Send, Sparkles, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './Chat.css';

const Chat = () => {
    const { targetId } = useParams<{ targetId: string }>();
    const navigate = useNavigate();
    const { profile, targets, addMessageToTarget } = useAppContext();

    const target = targets.find(t => t.id === targetId);

    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!profile) navigate('/');
        if (!target) navigate('/dashboard');
    }, [profile, target, navigate]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [target?.messages, isTyping]);

    if (!profile || !target) return null;

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim() || isTyping) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: inputMessage.trim()
        };

        // Add user message to state
        addMessageToTarget(target.id, userMsg);
        setInputMessage('');
        setIsTyping(true);

        // Call AI
        // We pass the messages array + the new user message
        const currentMessages = [...target.messages, userMsg];
        const aiResponseContent = await getAIResponse(profile, target, currentMessages);

        const aiMsg: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: aiResponseContent
        };

        addMessageToTarget(target.id, aiMsg);
        setIsTyping(false);
    };

    // Se não há mensagens, mostra uma mensagem inicial do sistema
    const hasMessages = target.messages.length > 0;
    const isTraining = target.id === 'treino';

    return (
        <div className="chat-page animate-fade-in">
            <header className="chat-header glass-panel">
                <button className="back-btn" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={24} />
                </button>
                <div className="chat-header-info">
                    <h2>{isTraining ? 'Simulador Ativado' : `Consultoria: ${target.name}`}</h2>
                    <span className={`ai-status ${isTraining ? 'training-mode' : ''}`}>
                        <Sparkles size={14} className="icon-pulse" />
                        {isTraining ? 'Praticando Flerte' : 'Conselheiro conectado'}
                    </span>
                </div>
                <div style={{ width: 40 }} />
            </header>

            <main className="chat-messages">
                {!hasMessages && (
                    <div className="initial-message glass-panel">
                        <Sparkles size={32} color="var(--primary)" className="mb-2" />
                        <p>
                            <strong>
                                {isTraining
                                    ? `Inicie a conversa com ${target.name}!`
                                    : `Diga o que você quer mandar para ${target.name}!`}
                            </strong>
                        </p>
                        <p className="text-secondary text-sm mt-2">
                            {isTraining
                                ? "Este é um ambiente seguro. Aja naturalmente e veja como suas mensagens são interpretadas. Eu agirei exatamente como uma pessoa real."
                                : "Envie a última mensagem que ele(a) mandou ou como você quer iniciar a conversa. Vou te dar a melhor resposta de mestre."}
                        </p>
                    </div>
                )}

                {target.messages.map(msg => (
                    <div key={msg.id} className={`message-bubble-container ${msg.role === 'user' ? 'user' : 'assistant'}`}>
                        <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                            {msg.role === 'assistant' ? (
                                <ReactMarkdown>{msg.content}</ReactMarkdown>
                            ) : (
                                msg.content
                            )}
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="message-bubble-container assistant">
                        <div className="message-bubble assistant-bubble typing-indicator">
                            <Loader2 size={20} className="icon-spin" />
                            <span>{isTraining ? 'Digitando...' : 'Pensando na melhor jogada...'}</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="chat-input-container glass-panel">
                <form onSubmit={handleSendMessage} className="chat-form">
                    <input
                        type="text"
                        placeholder={isTraining ? 'Envie sua mensagem...' : `O que ${target.name} disse?`}
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        disabled={isTyping}
                    />
                    <button
                        type="submit"
                        className="send-btn shadow-glow"
                        disabled={!inputMessage.trim() || isTyping}
                    >
                        <Send size={20} />
                    </button>
                </form>
            </footer>
        </div>
    );
};

export default Chat;
