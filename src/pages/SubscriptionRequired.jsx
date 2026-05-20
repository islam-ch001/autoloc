import { Lock, Mail, LogOut, MessageCircle } from 'lucide-react';
import { format, parseISO, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useAuth } from '../context/AuthContext';

export default function SubscriptionRequired() {
  const { user, logout } = useAuth();
  const end = user?.subscriptionEnd ? parseISO(user.subscriptionEnd) : null;
  const isExpired = end && isBefore(end, new Date());

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(circle at 20% 20%, var(--surface) 0%, var(--bg) 60%)',
      display: 'grid', placeItems: 'center', padding: 20,
    }}>
      <div style={{
        maxWidth: 480, background: 'var(--bg-2)', border: '1px solid var(--border)',
        borderRadius: 16, padding: 36, color: 'var(--text)',
        boxShadow: 'var(--shadow-lg)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'var(--primary-soft)', border: '2px solid rgba(245,158,11,0.3)',
          display: 'grid', placeItems: 'center', margin: '0 auto 20px',
        }}>
          <Lock size={28} style={{ color: 'var(--primary)' }} />
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>
          {isExpired ? 'Abonnement expiré' : "Accès non autorisé"}
        </h1>
        <p style={{ textAlign: 'center', color: 'var(--text-2)', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
          {isExpired
            ? `Votre abonnement a expiré le ${format(end, 'dd MMMM yyyy', { locale: fr })}.`
            : "Votre compte n'a pas encore d'abonnement actif."}
          <br/>
          Contactez l'administrateur pour activer l'accès.
        </p>

        <div style={{
          padding: 16, background: 'var(--bg)', borderRadius: 10, marginBottom: 20,
          fontSize: 13, color: 'var(--text-2)',
        }}>
          <div style={{ marginBottom: 4 }}><strong style={{ color: 'var(--text)' }}>{user?.name}</strong></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <Mail size={12} /> {user?.email}
          </div>
          {user?.subscriptionPlan && (
            <div style={{ marginTop: 8, fontSize: 12 }}>
              Plan : <strong>{user.subscriptionPlan}</strong>
            </div>
          )}
        </div>

        <a href={`https://wa.me/213554214999?text=${encodeURIComponent(`Bonjour, je souhaite activer mon abonnement AutoLoc.\nCompte: ${user?.email || ''}\nNom: ${user?.name || ''}`)}`}
           target="_blank" rel="noopener noreferrer"
           style={{
             display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
             padding: '12px 16px', background: '#25D366', color: '#fff',
             borderRadius: 10, textDecoration: 'none', fontWeight: 700, marginBottom: 10,
           }}>
          <MessageCircle size={18} /> Contacter l'administrateur
        </a>
        <button onClick={logout} style={{
          width: '100%', padding: '10px 16px', borderRadius: 10,
          border: '1px solid var(--border)', background: 'transparent', color: 'var(--text)',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13,
        }}>
          <LogOut size={14} /> Se déconnecter
        </button>
      </div>
    </div>
  );
}
