import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Welcome() {
  const { desktopAutoLogin } = useAuth();
  const navigate = useNavigate();
  const [phase, setPhase] = useState('intro'); // 'intro' | 'connecting' | 'error'
  const [error, setError] = useState(null);

  useEffect(() => {
    // Phase 1 : animation 1.8s
    const t1 = setTimeout(() => setPhase('connecting'), 1800);

    // Phase 2 : auto-login (en parallele avec animation)
    const autoLogin = async () => {
      try {
        await desktopAutoLogin();
        // Attendre que l'animation soit finie avant de naviguer
        setTimeout(() => navigate('/', { replace: true }), 2200);
      } catch (err) {
        setError(err.message || 'Erreur de demarrage');
        setPhase('error');
      }
    };
    autoLogin();

    return () => clearTimeout(t1);
  }, [desktopAutoLogin, navigate]);

  return (
    <div style={styles.shell}>
      {/* Particules d'arriere-plan */}
      <div style={styles.particles}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${4 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      <div style={styles.center}>
        {/* Logo : voiture qui rebondit avec halo qui pulse */}
        <div style={styles.logoWrap}>
          <div style={styles.halo} />
          <div style={styles.logoCircle}>
            <Car size={56} strokeWidth={2} style={{ color: '#fff' }} />
          </div>
        </div>

        {/* Brand */}
        <h1 style={styles.brand}>
          {[
            { c: 'A', d: '0.2s', primary: false },
            { c: 'u', d: '0.3s', primary: false },
            { c: 't', d: '0.4s', primary: false },
            { c: 'o', d: '0.5s', primary: false },
            { c: 'L', d: '0.6s', primary: true },
            { c: 'o', d: '0.7s', primary: true },
            { c: 'c', d: '0.8s', primary: true },
          ].map((l, i) => (
            <span key={i} style={{
              display: 'inline-block',
              animation: `letter-pop 0.5s ${l.d} both`,
              color: l.primary ? 'var(--primary)' : 'var(--text)',
            }}>{l.c}</span>
          ))}
        </h1>

        <p style={styles.tagline}>Gestion de location de voitures</p>

        {/* Statut */}
        <div style={styles.status}>
          {phase === 'intro' && <div style={styles.dot}>● Demarrage…</div>}
          {phase === 'connecting' && (
            <div style={styles.statusConnecting}>
              <div style={styles.spinner} />
              <span>Initialisation de la base locale…</span>
            </div>
          )}
          {phase === 'error' && (
            <div style={styles.statusError}>
              <div>⚠ Erreur : {error}</div>
              <button onClick={() => window.location.reload()} style={styles.retryBtn}>
                Reessayer
              </button>
            </div>
          )}
        </div>

        {/* Version & mode */}
        <div style={styles.footer}>
          <span>Mode hors-ligne · Donnees locales</span>
        </div>
      </div>

      <style>{`
        @keyframes float-up {
          0%   { transform: translateY(100vh) scale(0); opacity: 0; }
          10%  { opacity: 0.6; }
          90%  { opacity: 0.3; }
          100% { transform: translateY(-20vh) scale(1.2); opacity: 0; }
        }
        @keyframes pulse-halo {
          0%, 100% { transform: scale(1);   opacity: 0.6; }
          50%      { transform: scale(1.3); opacity: 0.2; }
        }
        @keyframes bounce-in {
          0%   { transform: scale(0) rotate(-180deg); opacity: 0; }
          60%  { transform: scale(1.15) rotate(10deg); opacity: 1; }
          80%  { transform: scale(0.95) rotate(-5deg); }
          100% { transform: scale(1) rotate(0); }
        }
        @keyframes letter-pop {
          0%   { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0);    opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @keyframes fade-in {
          0%   { opacity: 0; transform: translateY(10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  shell: {
    minHeight: '100vh',
    background: `
      radial-gradient(ellipse 80% 60% at 15% 10%, rgba(99,102,241,0.25) 0%, transparent 55%),
      radial-gradient(ellipse 70% 50% at 85% 90%, rgba(124,58,237,0.22) 0%, transparent 55%),
      radial-gradient(ellipse 60% 40% at 50% 50%, rgba(16,185,129,0.10) 0%, transparent 60%),
      linear-gradient(135deg, var(--bg) 0%, var(--surface-2) 50%, var(--bg) 100%)
    `,
    display: 'grid',
    placeItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  particles: {
    position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'hidden',
  },
  particle: {
    position: 'absolute', bottom: 0,
    width: 4, height: 4, borderRadius: '50%',
    background: 'var(--primary)',
    animation: 'float-up linear infinite',
    boxShadow: '0 0 8px var(--primary)',
  },
  center: {
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
    padding: 24,
  },
  logoWrap: {
    position: 'relative', width: 140, height: 140,
    display: 'grid', placeItems: 'center', marginBottom: 8,
  },
  halo: {
    position: 'absolute', inset: 0,
    borderRadius: '50%',
    background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
    animation: 'pulse-halo 2s ease-in-out infinite',
    filter: 'blur(8px)',
  },
  logoCircle: {
    position: 'relative', zIndex: 1,
    width: 110, height: 110, borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    display: 'grid', placeItems: 'center',
    boxShadow: '0 12px 40px rgba(99,102,241,0.5), inset 0 2px 8px rgba(255,255,255,0.2)',
    animation: 'bounce-in 1s cubic-bezier(0.34, 1.56, 0.64, 1) both',
  },
  brand: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontWeight: 800,
    fontSize: 48,
    margin: 0,
    color: 'var(--text)',
    letterSpacing: -1.5,
    display: 'flex',
  },
  tagline: {
    fontSize: 14,
    color: 'var(--text-3)',
    margin: 0,
    animation: 'fade-in 0.8s 1s both',
  },
  status: {
    marginTop: 24, minHeight: 40,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'fade-in 0.6s 1.4s both',
  },
  dot: { color: 'var(--text-3)', fontSize: 13 },
  statusConnecting: {
    display: 'inline-flex', alignItems: 'center', gap: 10,
    fontSize: 13, color: 'var(--text-2)',
    padding: '8px 16px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 999,
  },
  spinner: {
    width: 14, height: 14,
    border: '2px solid var(--border)',
    borderTopColor: 'var(--primary)',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
  },
  statusError: {
    color: 'var(--danger)', fontSize: 13, textAlign: 'center',
    display: 'flex', flexDirection: 'column', gap: 12, alignItems: 'center',
  },
  retryBtn: {
    padding: '8px 20px', borderRadius: 8,
    background: 'var(--primary)', color: '#fff', border: 'none',
    fontWeight: 700, cursor: 'pointer', fontSize: 13,
  },
  footer: {
    position: 'absolute', bottom: 24, left: 0, right: 0,
    textAlign: 'center', fontSize: 11, color: 'var(--text-3)',
    animation: 'fade-in 1s 1.6s both',
  },
};

// On applique le style sur les lettres via cette injection
const letterStyle = {
  display: 'inline-block',
  animation: 'letter-pop 0.5s ease-out both',
};

// Patch : ajouter le style aux <span> du brand
// (deja gere par les inline styles sur les span)
