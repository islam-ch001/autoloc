import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { KeyRound, Lock, Loader2, ShieldCheck, ExternalLink, Copy, Check } from 'lucide-react';

// Helper : appel direct au backend local (sans token, route publique)
async function api(path, options = {}) {
  const envUrl = import.meta.env.VITE_API_URL;
  const base = (envUrl !== undefined ? envUrl : '') + '/api';
  const res = await fetch(base + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur');
  return data;
}

export default function Activation() {
  const navigate = useNavigate();
  const [status, setStatus] = useState('checking'); // 'checking' | 'needs-activation' | 'activating' | 'success'
  const [key, setKey] = useState('');
  const [error, setError] = useState(null);
  const [machineId, setMachineId] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api('/license/status')
      .then(res => {
        if (res.activated) {
          navigate('/welcome', { replace: true });
        } else {
          setMachineId(res.machineId);
          setStatus('needs-activation');
          if (res.error === 'machine_mismatch') {
            setError(res.message || 'Cette licence est liée à un autre ordinateur.');
          }
        }
      })
      .catch(err => {
        setError(err.message);
        setStatus('needs-activation');
      });
  }, [navigate]);

  const formatInput = (raw) => {
    const clean = raw.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 20);
    return clean.match(/.{1,4}/g)?.join('-') || clean;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setStatus('activating');
    try {
      await api('/license/activate', {
        method: 'POST',
        body: JSON.stringify({ key: key.trim() }),
      });
      setStatus('success');
      setTimeout(() => navigate('/welcome', { replace: true }), 1500);
    } catch (err) {
      setError(err.message);
      setStatus('needs-activation');
    }
  };

  const copyMachineId = () => {
    if (machineId) {
      navigator.clipboard.writeText(machineId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (status === 'checking') {
    return (
      <div style={S.shell}>
        <Loader2 size={40} className="spin" style={{ color: 'var(--primary)' }} />
        <p style={{ marginTop: 16, color: 'var(--text-2)' }}>Vérification de la licence…</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div style={S.shell}>
        <div style={S.successCircle}>
          <Check size={36} style={{ color: '#fff' }} />
        </div>
        <h1 style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 26, fontWeight: 800, marginTop: 20, color: 'var(--text)' }}>
          Licence activée !
        </h1>
        <p style={{ color: 'var(--text-2)', marginTop: 8 }}>Bienvenue sur AutoLoc. Redirection…</p>
      </div>
    );
  }

  return (
    <div style={S.shell}>
      <div style={S.card}>
        {/* Icone */}
        <div style={S.iconCircle}>
          <Lock size={32} style={{ color: '#fff' }} />
        </div>

        {/* Titre */}
        <h1 style={S.title}>Activation requise</h1>
        <p style={S.subtitle}>
          Veuillez saisir votre clé d'activation pour utiliser AutoLoc.
        </p>

        {/* Formulaire */}
        <form onSubmit={handleSubmit} style={{ width: '100%' }}>
          <div style={S.inputGroup}>
            <KeyRound size={18} style={S.inputIcon} />
            <input
              type="text"
              value={key}
              onChange={e => setKey(formatInput(e.target.value))}
              placeholder="XXXX-XXXX-XXXX-XXXX-XXXX"
              maxLength={24}
              autoFocus
              style={S.input}
            />
          </div>

          {error && (
            <div style={S.error}>⚠ {error}</div>
          )}

          <button type="submit" disabled={status === 'activating' || key.replace(/-/g, '').length !== 20} style={{
            ...S.button,
            opacity: (status === 'activating' || key.replace(/-/g, '').length !== 20) ? 0.5 : 1,
          }}>
            {status === 'activating' ? (
              <><Loader2 size={16} className="spin" /> Activation…</>
            ) : (
              <><ShieldCheck size={16} /> Activer AutoLoc</>
            )}
          </button>
        </form>

        {/* Pas encore de clé */}
        <div style={S.helpBox}>
          <p style={{ margin: 0, color: 'var(--text-2)', fontSize: 13 }}>
            <strong style={{ color: 'var(--text)' }}>Vous n'avez pas de clé ?</strong>
          </p>
          <p style={{ margin: '6px 0 12px', color: 'var(--text-3)', fontSize: 12 }}>
            Achetez votre licence (6 900 DA, paiement unique, à vie) sur WhatsApp :
          </p>
          <a
            href={`https://wa.me/213554214999?text=${encodeURIComponent(`Bonjour, je souhaite acheter une licence AutoLoc Windows.\nID de mon PC : ${machineId || 'inconnu'}`)}`}
            target="_blank"
            rel="noopener noreferrer"
            style={S.whatsappBtn}
          >
            💬 Acheter sur WhatsApp <ExternalLink size={12} />
          </a>
        </div>

        {/* ID PC affiché */}
        {machineId && (
          <div style={S.machineBox}>
            <span style={{ color: 'var(--text-3)', fontSize: 11 }}>ID de votre PC :</span>
            <code style={{ fontSize: 11, color: 'var(--text-2)', flex: 1, fontFamily: 'monospace' }}>{machineId}</code>
            <button type="button" onClick={copyMachineId} style={S.copyBtn} title="Copier">
              {copied ? <Check size={12} style={{ color: 'var(--success)' }} /> : <Copy size={12} />}
            </button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 0.8s linear infinite; }
      `}</style>
    </div>
  );
}

const S = {
  shell: {
    minHeight: '100vh',
    background: `
      radial-gradient(ellipse 80% 60% at 15% 10%, rgba(99,102,241,0.22) 0%, transparent 55%),
      radial-gradient(ellipse 70% 50% at 85% 90%, rgba(124,58,237,0.20) 0%, transparent 55%),
      linear-gradient(135deg, var(--bg) 0%, var(--surface-2) 50%, var(--bg) 100%)
    `,
    display: 'grid',
    placeItems: 'center',
    padding: 20,
  },
  card: {
    maxWidth: 460,
    width: '100%',
    background: 'var(--bg-2)',
    border: '1px solid var(--border)',
    borderRadius: 18,
    padding: 36,
    textAlign: 'center',
    boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--primary), var(--accent))',
    display: 'grid',
    placeItems: 'center',
    margin: '0 auto 20px',
    boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
  },
  successCircle: {
    width: 80,
    height: 80,
    borderRadius: '50%',
    background: 'linear-gradient(135deg, var(--success), #059669)',
    display: 'grid',
    placeItems: 'center',
    boxShadow: '0 12px 32px rgba(16,185,129,0.4)',
  },
  title: {
    fontFamily: 'Space Grotesk, sans-serif',
    fontSize: 24,
    fontWeight: 800,
    color: 'var(--text)',
    marginBottom: 8,
  },
  subtitle: {
    color: 'var(--text-2)',
    fontSize: 14,
    marginBottom: 28,
    lineHeight: 1.5,
  },
  inputGroup: {
    position: 'relative',
    marginBottom: 16,
  },
  inputIcon: {
    position: 'absolute',
    left: 14,
    top: '50%',
    transform: 'translateY(-50%)',
    color: 'var(--text-3)',
  },
  input: {
    width: '100%',
    padding: '14px 14px 14px 42px',
    background: 'var(--bg)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    color: 'var(--text)',
    fontSize: 16,
    fontFamily: 'monospace',
    letterSpacing: 1,
    textAlign: 'center',
    outline: 'none',
    transition: 'border-color 0.15s',
  },
  error: {
    padding: '10px 14px',
    background: 'var(--danger-soft)',
    color: 'var(--danger)',
    borderRadius: 8,
    fontSize: 13,
    marginBottom: 14,
    textAlign: 'left',
  },
  button: {
    width: '100%',
    padding: '13px 20px',
    background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    transition: 'all 0.2s',
  },
  helpBox: {
    marginTop: 28,
    padding: 18,
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 10,
    textAlign: 'left',
  },
  whatsappBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: '#25D366',
    color: '#fff',
    borderRadius: 8,
    fontSize: 12,
    fontWeight: 700,
    textDecoration: 'none',
  },
  machineBox: {
    marginTop: 14,
    padding: '8px 12px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
  },
  copyBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-3)',
    cursor: 'pointer',
    padding: 4,
    display: 'inline-flex',
  },
};
