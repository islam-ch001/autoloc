import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SettingsProvider } from './context/SettingsContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Reservations from './pages/Reservations';
import Clients from './pages/Clients';
import Calendar from './pages/Calendar';
import Returns from './pages/Returns';
import Maintenance from './pages/Maintenance';
import Settings from './pages/Settings';
import Admin from './pages/Admin';
import SubscriptionRequired from './pages/SubscriptionRequired';
import Login from './pages/Login';
import './index.css';

function FullScreenLoader({ text = 'Chargement…' }) {
  return (
    <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
        <div style={{ fontSize: 36, fontWeight: 800, color: 'var(--primary)', fontFamily: 'Space Grotesk, sans-serif', letterSpacing: -1 }}>🚗 AutoLoc</div>
        <div style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
        <span style={{ color: 'var(--text-2)', fontSize: 14 }}>{text}</span>
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

  // Vérifier l'abonnement (super-admin bypassé) — 'active' ou 'trial' valides
  const validStatus = user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial';
  const isSubActive = user.isSuperAdmin
    || (validStatus
        && user.subscriptionEnd
        && new Date(user.subscriptionEnd) >= new Date());
  if (!isSubActive) return <SubscriptionRequired />;

  return children;
}

function TrialBanner() {
  const { user } = useAuth();
  if (!user || user.isSuperAdmin || user.subscriptionStatus !== 'trial' || !user.subscriptionEnd) return null;
  const daysLeft = Math.ceil((new Date(user.subscriptionEnd) - new Date()) / 86400000);
  if (daysLeft <= 0) return null;
  return (
    <div style={{
      padding: '10px 14px',
      background: 'linear-gradient(90deg, rgba(245,158,11,0.15), rgba(245,158,11,0.05))',
      border: '1px solid rgba(245,158,11,0.3)',
      borderRadius: 10,
      marginBottom: 16,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
      fontSize: 13,
    }}>
      <div style={{ color: 'var(--text-2)' }}>
        🎁 <strong style={{ color: 'var(--primary)' }}>Essai gratuit</strong> · Il vous reste <strong>{daysLeft} jour{daysLeft > 1 ? 's' : ''}</strong>
      </div>
      <a href={`https://wa.me/213554214999?text=${encodeURIComponent(`Bonjour, je souhaite activer mon abonnement AutoLoc.\nCompte: ${user.email}\nNom: ${user.name}`)}`}
         target="_blank" rel="noopener noreferrer"
         style={{ padding: '6px 12px', background: '#25D366', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 12, fontWeight: 700 }}>
        💬 Contacter l'administrateur
      </a>
    </div>
  );
}

function AppShell() {
  const { loading, error, reload } = useApp();

  if (loading) return <FullScreenLoader text="Chargement des données…" />;

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', maxWidth: 420, padding: '0 20px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, marginBottom: 8, color: 'var(--text)' }}>Impossible de joindre l'API</h2>
          <p style={{ color: 'var(--text-2)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>Le serveur backend est peut-être en démarrage. Attendez 30 secondes et réessayez.</p>
          <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 20, background: 'var(--danger-soft)', padding: '8px 12px', borderRadius: 8 }}>{error}</p>
          <button onClick={reload} style={{ background: 'var(--primary)', color: '#0a0a0f', border: 'none', padding: '10px 24px', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <TrialBanner />
        <Routes>
          <Route path="/"             element={<Dashboard />} />
          <Route path="/vehicles"     element={<Vehicles />} />
          <Route path="/reservations" element={<Reservations />} />
          <Route path="/clients"      element={<Clients />} />
          <Route path="/calendar"     element={<Calendar />} />
          <Route path="/returns"      element={<Returns />} />
          <Route path="/maintenance"  element={<Maintenance />} />
          <Route path="/admin"        element={<Admin />} />
          <Route path="/settings"     element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <LanguageProvider>
      <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/*" element={
            <RequireAuth>
              <SettingsProvider>
                <AppProvider>
                  <AppShell />
                </AppProvider>
              </SettingsProvider>
            </RequireAuth>
          } />
        </Routes>
      </AuthProvider>
      </ThemeProvider>
      </LanguageProvider>
    </BrowserRouter>
  );
}
