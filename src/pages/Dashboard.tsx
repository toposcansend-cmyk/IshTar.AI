
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store/AppProvider';
import { Plus, MessageCircle, Heart, LogOut } from 'lucide-react';
import './Dashboard.css';

const Dashboard = () => {
    const { profile, targets, clearProfile } = useAppContext();
    const navigate = useNavigate();

    const handleLogout = () => {
        clearProfile();
        navigate('/');
    };

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
                {targets.length === 0 ? (
                    <div className="empty-state">
                        <Heart size={48} className="empty-icon" />
                        <h3>Nenhuma conquista ainda</h3>
                        <p className="text-secondary">Adicione alguém que você está de olho para o conselheiro começar a te ajudar.</p>
                    </div>
                ) : (
                    <div className="target-list">
                        {targets.map(target => (
                            <div
                                key={target.id}
                                className="target-card glass-panel"
                                onClick={() => navigate(`/chat/${target.id}`)}
                            >
                                <div className="target-info">
                                    <h3>{target.name}</h3>
                                    <p className="text-secondary truncate">{target.characteristics}</p>
                                </div>
                                <div className="target-action">
                                    <MessageCircle size={24} color="var(--primary)" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            <button className="fab-button shadow-glow" onClick={() => navigate('/new-target')}>
                <Plus size={28} />
            </button>
        </div>
    );
};

export default Dashboard;
