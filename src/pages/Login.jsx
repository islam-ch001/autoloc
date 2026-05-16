import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]         = useState('login'); // 'login' | 'bootstrap'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [checking, setChecking] = useState(true);

  // À l'arrivée, vérifier s'il faut bootstrap (aucun admin n'existe)
  useEffect(() => {
    fetch(`${BASE}/auth/bootstrap-status`)
      .then(r => r.json())
      .then(d => { if (d.needsBootstrap) setMode('bootstrap'); })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'bootstrap') {
        if (password.length < 6) throw new Error('Le mot de passe doit faire au moins 6 caractères');
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div style={styles.shell}>
        <Loader2 size={32} className="spin" style={{ color: '#f59e0b' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 0.8s linear infinite; }`}</style>
      </div>
    );
  }

  const isBootstrap = mode === 'bootstrap';

  return (
    <div style={styles.shell}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.logo}>
          <Car size={32} style={{ color: '#f59e0b' }} />
          <span style={styles.brand}>AutoLoc</span>
        </div>
        <h1 style={styles.title}>{isBootstrap ? 'Création du compte admin' : 'Connexion'}</h1>
        <p style={styles.subtitle}>
          {isBootstrap
            ? '🎖️ Première utilisation — créez votre compte administrateur.'
            : 'Connectez-vous à votre espace AutoLoc.'}
        </p>

        {isBootstrap && (
          <div style={styles.field}>
            <label style={styles.label}>Nom complet</label>
            <div style={styles.inputWrap}>
              <User size={16} style={styles.icon} />
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                placeholder="Votre nom" style={styles.input} />
            </div>
          </div>
        )}

        <div style={styles.field}>
          <label style={styles.label}>Email</label>
          <div style={styles.inputWrap}>
            <Mail size={16} style={styles.icon} />
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="vous@exemple.com" style={styles.input} autoComplete="email" />
          </div>
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Mot de passe{isBootstrap && ' (min. 6 caractères)'}</label>
          <div style={styles.inputWrap}>
            <Lock size={16} style={styles.icon} />
            <input type="password" required minLength={isBootstrap ? 6 : undefined} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={styles.input} autoComplete={isBootstrap ? 'new-password' : 'current-password'} />
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}>
          {loading ? <><Loader2 size={16} className="spin" /> {isBootstrap ? 'Création…' : 'Connexion…'}</> : (isBootstrap ? 'Créer mon compte admin' : 'Se connecter')}
        </button>

        {!isBootstrap && (
          <p style={styles.footer}>
            🔒 Inscription réservée. Contactez votre administrateur pour obtenir un compte.
          </p>
        )}
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 0.8s linear infinite; }`}</style>
    </div>
  );
}

const styles = {
  shell: { minHeight: '100vh', background: 'radial-gradient(circle at 20% 20%, #1a1a28 0%, #0a0a0f 60%)', display: 'grid', placeItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 420, background: '#12121a', border: '1px solid #2a2a3e', borderRadius: 16, padding: 36, display: 'flex', flexDirection: 'column', gap: 18, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 8 },
  brand: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, color: '#f59e0b', letterSpacing: -0.5 },
  title: { margin: 0, fontSize: 22, fontWeight: 700, color: '#f0f0f5', textAlign: 'center' },
  subtitle: { margin: 0, fontSize: 13, color: '#707088', textAlign: 'center', marginBottom: 8 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: '#b0b0c0' },
  inputWrap: { position: 'relative' },
  icon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#707088' },
  input: { width: '100%', padding: '11px 14px 11px 38px', background: '#0a0a0f', border: '1px solid #2a2a3e', borderRadius: 10, color: '#f0f0f5', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  button: { padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#f59e0b', color: '#0a0a0f', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 6 },
  error: { padding: '10px 12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: 10, fontSize: 13 },
  footer: { textAlign: 'center', fontSize: 12, color: '#707088', margin: 0, paddingTop: 4 },
};
