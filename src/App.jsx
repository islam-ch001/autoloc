import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Reservations from './pages/Reservations';
import Clients from './pages/Clients';
import Calendar from './pages/Calendar';
import Returns from './pages/Returns';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Users from './pages/Users';
import './index.css';

function FullScreenLoader({ text = 'Chargement…' }) {
  return (
    <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: '#0a0a0f' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: '#f59e0b', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: -1 }}>🚗 AutoLoc</div>
        <div style={{ width: 44, height: 44, border: '3px solid #2a2a3e', borderTopColor: '#f59e0b', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: '#b0b0c0', fontSize: 14 }}>{text}</span>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullScreenLoader text="Vérification de la session…" />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}

function AppShell() {
  const { loading, error, reload } = useApp();

  if (loading) return <FullScreenLoader text="Chargement des données…" />;

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: '#0a0a0f' }}>
        <div style={{ textAlign: 'center', maxWidth: 420, padding: '0 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, marginBottom: 8, color: '#f0f0f5' }}>Impossible de joindre l'API</h2>
          <p style={{ color: '#b0b0c0', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>Le serveur backend est peut-être en démarrage. Attendez 30 secondes et réessayez.</p>
          <p style={{ color: '#ef4444', fontSize: 12, marginBottom: 20, background: 'rgba(239,68,68,0.12)', padding: '8px 12px', borderRadius: 8 }}>{error}</p>
          <button onClick={reload} style={{ background: '#f59e0b', color: '#000', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/"             element={<Dashboard />} />
          <Route path="/vehicles"     element={<Vehicles />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/clients"      element={<Clients />} />
          <Route path="/calendar"     element={<Calendar />} />
          <Route path="/returns"      element={<Returns />} />
          <Route path="/users"        element={<Users />} />
          <Route path="/settings"     element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/*" element={
            <RequireAuth>
              <AppProvider>
                <AppShell />
              </AppProvider>
            </RequireAuth>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
