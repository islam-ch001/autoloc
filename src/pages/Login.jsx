import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, User, Loader2, KeyRound, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/LanguageContext';

export default function Login() {
  const { login, signupRequest, signupVerify, signupResend, forgotPassword, resetPassword } = useAuth();
  const { t } = useT();
  const navigate = useNavigate();
  const [mode, setMode]         = useState('login'); // 'login' | 'signup' | 'verify' | 'forgot' | 'reset'
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode]         = useState('');
  const [error, setError]       = useState(null);
  const [success, setSuccess]   = useState(null);
  const [loading, setLoading]   = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

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
    setSuccess(null);
    if (mode === 'signup') {
      const emailErr = validateEmail(email);
      if (emailErr) { setError(emailErr); return; }
      if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères'); return; }
      if (password !== confirmPassword) { setError('Les deux mots de passe ne correspondent pas'); return; }
      if (!name.trim() || name.trim().length < 2) { setError('Nom invalide (minimum 2 caractères)'); return; }
    }
    if (mode === 'verify' || mode === 'reset') {
      if (!/^\d{6}$/.test(code.trim())) { setError('Le code doit contenir 6 chiffres'); return; }
    }
    if (mode === 'reset') {
      if (password.length < 6) { setError('Le nouveau mot de passe doit faire au moins 6 caractères'); return; }
      if (password !== confirmPassword) { setError('Les deux mots de passe ne correspondent pas'); return; }
    }
    setLoading(true);
    try {
      if (mode === 'signup') {
        await signupRequest(name, email, password);
        setMode('verify');
      } else if (mode === 'verify') {
        await signupVerify(email, code);
        navigate('/');
      } else if (mode === 'forgot') {
        await forgotPassword(email);
        setSuccess('Si cet email existe, un code de réinitialisation a été envoyé. Vérifiez votre boîte mail (et le dossier spam).');
        setMode('reset');
        setCode('');
        setPassword('');
        setConfirmPassword('');
      } else if (mode === 'reset') {
        await resetPassword(email, code, password);
        setSuccess('Mot de passe modifié avec succès. Vous pouvez maintenant vous connecter.');
        setMode('login');
        setCode('');
        setPassword('');
        setConfirmPassword('');
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

        {(mode === 'login' || mode === 'signup') && (
          <div style={styles.tabs}>
            <button type="button" onClick={() => { setMode('login'); setError(null); setSuccess(null); setConfirmPassword(''); }}
              style={{ ...styles.tab, ...(mode === 'login' ? styles.tabActive : {}) }}>
              {t('auth.login')}
            </button>
            <button type="button" onClick={() => { setMode('signup'); setError(null); setSuccess(null); setConfirmPassword(''); }}
              style={{ ...styles.tab, ...(mode === 'signup' ? styles.tabActive : {}) }}>
              {t('auth.signup')}
            </button>
          </div>
        )}

        <p style={styles.subtitle}>
          {mode === 'verify'
            ? <>📧 Un code à 6 chiffres a été envoyé à<br/><strong style={{ color: '#f0f0f5' }}>{email}</strong></>
            : mode === 'forgot'
              ? <>🔐 Saisissez votre email — nous vous enverrons un code de réinitialisation.</>
              : mode === 'reset'
                ? <>🔑 Saisissez le code reçu par email et votre <strong style={{ color: '#f0f0f5' }}>nouveau mot de passe</strong>.</>
                : (isSignup ? t('auth.createSpace') : t('auth.welcomeBack'))}
        </p>

        {success && <div style={{ ...styles.error, background: 'rgba(16,185,129,0.12)', borderColor: 'rgba(16,185,129,0.3)', color: '#10b981' }}>{success}</div>}

        {mode === 'forgot' ? (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Email du compte</label>
              <div style={styles.inputWrap}>
                <Mail size={16} style={styles.icon} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com" style={styles.input} autoFocus />
              </div>
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button type="submit" disabled={loading || !email} style={{ ...styles.button, opacity: (loading || !email) ? 0.6 : 1 }}>
              {loading ? <><Loader2 size={16} className="spin" /> Envoi…</> : 'Recevoir le code par email'}
            </button>
            <button type="button" onClick={() => { setMode('login'); setError(null); setSuccess(null); }}
              style={{ background: 'none', border: 'none', color: '#707088', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 12 }}>
              <ArrowLeft size={12} /> Retour à la connexion
            </button>
          </>
        ) : mode === 'reset' ? (
          <>
            <div style={styles.field}>
              <label style={styles.label}>Email du compte</label>
              <div style={styles.inputWrap}>
                <Mail size={16} style={styles.icon} />
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="vous@exemple.com" style={styles.input} />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Code reçu par email</label>
              <div style={styles.inputWrap}>
                <KeyRound size={16} style={styles.icon} />
                <input
                  type="text" required maxLength={6} inputMode="numeric" pattern="\d{6}"
                  value={code}
                  onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="123456"
                  style={{ ...styles.input, letterSpacing: 8, fontSize: 20, fontWeight: 700, textAlign: 'center', fontFamily: 'Courier New, monospace' }}
                  autoFocus={!!email}
                />
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Nouveau mot de passe (min. 6 caractères)</label>
              <div style={styles.inputWrap}>
                <Lock size={16} style={styles.icon} />
                <input type={showPassword ? 'text' : 'password'} required minLength={6} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" style={{ ...styles.input, paddingRight: 40 }} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  title={showPassword ? 'Masquer' : 'Afficher'}
                  style={styles.eyeBtn}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Confirmer le mot de passe</label>
              <div style={styles.inputWrap}>
                <Lock size={16} style={styles.icon} />
                <input type={showPassword ? 'text' : 'password'} required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" style={{
                    ...styles.input, paddingRight: 40,
                    borderColor: confirmPassword && confirmPassword !== password ? 'rgba(239,68,68,0.5)' : (confirmPassword && confirmPassword === password ? 'rgba(16,185,129,0.5)' : undefined),
                  }} autoComplete="new-password" />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  title={showPassword ? 'Masquer' : 'Afficher'}
                  style={styles.eyeBtn}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {confirmPassword && confirmPassword !== password && (
                <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Les mots de passe ne correspondent pas</div>
              )}
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button type="submit" disabled={loading || code.length !== 6 || password.length < 6 || password !== confirmPassword}
              style={{ ...styles.button, opacity: (loading || code.length !== 6 || password.length < 6 || password !== confirmPassword) ? 0.6 : 1 }}>
              {loading ? <><Loader2 size={16} className="spin" /> Réinitialisation…</> : 'Changer mon mot de passe'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: 12 }}>
              <button type="button" onClick={() => { setMode('login'); setError(null); setSuccess(null); setCode(''); setPassword(''); }}
                style={{ background: 'none', border: 'none', color: '#707088', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={12} /> Retour
              </button>
              <button type="button" onClick={async () => {
                try { await forgotPassword(email); setSuccess('Nouveau code envoyé !'); } catch (e) { setError(e.message); }
              }} style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontWeight: 600 }}>
                Renvoyer le code
              </button>
            </div>
          </>
        ) : mode === 'verify' ? (
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
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <label style={styles.label}>{t('auth.password')}{isSignup && ' (min. 6 caractères)'}</label>
                {!isSignup && (
                  <button type="button" onClick={() => { setMode('forgot'); setError(null); setSuccess(null); setPassword(''); }}
                    style={{ background: 'none', border: 'none', color: '#f59e0b', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: 0 }}>
                    Mot de passe oublié ?
                  </button>
                )}
              </div>
              <div style={styles.inputWrap}>
                <Lock size={16} style={styles.icon} />
                <input type={showPassword ? 'text' : 'password'} required minLength={isSignup ? 6 : undefined} value={password} onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••" style={{ ...styles.input, paddingRight: 40 }} autoComplete={isSignup ? 'new-password' : 'current-password'} />
                <button type="button" onClick={() => setShowPassword(s => !s)}
                  title={showPassword ? 'Masquer' : 'Afficher'}
                  style={styles.eyeBtn}>
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {isSignup && (
              <div style={styles.field}>
                <label style={styles.label}>Confirmer le mot de passe</label>
                <div style={styles.inputWrap}>
                  <Lock size={16} style={styles.icon} />
                  <input type={showPassword ? 'text' : 'password'} required minLength={6} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="••••••••" style={{
                      ...styles.input, paddingRight: 40,
                      borderColor: confirmPassword && confirmPassword !== password ? 'rgba(239,68,68,0.5)' : (confirmPassword && confirmPassword === password ? 'rgba(16,185,129,0.5)' : undefined),
                    }} autoComplete="new-password" />
                  <button type="button" onClick={() => setShowPassword(s => !s)}
                    title={showPassword ? 'Masquer' : 'Afficher'}
                    style={styles.eyeBtn}>
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {confirmPassword && confirmPassword !== password && (
                  <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>Les mots de passe ne correspondent pas</div>
                )}
              </div>
            )}

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
  eyeBtn: {
    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: '#707088', padding: 6, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  input: { width: '100%', padding: '11px 14px 11px 38px', background: '#0a0a0f', border: '1px solid #2a2a3e', borderRadius: 10, color: '#f0f0f5', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  button: { padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: '#f59e0b', color: '#0a0a0f', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  error: { padding: '10px 12px', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.25)', color: '#ef4444', borderRadius: 10, fontSize: 13 },
  footer: { textAlign: 'center', fontSize: 12, color: '#707088', margin: 0, paddingTop: 4 },
  link: { color: '#f59e0b', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' },
};
