import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Mail, Lock, User, Loader2, KeyRound, ArrowLeft, Eye, EyeOff, Moon, Sun, Download, ShieldCheck, Cloud, Gauge, CircleUserRound, Globe2 } from 'lucide-react';
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
    <div className="login-shell">
      <header className="login-nav">
        <div className="login-brand-mini"><Car size={17} /> AutoLoc Cloud</div>
        <nav className="login-nav-links">
          <a>Home</a>
          <a>Features</a>
          <a>Pricing</a>
          <a>Support</a>
        </nav>
        <div className="login-nav-actions">
          <button
            type="button"
            onClick={toggle}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            className="login-theme-btn"
          >
            {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
            <span>{theme === 'dark' ? 'Clair' : 'Sombre'}</span>
          </button>
          <div className="login-avatar"><CircleUserRound size={21} /></div>
        </div>
      </header>

      <div className="login-stage">
        <section style={styles.heroPanel}>
          <div style={styles.heroTopline}>
            <Car size={14} />
            AUTOLOC CLOUD
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
            <div style={styles.featureIcon}><Globe2 size={19} /></div>
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
      <div className="login-sparkle" />
      <style>{loginCss}</style>
    </div>
  );
}

const styles = {
  heroPanel: { minHeight: 470, borderRadius: 16, border: '1px solid rgba(255,255,255,0.45)', background: 'linear-gradient(135deg, rgba(255,255,255,0.84), rgba(255,255,255,0.58))', boxShadow: '0 28px 80px rgba(3,10,24,0.22)', padding: 26, display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden', backdropFilter: 'blur(18px)', color: '#111827' },
  heroTopline: { display: 'inline-flex', alignItems: 'center', gap: 8, color: '#6b4f18', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 14 },
  heroTitle: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 36, lineHeight: 1.08, letterSpacing: 0, color: '#0f172a', maxWidth: 520, margin: 0 },
  heroText: { color: '#243244', fontSize: 13, lineHeight: 1.6, maxWidth: 500, margin: '12px 0 0' },
  heroActions: { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginTop: 26 },
  downloadButton: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 9, minHeight: 38, padding: '0 14px', borderRadius: 9, background: 'linear-gradient(135deg, #183b5c, #9b7a33)', color: '#fff', textDecoration: 'none', fontWeight: 800, fontSize: 12, boxShadow: '0 14px 30px rgba(15,23,42,0.25)' },
  downloadMeta: { color: '#334155', fontSize: 11, fontWeight: 600 },
  featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 10, marginTop: 24 },
  featureItem: { minHeight: 46, display: 'flex', alignItems: 'center', gap: 9, padding: '10px 12px', border: '1px solid rgba(255,255,255,0.65)', borderRadius: 10, background: 'rgba(255,255,255,0.42)', color: '#0f172a', fontSize: 11, fontWeight: 800, boxShadow: '0 12px 30px rgba(15,23,42,0.08)' },
  featureIcon: { minHeight: 46, display: 'grid', placeItems: 'center', borderRadius: 10, color: '#0f172a' },
  carPlate: { marginTop: 'auto', minHeight: 96, borderRadius: 12, border: '1px solid rgba(255,255,255,0.75)', background: 'rgba(255,255,255,0.52)', display: 'grid', placeItems: 'center', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)' },
  carLine: { position: 'absolute', left: 0, right: 0, bottom: 30, height: 2, background: 'linear-gradient(90deg, transparent, #d1992e, transparent)', opacity: 0.8 },
  carShape: { color: '#d1992e', filter: 'drop-shadow(0 10px 22px rgba(209,153,46,0.35))' },
  plateText: { position: 'absolute', bottom: 16, padding: '4px 14px', borderRadius: 6, background: '#fff', color: '#0f172a', fontSize: 10, fontWeight: 900, letterSpacing: '0.08em' },
  card: { width: '100%', maxWidth: 380, justifySelf: 'center', alignSelf: 'stretch', minHeight: 470, background: 'rgba(255,255,255,0.94)', border: '1px solid rgba(255,255,255,0.75)', borderRadius: 16, padding: 34, display: 'flex', flexDirection: 'column', gap: 14, boxShadow: '0 28px 80px rgba(3,10,24,0.24)', color: '#111827' },
  logo: { display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 4 },
  brand: { fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, color: '#172033', letterSpacing: -0.5 },
  tabs: { display: 'flex', background: '#e7ecf2', padding: 4, borderRadius: 999, border: '1px solid #d7dee8', boxShadow: 'inset 0 1px 4px rgba(15,23,42,0.08)' },
  tab: { flex: 1, padding: '8px 12px', background: 'transparent', border: 'none', color: '#334155', fontWeight: 700, fontSize: 12, cursor: 'pointer', borderRadius: 999 },
  tabActive: { background: 'linear-gradient(135deg, #173b60, #8f762f)', color: '#fff', boxShadow: '0 8px 18px rgba(15,23,42,0.18)' },
  subtitle: { margin: 0, fontSize: 12, color: '#334155', textAlign: 'center', marginBottom: 4 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 11, fontWeight: 800, color: '#172033' },
  inputWrap: { position: 'relative' },
  icon: { position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#536173' },
  eyeBtn: {
    position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)',
    background: 'transparent', border: 'none', cursor: 'pointer',
    color: '#536173', padding: 6, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  input: { width: '100%', padding: '11px 14px 11px 38px', background: '#f7f9fc', border: '1px solid #dce3ed', borderRadius: 10, color: '#111827', fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', boxShadow: 'inset 0 1px 4px rgba(15,23,42,0.05)' },
  button: { padding: '12px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'linear-gradient(135deg, #173b60, #9b7a33)', color: '#fff', fontWeight: 800, fontSize: 13, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4, boxShadow: '0 14px 26px rgba(15,23,42,0.20)' },
  error: { padding: '10px 12px', background: 'var(--danger-soft)', border: '1px solid rgba(239,68,68,0.25)', color: 'var(--danger)', borderRadius: 10, fontSize: 13 },
  footer: { textAlign: 'center', fontSize: 12, color: '#334155', margin: 0, paddingTop: 4 },
  link: { color: '#8f762f', textDecoration: 'none', fontWeight: 800, cursor: 'pointer' },
};

const loginCss = `
@keyframes spin { to { transform: rotate(360deg); } }
.spin { animation: spin 0.8s linear infinite; }
.login-shell {
  min-height: 100vh;
  background:
    linear-gradient(90deg, rgba(5,16,31,0.92), rgba(7,32,60,0.76) 46%, rgba(238,232,215,0.36)),
    radial-gradient(circle at 22% 62%, rgba(35,84,123,0.65), transparent 28%),
    radial-gradient(circle at 82% 40%, rgba(255,245,221,0.72), transparent 24%),
    linear-gradient(115deg, #111827 0%, #0c2744 45%, #d7d2c6 100%);
  display: grid;
  grid-template-rows: auto 1fr;
  padding: 22px;
  position: relative;
  overflow-y: auto;
}
.login-shell::before {
  content: "";
  position: fixed;
  inset: 0;
  background:
    linear-gradient(90deg, transparent 0 19%, rgba(255,255,255,0.16) 19.3% 19.6%, transparent 20% 39%, rgba(255,255,255,0.10) 39.4% 39.7%, transparent 40%),
    linear-gradient(0deg, transparent 0 60%, rgba(255,255,255,0.10) 60.4% 60.7%, transparent 61%);
  opacity: 0.55;
  filter: blur(1px);
  pointer-events: none;
}
.login-nav {
  width: 100%;
  max-width: 1180px;
  margin: 0 auto;
  min-height: 54px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 16px;
  position: relative;
  z-index: 2;
}
.login-brand-mini {
  color: rgba(255,255,255,0.86);
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  font-size: 12px;
}
.login-nav-links {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px;
  border-radius: 999px;
  background: rgba(12, 25, 44, 0.36);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255,255,255,0.08);
}
.login-nav-links a {
  color: rgba(255,255,255,0.72);
  font-size: 12px;
  text-decoration: none;
  padding: 8px 16px;
  border-radius: 999px;
}
.login-nav-links a:first-child {
  background: rgba(255,255,255,0.12);
  color: #fff;
}
.login-nav-actions {
  justify-self: end;
  display: inline-flex;
  align-items: center;
  gap: 10px;
}
.login-theme-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  min-height: 34px;
  padding: 0 13px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.20);
  background: rgba(19,31,47,0.45);
  color: #fff;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  backdrop-filter: blur(12px);
}
.login-avatar {
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(255,255,255,0.82);
  color: #172033;
}
.login-stage {
  width: 100%;
  max-width: 940px;
  margin: 42px auto 0;
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(340px, 0.92fr);
  gap: 58px;
  align-items: stretch;
}
.login-sparkle {
  position: fixed;
  right: 28px;
  bottom: 24px;
  width: 48px;
  height: 48px;
  pointer-events: none;
}
.login-sparkle::before,
.login-sparkle::after {
  content: "";
  position: absolute;
  inset: 12px;
  background: rgba(255,255,255,0.75);
  clip-path: polygon(50% 0, 62% 36%, 100% 50%, 62% 64%, 50% 100%, 38% 64%, 0 50%, 38% 36%);
}
.login-sparkle::after { inset: 18px; opacity: 0.55; transform: translate(-22px, 12px); }
:root[data-theme="dark"] .login-shell {
  background:
    linear-gradient(90deg, rgba(5,16,31,0.94), rgba(7,32,60,0.80) 46%, rgba(238,232,215,0.24)),
    radial-gradient(circle at 22% 62%, rgba(35,84,123,0.55), transparent 28%),
    radial-gradient(circle at 82% 40%, rgba(255,245,221,0.48), transparent 24%),
    linear-gradient(115deg, #070b13 0%, #0c2744 45%, #8d887e 100%);
}
@media (max-width: 920px) {
  .login-shell { padding: 16px; }
  .login-nav { grid-template-columns: 1fr auto; }
  .login-nav-links { display: none; }
  .login-stage { grid-template-columns: 1fr; gap: 18px; margin-top: 18px; max-width: 460px; }
  .login-stage section { min-height: auto !important; }
  .login-stage form { min-height: auto !important; }
}
@media (max-width: 520px) {
  .login-brand-mini { display: none; }
  .login-nav { grid-template-columns: 1fr; justify-items: end; }
}
`;
