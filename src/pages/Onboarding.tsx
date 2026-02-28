import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppProvider';
import type { Gender } from '../store/AppProvider';
import { Heart } from 'lucide-react';
import './Onboarding.css';

const Onboarding = () => {
    const [name, setName] = useState('');
    const [targetGender, setTargetGender] = useState<Gender>(null);
    const { setProfile } = useAppContext();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (name.trim() && targetGender) {
            setProfile({ name: name.trim(), targetGender });
            navigate('/dashboard');
        }
    };

    return (
        <div className="onboarding-page">
            <div className="glass-panel animate-fade-in onboarding-card">
                <div className="icon-wrapper">
                    <Heart size={48} className="icon-heart" />
                </div>

                <h1 className="text-gradient title">IshTar.AI</h1>
                <p className="subtitle">Seu conselheiro amoroso de bolso.</p>

                <form onSubmit={handleSubmit} className="onboarding-form">
                    <div className="form-group">
                        <label>Como posso te chamar?</label>
                        <input
                            type="text"
                            placeholder="Seu nome"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Você quer ajuda para conquistar:</label>
                        <div className="gender-selector">
                            <button
                                type="button"
                                className={`gender-btn ${targetGender === 'mulher' ? 'active' : ''}`}
                                onClick={() => setTargetGender('mulher')}
                            >
                                <img src="/assets/avatar-woman.png" alt="Mulheres" className="gender-avatar" />
                                <span>Mulheres</span>
                            </button>
                            <button
                                type="button"
                                className={`gender-btn ${targetGender === 'homem' ? 'active' : ''}`}
                                onClick={() => setTargetGender('homem')}
                            >
                                <img src="/assets/avatar-man.png" alt="Homens" className="gender-avatar" />
                                <span>Homens</span>
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn-primary"
                        disabled={!name.trim() || !targetGender}
                        style={{ opacity: (!name.trim() || !targetGender) ? 0.5 : 1, marginTop: '16px' }}
                    >
                        Começar a Consultoria
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Onboarding;
