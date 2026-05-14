import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Vehicles from './pages/Vehicles';
import Reservations from './pages/Reservations';
import Clients from './pages/Clients';
import Calendar from './pages/Calendar';
import Returns from './pages/Returns';
import Settings from './pages/Settings';
import './index.css';

function AppShell() {
  const { loading, error, reload } = useApp();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, border: '3px solid var(--border)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <span style={{ color: 'var(--text-3)', fontSize: 14 }}>Connexion à l'API…</span>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
        <div style={{ textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 20, marginBottom: 8 }}>Impossible de joindre l'API</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 20, lineHeight: 1.6 }}>
            Vérifiez que le serveur backend tourne sur <code style={{ color: 'var(--primary)', background: 'var(--surface)', padding: '2px 6px', borderRadius: 4 }}>http://localhost:3001</code>
          </p>
          <p style={{ color: 'var(--danger)', fontSize: 12, marginBottom: 20, background: 'var(--danger-soft)', padding: '8px 12px', borderRadius: 8 }}>{error}</p>
          <button className="btn btn-primary" onClick={reload}>Réessayer</button>
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
          <Route path="/settings"     element={<Settings />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppShell />
      </AppProvider>
    </BrowserRouter>
  );
}
