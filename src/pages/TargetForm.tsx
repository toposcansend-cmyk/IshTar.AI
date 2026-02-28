import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppProvider';
import { ArrowLeft, Target, Sparkles } from 'lucide-react';
import './TargetForm.css';

const TargetForm = () => {
    const [name, setName] = useState('');
    const [characteristics, setCharacteristics] = useState('');
    const [meetContext, setMeetContext] = useState('');

    const { addTarget } = useAppContext();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && characteristics.trim() && meetContext.trim()) {
            addTarget({
                name: name.trim(),
                characteristics: characteristics.trim(),
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
                        <label>Como é a personalidade dela/dele?</label>
                        <textarea
                            rows={3}
                            placeholder="Ex: Extrovertida, gosta de gatos, adora filme de terror e tem um humor peculiar..."
                            value={characteristics}
                            onChange={(e) => setCharacteristics(e.target.value)}
                            required
                        />
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
                        disabled={!name.trim() || !characteristics.trim() || !meetContext.trim()}
                    >
                        <Sparkles size={20} /> Adicionar e Começar
                    </button>
                </form>
            </main>
        </div>
    );
};

export default TargetForm;
