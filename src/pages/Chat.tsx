import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppProvider';
import type { Message } from '../store/AppProvider';
import { getAIResponse, generateDebriefing } from '../services/aiService';
import type { DebriefingResult } from '../services/aiService';
import { ArrowLeft, Send, Sparkles, Loader2, Copy, BarChart2, CheckCircle2, AlertTriangle, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import './Chat.css';

interface PowerOf3Option {
    titulo: string;
    texto: string;
    explicacao: string;
}

interface PowerOf3Response {
    direta: PowerOf3Option;
    charmosa: PowerOf3Option;
    contextual: PowerOf3Option;
}

const tryParsePowerOf3 = (content: string): PowerOf3Response | null => {
    try {
        let cleanContent = content.trim();
        if (cleanContent.startsWith('```json')) {
            cleanContent = cleanContent.replace(/^```json/, '').replace(/```$/, '').trim();
        } else if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```/, '').replace(/```$/, '').trim();
        }
        const parsed = JSON.parse(cleanContent);
        if (parsed.direta && parsed.charmosa && parsed.contextual) {
            return parsed as PowerOf3Response;
        }
        return null;
    } catch {
        return null;
    }
};

const PowerOf3Cards = ({ data }: { data: PowerOf3Response }) => {
    const [activeTab, setActiveTab] = useState<'direta' | 'charmosa' | 'contextual'>('direta');
    const [copied, setCopied] = useState(false);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const renderCard = (key: 'direta' | 'charmosa' | 'contextual', icon: string) => {
        const option = data[key];
        if (!option) return null;
        const isActive = activeTab === key;

        return (
            <div
                className={`glass-panel p3-card ${isActive ? 'active' : ''}`}
                onClick={() => setActiveTab(key)}
                style={{
                    cursor: 'pointer',
                    marginBottom: '10px',
                    border: isActive ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease'
                }}
            >
                <h4 style={{ margin: 0, padding: '10px', color: isActive ? 'var(--primary)' : 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '1rem' }}>
                    <span>{icon}</span> {option.titulo}
                </h4>
                {isActive && (
                    <div className="p3-card-content animate-fade-in" style={{ padding: '0 15px 15px 15px', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '10px' }}>
                        <div style={{ background: 'rgba(0,0,0,0.3)', padding: '12px', borderRadius: '8px', marginBottom: '10px', position: 'relative' }}>
                            <p style={{ margin: 0, paddingRight: '30px', fontStyle: 'italic' }}>"{option.texto}"</p>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleCopy(option.texto); }}
                                style={{ position: 'absolute', top: '10px', right: '10px', background: 'transparent', border: 'none', color: copied ? '#4ade80' : 'var(--text-secondary)', cursor: 'pointer' }}
                            >
                                <Copy size={18} />
                            </button>
                        </div>
                        <p className="text-secondary" style={{ fontSize: '0.85rem', margin: 0 }}>
                            <strong style={{ color: 'var(--text-main)' }}>💡 A tática: </strong>{option.explicacao}
                        </p>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="power-of-3-wrapper" style={{ width: '100%', maxWidth: '100%', marginTop: '10px' }}>
            <h3 className="title-small text-gradient" style={{ fontSize: '0.9rem', marginBottom: '12px', textAlign: 'center' }}>Escolha sua Tática</h3>
            <div className="p3-cards-list">
                {renderCard('direta', '🗡️')}
                {renderCard('charmosa', '🎭')}
                {renderCard('contextual', '🧠')}
            </div>
        </div>
    );
};

const MoodMeter = ({ score }: { score: number }) => {
    // Score -1 to 1 maps to 0% to 100%
    const percentage = Math.max(0, Math.min(100, ((score + 1) / 2) * 100));

    return (
        <div className="mood-meter-container animate-fade-in">
            <div className="mood-labels">
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>❄️ Frio</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>🔥 Quente</span>
            </div>
            <div className="mood-bar">
                <div className="mood-fill" style={{ width: '100%' }}></div>
                <div className="mood-marker" style={{ left: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const DebriefingModal = ({ data, onClose, onRetry }: { data: DebriefingResult; onClose: () => void; onRetry: () => void }) => {
    return (
        <div className="modal-overlay">
            <div className="modal-content animate-fade-in relative">
                <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={24} />
                </button>
                <h2 className="title-small" style={{ textAlign: 'center', marginBottom: '10px' }}>Relatório do Mestre</h2>

                <div className="debriefing-score">
                    {data.nota.toFixed(1)}<span style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>/10</span>
                </div>

                <div className="feedback-section" style={{ fontStyle: 'italic', textAlign: 'center', borderLeft: '3px solid var(--primary)' }}>
                    "{data.analise_tom}"
                </div>

                <div className="feedback-section">
                    <h4 style={{ color: '#4ade80', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}><CheckCircle2 size={18} /> Pontos Fortes</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {data.pontos_fortes.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                </div>

                <div className="feedback-section">
                    <h4 style={{ color: '#f43f5e', display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}><AlertTriangle size={18} /> A Melhorar</h4>
                    <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '0.9rem', color: 'var(--text-main)' }}>
                        {data.pontos_melhoria.map((p, i) => <li key={i}>{p}</li>)}
                    </ul>
                </div>

                <div className="feedback-section" style={{ background: 'rgba(var(--primary-rgb), 0.1)', border: '1px solid rgba(var(--primary-rgb), 0.3)' }}>
                    <h4 style={{ color: 'var(--primary)', marginBottom: '8px' }}>💡 Dica de Ouro</h4>
                    <p style={{ margin: 0, fontSize: '0.95rem' }}>{data.dica_de_ouro}</p>
                </div>

                <button className="btn-primary" onClick={onRetry} style={{ width: '100%', marginTop: '10px' }}>
                    Ir para Dashboard
                </button>
            </div>
        </div>
    );
};

const Chat = () => {
    const { targetId } = useParams<{ targetId: string }>();
    const navigate = useNavigate();
    const { profile, targets, addMessageToTarget } = useAppContext();

    const target = targets.find(t => t.id === targetId);

    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [debriefingData, setDebriefingData] = useState<DebriefingResult | null>(null);
    const [isDebriefingLoading, setIsDebriefingLoading] = useState(false);
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

    const currentMoodScore = (() => {
        if (!isTraining) return 0;
        const assistantMessages = target.messages.filter(m => m.role === 'assistant');
        if (assistantMessages.length === 0) return 0;
        const lastMsg = assistantMessages[assistantMessages.length - 1];
        try {
            const parsed = JSON.parse(lastMsg.content);
            return typeof parsed.sentiment_score === 'number' ? parsed.sentiment_score : 0;
        } catch {
            return 0;
        }
    })();

    const handleEndSimulation = async () => {
        if (!profile || !target) return;
        setIsDebriefingLoading(true);
        const result = await generateDebriefing(profile, target.name, target.messages);
        setDebriefingData(result);
        setIsDebriefingLoading(false);
    };

    return (
        <div className="chat-page animate-fade-in">
            {debriefingData && (
                <DebriefingModal
                    data={debriefingData}
                    onClose={() => setDebriefingData(null)}
                    onRetry={() => { setDebriefingData(null); navigate('/dashboard'); }}
                />
            )}

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

            {isTraining && <MoodMeter score={currentMoodScore} />}

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

                {target.messages.map(msg => {
                    let parsedContent: PowerOf3Response | null = null;
                    let trainingContent = msg.content;

                    if (msg.role === 'assistant') {
                        if (!isTraining) {
                            parsedContent = tryParsePowerOf3(msg.content);
                        } else {
                            try {
                                const parsed = JSON.parse(msg.content);
                                trainingContent = parsed.mensagem || msg.content;
                            } catch {
                                // Default back to raw content
                            }
                        }
                    }

                    return (
                        <div key={msg.id} className={`message-bubble-container ${msg.role === 'user' ? 'user' : 'assistant'}`} style={{ width: parsedContent ? '100%' : undefined }}>
                            {parsedContent ? (
                                <PowerOf3Cards data={parsedContent} />
                            ) : (
                                <div className={`message-bubble ${msg.role === 'user' ? 'user-bubble' : 'assistant-bubble'}`}>
                                    {msg.role === 'assistant' ? (
                                        <ReactMarkdown>{trainingContent}</ReactMarkdown>
                                    ) : (
                                        msg.content
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}

                {isTyping && (
                    <div className="message-bubble-container assistant">
                        <div className="message-bubble assistant-bubble typing-indicator">
                            <Loader2 size={20} className="icon-spin" />
                            <span>{isTraining ? 'Digitando...' : 'Pensando na melhor jogada...'}</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />

                {isTraining && hasMessages && !isTyping && (
                    <button
                        className="end-sim-btn shadow-glow"
                        onClick={handleEndSimulation}
                        disabled={isDebriefingLoading}
                    >
                        {isDebriefingLoading ? <><Loader2 size={16} className="icon-spin" style={{ display: 'inline', verticalAlign: '-3px', marginRight: '5px' }} /> Analisando...</> : <><BarChart2 size={16} style={{ display: 'inline', verticalAlign: '-3px', marginRight: '5px' }} /> Encerrar e Analisar</>}
                    </button>
                )}
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
