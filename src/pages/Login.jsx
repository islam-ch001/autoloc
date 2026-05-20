import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, User, Loader2, KeyRound, ArrowLeft } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/LanguageContext';

export default function Login() {
  const { login, signupRequest, signupVerify, signupResend } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();
  const [mode, setMode]         = useState('login'); // 'login' | 'signup' | 'verify'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode]         = useState('');
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);

  // Validation email côté client (cohérente avec le backend)
  const EMAIL_REGEX = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
  const DISPOSABLE = ['10minutemail','mailinator','tempmail','temp-mail','guerrillamail','sharklasers','grr.la','spam4.me','yopmail','throwaway','fakeinbox','trashmail','dispostable','maildrop','getnada','mail.tm','tempr.email','tempinbox','tmpmail','mintemail','spambog','fakemail','jetable','tempemail','disposablemail','wegwerfmail','airmail.cc','inboxbear','mohmal'];
  const TYPOS = { 'gmial.com':'gmail.com','gmai.com':'gmail.com','gmal.com':'gmail.com','gnail.com':'gmail.com','gmaill.com':'gmail.com','gmail.co':'gmail.com','gmail.con':'gmail.com','yaho.com':'yahoo.com','yhaoo.com':'yahoo.com','yahoo.con':'yahoo.com','hotmial.com':'hotmail.com','hotmal.com':'hotmail.com','outlok.com':'outlook.com' };

  const validateEmail = (raw) => {
    const clean = (raw || '').trim().toLowerCase();
    if (!clean) return 'Email requis';
    if (!EMAIL_REGEX.test(clean)) return "Format d'email invalide (ex: nom@exemple.com)";
    const domain = clean.split('@')[1];
    if (DISPOSABLE.some(d => domain.includes(d))) return 'Les emails temporaires ne sont pas autorisés. Utilisez votre vraie adresse.';
    if (TYPOS[domain]) return `Vouliez-vous dire ${clean.split('@')[0]}@${TYPOS[domain]} ?`;
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (mode === 'signup') {
      const emailErr = validateEmail(email);
      if (emailErr) { setError(emailErr); return; }
      if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères'); return; }
      if (!name.trim() || name.trim().length < 2) { setError('Nom invalide (minimum 2 caractères)'); return; }
    }
    if (mode === 'verify') {
      if (!/^\d{6}$/.test(code.trim())) { setError('Le code doit contenir 6 chiffres'); return; }
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signupRequest(name, email, password);
        setMode('verify');
      } else if (mode === 'verify') {
        await signupVerify(email, code);
        navigate('/');
      } else {
        await login(email, password);
        navigate('/');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError(null);
    setResending(true);
    try {
      await signupResend(email);
      setError(null);
      alert('Un nouveau code a été envoyé à votre email');
    } catch (err) { setError(err.message); }
    finally { setResending(false); }
  };

  const isSignup = mode === 'signup';

  return (
    <div style={styles.shell}>
      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.logo}>
          <Car size={32} style={{ color: '#f59e0b' }} />
          <span style={styles.brand}>AutoLoc</span>
        </div>

        {mode !== 'verify' && (
          <div style={styles.tabs}>
            <button type="button" onClick={() => { setMode('login'); setError(null); }}
              style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}>
              {t('auth.login')}
            </button>
            <button type="button" onClick={() => { setMode('signup'); setError(null); }}
              style={{ ...styles.tab, ...(mode === 'signup' ? styles.tabActive : {}) }}>
              {t('auth.signup')}
            </button>
          </div>
        )}

        <p style={styles.subtitle}>
          {mode === 'verify'
            ? <>📧 Un code à 6 chiffres a été envoyé à<br/><strong style={{ color: '#f0f0f5' }}>{email}</strong></>
            : (isSignup ? t('auth.createSpace') : t('auth.welcomeBack'))}
        </p>

        {mode === 'verify' ? (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Code de vérification</label>
              <div style={styles.inputWrap}>
                <KeyRound size={16} style={styles.icon} />
                <input
                  type="text"
                  required
                  maxLength={6}
                  inputMode="numeric"
                  pattern="\d{6}"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  style={{ ...styles.input, letterSpacing: 8, fontSize: 20, fontWeight: 700, textAlign: 'center', fontFamily: 'Courier New, monospace' }}
                  autoFocus
                />
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" disabled={loading || code.length !== 6} style={{ ...styles.button, opacity: (loading || code.length !== 6) ? 0.6 : 1 }}>
              {loading ? <><Loader2 size={16} className="spin" /> Vérification…</> : 'Valider et créer mon compte'}
            </button>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: 12 }}>
              <button type="button" onClick={() => { setMode('signup'); setError(null); setCode(''); }}
                style={{ background: 'none', border: 'none', color: '#707088', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={12} /> Retour
              </button>
              <button type="button" onClick={handleResend} disabled={resending}
                style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontWeight: 600 }}>
                {resending ? 'Envoi…' : 'Renvoyer le code'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: '#707088', textAlign: 'center', margin: '8px 0 0' }}>
              Vérifiez aussi le dossier spam/courrier indésirable
            </p>
          </>
        ) : (
          <>
            {isSignup && (
              <div style={styles.field}>
                <label style={styles.label}>{t('auth.name')}</label>
                <div style={styles.inputWrap}>
                  <User size={16} style={styles.icon} />
                  <input type="text" required value={name} onChange={e => setName(e.target.value)}
                    placeholder="Votre nom" style={styles.input} />
                </div>
              </div>
            )}

            <div style={styles.field}>
              <label style={styles.label}>{t('auth.email')}</label>
              <div style={styles.inputWrap}>
                <Mail size={16} style={styles.icon} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com" style={styles.input} autoComplete="email" />
              </div>
            </div>

            <div style={styles.field}>
              <label style={styles.label}>{t('auth.password')}{isSignup && ' (min. 6 caractères)'}</label>
              <div style={styles.inputWrap}>
                <Lock size={16} style={styles.icon} />
                <input type="password" required minLength={isSignup ? 6 : undefined} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" style={styles.input} autoComplete={isSignup ? 'new-password' : 'current-password'} />
              </div>
            </div>

            {error && <div style={styles.error}>{error}</div>}

            <button type="submit" disabled={loading} style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}>
              {loading
                ? <><Loader2 size={16} className="spin" /> {isSignup ? 'Envoi du code…' : t('auth.signingIn')}</>
                : (isSignup ? 'Recevoir le code par email' : t('auth.signIn'))}
            </button>

            <p style={styles.footer}>
              {isSignup
                ? <>{t('auth.haveAccount')} <a onClick={() => setMode('login')} style={styles.link}>{t('auth.signIn')}</a></>
                : <>{t('auth.noAccount')} <a onClick={() => setMode('signup')} style={styles.link}>{t('auth.signupFree')}</a></>}
            </p>
          </>
        )}
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
