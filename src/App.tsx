import type { ReactNode } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './store/AppProvider';

// Pages
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import TargetForm from './pages/TargetForm';
import Chat from './pages/Chat';

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { profile } = useAppContext();
  if (!profile) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  const { profile } = useAppContext();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={!profile ? <Onboarding /> : <Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/new-target" element={<ProtectedRoute><TargetForm /></ProtectedRoute>} />
        <Route path="/chat/:targetId" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
