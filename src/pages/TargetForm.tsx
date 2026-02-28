import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppProvider';
import { ArrowLeft, Target, Sparkles } from 'lucide-react';
import './TargetForm.css';

const TargetForm = () => {
    const [name, setName] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [difficulty, setDifficulty] = useState<string>('Média');
    const [meetContext, setMeetContext] = useState('');

    const { addTarget } = useAppContext();
    const navigate = useNavigate();

    const VIBE_TAGS = ['Geek', 'Festeira', 'Introvertida', 'Sarcástica', 'Workaholic', 'Esportista', 'Romântica', 'Padrãozinho'];
    const DIFFICULTIES = ['Fácil', 'Média', 'Hardcore'];

    const toggleTag = (tag: string) => {
        if (selectedTags.includes(tag)) {
            setSelectedTags(selectedTags.filter(t => t !== tag));
        } else {
            if (selectedTags.length < 3) {
                setSelectedTags([...selectedTags, tag]);
            }
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && selectedTags.length > 0 && meetContext.trim()) {
            const characteristics = `Vibe: ${selectedTags.join(', ')}. Nível: ${difficulty}.`;
            addTarget({
                name: name.trim(),
                characteristics,
                tags: selectedTags,
                difficulty,
                meetContext: meetContext.trim()
            });
            navigate('/dashboard');
        }
    };

    return (
        <div className="form-page animate-fade-in">
            <header className="form-header glass-panel">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h1 className="title-small">Novo Alvo</h1>
                <div style={{ width: 40 }} /> {/* Spacer */}
            </header>

            <main className="form-content">
                <div className="icon-wrapper mx-auto">
                    <Target size={40} className="icon-target" />
                </div>
                <p className="text-center text-secondary mb-6 mt-2">
                    Me conte um pouco sobre a pessoa. Quanto mais detalhes, melhores serão os meus conselhos!
                </p>

                <form onSubmit={handleSubmit} className="target-form">
                    <div className="form-group">
                        <label>Qual o nome da pessoa?</label>
                        <input
                            type="text"
                            placeholder="Ex: Maria, João..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Vibe & Personalidade (Máx 3)</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                            {VIBE_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    style={{
                                        padding: '6px 12px',
                                        borderRadius: '20px',
                                        border: `1px solid ${selectedTags.includes(tag) ? 'var(--primary)' : 'rgba(255,255,255,0.2)'}`,
                                        background: selectedTags.includes(tag) ? 'var(--primary)' : 'transparent',
                                        color: selectedTags.includes(tag) ? '#fff' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        transition: 'all 0.2s',
                                        fontSize: '0.85rem'
                                    }}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label>Dificuldade</label>
                        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                            {DIFFICULTIES.map(diff => (
                                <button
                                    key={diff}
                                    type="button"
                                    onClick={() => setDifficulty(diff)}
                                    style={{
                                        flex: 1,
                                        padding: '10px',
                                        borderRadius: '8px',
                                        border: `2px solid ${difficulty === diff ? 'var(--primary)' : 'rgba(255,255,255,0.1)'}`,
                                        background: difficulty === diff ? 'rgba(var(--primary-rgb), 0.1)' : 'rgba(0,0,0,0.2)',
                                        color: difficulty === diff ? 'var(--primary)' : 'var(--text-secondary)',
                                        cursor: 'pointer',
                                        fontWeight: difficulty === diff ? 'bold' : 'normal',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    {diff === 'Fácil' && '🟢 '}
                                    {diff === 'Média' && '🟡 '}
                                    {diff === 'Hardcore' && '🔴 '}
                                    {diff}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Como vocês se conheceram?</label>
                        <textarea
                            rows={2}
                            placeholder="Ex: No tinder, na faculdade, barzinho de sexta..."
                            value={meetContext}
                            onChange={(e) => setMeetContext(e.target.value)}
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn-primary form-submit"
                        disabled={!name.trim() || selectedTags.length === 0 || !meetContext.trim()}
                        style={{ marginTop: '1.5rem' }}
                    >
                        <Sparkles size={20} /> Adicionar e Começar
                    </button>
                </form>
            </main>
        </div>
    );
};

export default TargetForm;
