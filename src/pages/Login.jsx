import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, User, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode]         = useState('login'); // 'login' | 'signup'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === 'signup') {
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

  const isSignup = mode === 'signup';

  return (
    <div style={styles.shell}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.logo}>
          <Car size={32} style={{ color: '#f59e0b' }} />
          <span style={styles.brand}>AutoLoc</span>
        </div>

        <div style={styles.tabs}>
          <button type="button" onClick={() => { setMode('login'); setError(null); }}
            style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}>
            Connexion
          </button>
          <button type="button" onClick={() => { setMode('signup'); setError(null); }}
            style={{ ...styles.tab, ...(mode === 'signup' ? styles.tabActive : {}) }}>
            Inscription
          </button>
        </div>

        <p style={styles.subtitle}>
          {isSignup
            ? '🚀 Créez votre espace AutoLoc privé — votre flotte, vos clients, isolés.'
            : 'Connectez-vous à votre espace privé.'}
        </p>

        {isSignup && (
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
          <label style={styles.label}>Mot de passe{isSignup && ' (min. 6 caractères)'}</label>
          <div style={styles.inputWrap}>
            <Lock size={16} style={styles.icon} />
            <input type="password" required minLength={isSignup ? 6 : undefined} value={password} onChange={e => setPassword(e.target.value)}
              placeholder="••••••••" style={styles.input} autoComplete={isSignup ? 'new-password' : 'current-password'} />
          </div>
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}>
          {loading ? <><Loader2 size={16} className="spin" /> {isSignup ? 'Création…' : 'Connexion…'}</> : (isSignup ? 'Créer mon compte' : 'Se connecter')}
        </button>

        <p style={styles.footer}>
          {isSignup
            ? <>Déjà un compte ? <a onClick={() => setMode('login')} style={styles.link}>Se connecter</a></>
            : <>Pas encore de compte ? <a onClick={() => setMode('signup')} style={styles.link}>S'inscrire gratuitement</a></>}
        </p>
      </form>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 0.8s linear infinite; }`}</style>
    </div>
  );
}

const styles = {
  shell: { minHeight: '100vh', background: 'radial-gradient(circle at 20% 20%, #1a1a28 0%, #0a0a0f 60%)', display: 'grid', placeItems: 'center', padding: 20 },
  card: { width: '100%', maxWidth: 420, background: '#12121a', border: '1px solid #2a2a3e', borderRadius: 16, padding: 36, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 4 },
  brand: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, color: '#f59e0b', letterSpacing: -0.5 },
  tabs: { display: 'flex', background: '#0a0a0f', padding: 4, borderRadius: 10, border: '1px solid #2a2a3e' },
  tab: { flex: 1, padding: '8px 12px', background: 'transparent', border: 'none', color: '#707088', fontWeight: 600, fontSize: 13, cursor: 'pointer', borderRadius: 7 },
  tabActive: { background: '#f59e0b', color: '#0a0a0f' },
  subtitle: { margin: 0, fontSize: 13, color: '#707088', textAlign: 'center', marginBottom: 4 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: '#b0b0c0' },
  inputWrap: { position: 'relative' },
  icon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#707088' },
  input: { width: '100%', padding: '11px 14px 11px 38px', background: '#0a0a0f', border: '1px solid #2a2a3e', borderRadius: 10, color: '#f0f0f5', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  button: { padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#f59e0b', color: '#0a0a0f', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  error: { padding: '10px 12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: 10, fontSize: 13 },
  footer: { textAlign: 'center', fontSize: 12, color: '#707088', margin: 0, paddingTop: 4 },
  link: { color: '#f59e0b', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' },
};
