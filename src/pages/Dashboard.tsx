
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppProvider';
import { Plus, MessageCircle, Heart, LogOut, Trash2, Edit2 } from 'lucide-react';
import avatarWoman from '../assets/avatar-woman.png';
import avatarMan from '../assets/avatar-man.png';
import './Dashboard.css';

const Dashboard = () => {
    const { profile, targets, clearProfile, createTrainingTarget, deleteTarget } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearProfile();
        navigate('/');
    };

    const handleTrainingClick = () => {
        if (!targets.some(t => t.id === 'treino')) {
            createTrainingTarget();
        }
        navigate('/chat/treino');
    };

    const realTargets = targets.filter(t => t.id !== 'treino');

    return (
        <div className="dashboard-page animate-fade-in">
            <header className="dashboard-header glass-panel">
                <div>
                    <p className="welcome-text">Olá, {profile?.name}</p>
                    <h1 className="title-small text-gradient">Seus Alvos</h1>
                </div>
                <div className="profile-icon" onClick={handleLogout} style={{ cursor: 'pointer' }} title="Trocar Perfil">
                    <LogOut size={24} color="var(--primary)" />
                </div>
            </header>

            <main className="dashboard-content">
                {realTargets.length === 0 ? (
                    <div className="empty-state">
                        <Heart size={48} className="empty-icon" />
                        <h3>Nenhuma conquista ainda</h3>
                        <p className="text-secondary">Adicione alguém que você está de olho para o conselheiro começar a te ajudar.</p>
                    </div>
                ) : (
                    <div className="target-list">
                        {realTargets.map(target => (
                            <div
                                key={target.id}
                                className="target-card glass-panel"
                                onClick={() => navigate(`/chat/${target.id}`)}
                            >
                                <div className="target-info">
                                    <h3>{target.name}</h3>
                                    <p className="text-secondary truncate">{target.characteristics}</p>
                                </div>
                                <div className="target-action" style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/edit-target/${target.id}`); }}
                                        style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '5px', display: 'flex' }}
                                        title="Editar"
                                    >
                                        <Edit2 size={18} />
                                    </button>
                                    <button
                                        onClick={(e) => { e.stopPropagation(); if (confirm('Tem certeza que deseja excluir este alvo?')) deleteTarget(target.id); }}
                                        style={{ background: 'transparent', border: 'none', color: '#f43f5e', cursor: 'pointer', padding: '5px', display: 'flex' }}
                                        title="Excluir"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <MessageCircle size={24} color="var(--primary)" style={{ marginLeft: '5px' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                <div className="section-title" style={{ marginTop: '2rem', marginBottom: '1rem' }}>
                    <h2 className="title-small text-gradient" style={{ fontSize: '1.2rem' }}>Vamos praticar?</h2>
                    <p className="text-secondary" style={{ fontSize: '0.85rem' }}>A inteligência artificial assumirá o papel de uma pessoa real.</p>
                </div>

                <div
                    className="target-card glass-panel training-card"
                    onClick={handleTrainingClick}
                    style={{
                        border: '1px solid var(--primary)',
                        background: 'rgba(var(--primary-rgb), 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '15px',
                        padding: '15px'
                    }}
                >
                    <img
                        src={profile?.targetGender === 'mulher' ? avatarWoman : avatarMan}
                        alt="Avatar Simulador"
                        style={{ width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--primary)' }}
                    />
                    <div className="target-info" style={{ flex: 1 }}>
                        <h3>{profile?.targetGender === 'mulher' ? 'Garota Oculta' : 'Garoto Oculto'}</h3>
                        <p className="text-secondary truncate" style={{ fontStyle: 'italic', color: 'var(--text-light)' }}>
                            Oi {profile?.name}, vamos conversar...
                        </p>
                    </div>
                    <div className="target-action">
                        <div style={{ background: 'var(--primary)', borderRadius: '50%', width: '10px', height: '10px', marginRight: '10px', boxShadow: '0 0 8px var(--primary)' }}></div>
                        <MessageCircle size={24} color="var(--primary)" />
                    </div>
                </div>
            </main>

            <button className="fab-button shadow-glow" onClick={() => navigate('/new-target')}>
                <Plus size={28} />
            </button>
        </div>
    );
};

export default Dashboard;
