import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, User, Loader2, KeyRound, ArrowLeft, Eye, EyeOff, Moon, Sun, Download, ShieldCheck, Cloud, Gauge } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useT } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const WINDOWS_DOWNLOAD_URL = 'https://github.com/islam-ch001/autoloc/releases/download/autoloc-windows-online-2026-05-20/AutoLoc-Windows-Portable.zip';

export default function Login() {
  const { login, signupRequest, signupVerify, signupResend, forgotPassword, resetPassword } = useAuth();
  const { t } = useT();
  const { theme, toggle } = useTheme();
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
      <button
        type="button"
        onClick={toggle}
        title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
        style={styles.themeButton}
      >
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        <span>{theme === 'dark' ? 'Clair' : 'Sombre'}</span>
      </button>
      <div style={styles.stage}>
        <section style={styles.heroPanel}>
          <div style={styles.heroTopline}>
            <span style={styles.heroDot} />
            AutoLoc Cloud
          </div>
          <h1 style={styles.heroTitle}>Pilotez votre agence de location depuis le web ou votre PC.</h1>
          <p style={styles.heroText}>
            Reservations, clients, vehicules, contrats et acces utilisateurs restent synchronises avec la base en ligne.
          </p>
          <div style={styles.heroActions}>
            <a href={WINDOWS_DOWNLOAD_URL} style={styles.downloadButton}>
              <Download size={17} />
              Telecharger l'app Windows
            </a>
            <span style={styles.downloadMeta}>ZIP portable - connecte a la base en ligne</span>
          </div>
          <div style={styles.featureGrid}>
            <div style={styles.featureItem}><ShieldCheck size={18} /><span>Acces controle</span></div>
            <div style={styles.featureItem}><Cloud size={18} /><span>Donnees en ligne</span></div>
            <div style={styles.featureItem}><Gauge size={18} /><span>Gestion rapide</span></div>
          </div>
          <div style={styles.carPlate}>
            <div style={styles.carLine} />
            <div style={styles.carShape}>
              <Car size={64} />
            </div>
            <div style={styles.plateText}>AUTOLOC DZ</div>
          </div>
        </section>

      <form onSubmit={handleSubmit} style={styles.card}>
        <div style={styles.logo}>
          <Car size={32} style={{ color: 'var(--primary)' }} />
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
            ? <>📧 Un code à 6 chiffres a été envoyé à<br/><strong style={{ color: 'var(--text)' }}>{email}</strong></>
            : mode === 'forgot'
              ? <>🔐 Saisissez votre email — nous vous enverrons un code de réinitialisation.</>
              : mode === 'reset'
                ? <>🔑 Saisissez le code reçu par email et votre <strong style={{ color: 'var(--text)' }}>nouveau mot de passe</strong>.</>
                : (isSignup ? t('auth.createSpace') : t('auth.welcomeBack'))}
        </p>

        {success && <div style={{ ...styles.error, background: 'var(--success-soft)', borderColor: 'rgba(16,185,129,0.3)', color: 'var(--success)' }}>{success}</div>}

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
              style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 4, fontSize: 12 }}>
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
                <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>Les mots de passe ne correspondent pas</div>
              )}
            </div>
            {error && <div style={styles.error}>{error}</div>}
            <button type="submit" disabled={loading || code.length !== 6 || password.length < 6 || password !== confirmPassword}
              style={{ ...styles.button, opacity: (loading || code.length !== 6 || password.length < 6 || password !== confirmPassword) ? 0.6 : 1 }}>
              {loading ? <><Loader2 size={16} className="spin" /> Réinitialisation…</> : 'Changer mon mot de passe'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: 12 }}>
              <button type="button" onClick={() => { setMode('login'); setError(null); setSuccess(null); setCode(''); setPassword(''); }}
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={12} /> Retour
              </button>
              <button type="button" onClick={async () => {
                try { await forgotPassword(email); setSuccess('Nouveau code envoyé !'); } catch (e) { setError(e.message); }
              }} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
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
                style={{ background: 'none', border: 'none', color: 'var(--text-3)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <ArrowLeft size={12} /> Retour
              </button>
              <button type="button" onClick={handleResend} disabled={resending}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }}>
                {resending ? 'Envoi…' : 'Renvoyer le code'}
              </button>
            </div>
            <p style={{ fontSize: 11, color: 'var(--text-3)', textAlign: 'center', margin: '8px 0 0' }}>
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
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: 11, fontWeight: 600, padding: 0 }}>
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
                  <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>Les mots de passe ne correspondent pas</div>
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
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } } .spin { animation: spin 0.8s linear infinite; }`}</style>
    </div>
  );
}

const styles = {
  shell: { height: '100vh', background: 'radial-gradient(circle at 18% 18%, var(--surface-2) 0%, var(--bg) 52%)', display: 'grid', placeItems: 'center', padding: 20, position: 'relative', overflowY: 'auto' },
  themeButton: {
    position: 'fixed',
    top: 18,
    right: 18,
    zIndex: 5,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 40,
    padding: '0 14px',
    borderRadius: 10,
    border: '1px solid var(--border)',
    background: 'var(--bg-2)',
    color: 'var(--text)',
    boxShadow: 'var(--shadow)',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 700,
  },
  stage: { width: '100%', maxWidth: 1120, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 22, alignItems: 'stretch' },
  heroPanel: { minHeight: 560, borderRadius: 18, border: '1px solid var(--border)', background: 'linear-gradient(145deg, var(--surface) 0%, var(--bg-2) 58%, rgba(245,158,11,0.10) 100%)', boxShadow: 'var(--shadow-lg)', padding: 34, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' },
  heroTopline: { display: 'inline-flex', alignItems: 'center', gap: 8, color: 'var(--primary)', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 18 },
  heroDot: { width: 9, height: 9, borderRadius: 999, background: 'var(--success)', boxShadow: '0 0 0 6px var(--success-soft)' },
  heroTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 42, lineHeight: 1.05, letterSpacing: 0, color: 'var(--text)', maxWidth: 560, margin: 0 },
  heroText: { color: 'var(--text-2)', fontSize: 15, lineHeight: 1.7, maxWidth: 520, margin: '18px 0 0' },
  heroActions: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 26 },
  downloadButton: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 44, padding: '0 16px', borderRadius: 10, background: 'var(--primary)', color: '#0a0a0f', textDecoration: 'none', fontWeight: 800, fontSize: 13, boxShadow: '0 12px 28px var(--primary-glow)' },
  downloadMeta: { color: 'var(--text-3)', fontSize: 12, fontWeight: 600 },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginTop: 24 },
  featureItem: { minHeight: 58, display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px', border: '1px solid var(--border)', borderRadius: 10, background: 'rgba(255,255,255,0.03)', color: 'var(--text-2)', fontSize: 12, fontWeight: 700 },
  carPlate: { marginTop: 'auto', minHeight: 170, borderRadius: 14, border: '1px solid var(--border)', background: 'linear-gradient(180deg, var(--surface-2), var(--bg))', display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden' },
  carLine: { position: 'absolute', left: 0, right: 0, bottom: 42, height: 2, background: 'linear-gradient(90deg, transparent, var(--primary), transparent)', opacity: 0.8 },
  carShape: { color: 'var(--primary)', filter: 'drop-shadow(0 18px 35px var(--primary-glow))' },
  plateText: { position: 'absolute', bottom: 14, padding: '5px 14px', borderRadius: 7, background: 'var(--bg-2)', border: '1px solid var(--border)', color: 'var(--text)', fontSize: 11, fontWeight: 900, letterSpacing: '0.08em' },
  card: { width: '100%', maxWidth: 430, justifySelf: 'center', background: 'var(--bg-2)', border: '1px solid var(--border)', borderRadius: 16, padding: 36, display: 'flex', flexDirection: 'column', gap: 16, boxShadow: 'var(--shadow-lg)' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 4 },
  brand: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, color: 'var(--primary)', letterSpacing: -0.5 },
  tabs: { display: 'flex', background: 'var(--bg)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' },
  tab: { flex: 1, padding: '8px 12px', background: 'transparent', border: 'none', color: 'var(--text-3)', fontWeight: 600, fontSize: 13, cursor: 'pointer', borderRadius: 7 },
  tabActive: { background: 'var(--primary)', color: '#0a0a0f' },
  subtitle: { margin: 0, fontSize: 13, color: 'var(--text-3)', textAlign: 'center', marginBottom: 4 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 12, fontWeight: 600, color: 'var(--text-2)' },
  inputWrap: { position: 'relative' },
  icon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' },
  eyeBtn: {
    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: 'var(--text-3)', padding: 6, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  input: { width: '100%', padding: '11px 14px 11px 38px', background: 'var(--bg)', border: '1px solid var(--border)', borderRadius: 10, color: 'var(--text)', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' },
  button: { padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'var(--primary)', color: '#0a0a0f', fontWeight: 700, fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  error: { padding: '10px 12px', background: 'var(--danger-soft)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)', borderRadius: 10, fontSize: 13 },
  footer: { textAlign: 'center', fontSize: 12, color: 'var(--text-3)', margin: 0, paddingTop: 4 },
  link: { color: 'var(--primary)', textDecoration: 'none', fontWeight: 600, cursor: 'pointer' },
};
