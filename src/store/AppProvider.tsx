import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export type Gender = 'homem' | 'mulher' | null;

export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Target {
  id: string;
  name: string;
  characteristics: string; // Mantido para compatibilidade com a UI e descritivo
  tags?: string[];
  difficulty?: string;
  meetContext: string;
  messages: Message[];
}

export interface UserProfile {
  name: string;
  targetGender: Gender;
}

interface AppContextType {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  clearProfile: () => void;
  targets: Target[];
  addTarget: (target: Omit<Target, 'id' | 'messages'>) => void;
  updateTarget: (id: string, targetData: Partial<Target>) => void;
  deleteTarget: (id: string) => void;
  createTrainingTarget: () => void;
  addMessageToTarget: (targetId: string, message: Message) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [profile, setProfileState] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('love_counselor_profile');
    return saved ? JSON.parse(saved) : null;
  });

  const [targets, setTargetsState] = useState<Target[]>(() => {
    const saved = localStorage.getItem('love_counselor_targets');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    if (profile) localStorage.setItem('love_counselor_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('love_counselor_targets', JSON.stringify(targets));
  }, [targets]);

  const setProfile = (newProfile: UserProfile | null) => {
    setProfileState(newProfile);
  };

  const clearProfile = () => {
    setProfileState(null);
    localStorage.removeItem('love_counselor_profile');
  };

  const addTarget = (targetData: Omit<Target, 'id' | 'messages'>) => {
    const newTarget: Target = {
      ...targetData,
      id: Date.now().toString(),
      messages: []
    };
    setTargetsState(prev => [...prev, newTarget]);
  };

  const updateTarget = (id: string, targetData: Partial<Target>) => {
    setTargetsState(prev => prev.map(t => t.id === id ? { ...t, ...targetData } : t));
  };

  const deleteTarget = (id: string) => {
    setTargetsState(prev => prev.filter(t => t.id !== id));
  };

  const createTrainingTarget = () => {
    if (!profile) return;
    if (targets.some(t => t.id === 'treino')) return;

    const isWoman = profile.targetGender === 'mulher';
    const newTarget: Target = {
      id: 'treino',
      name: isWoman ? 'Simulador (Mulher)' : 'Simulador (Homem)',
      characteristics: 'Este é um ambiente seguro. Aja como a pessoa que o usuário deseja conquistar para que ele possa treinar as falas antes de enviar na vida real.',
      meetContext: 'Nos conhecemos através do simulador de treinamento do app IshTar.AI.',
      messages: []
    };
    setTargetsState(prev => [...prev, newTarget]);
  };

  const addMessageToTarget = (targetId: string, message: Message) => {
    setTargetsState(prev => prev.map(t => {
      if (t.id === targetId) {
        return { ...t, messages: [...t.messages, message] };
      }
      return t;
    }));
  };

  return (
    <AppContext.Provider value={{ profile, setProfile, clearProfile, targets, addTarget, updateTarget, deleteTarget, createTrainingTarget, addMessageToTarget }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
