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
      background: 'radial-gradient(circle at 20% 20%, #1a1a28 0%, #0a0a0f 60%)',
      display: 'grid', placeItems: 'center', padding: 20,
    }}>
      <div style={{
        maxWidth: 480, background: '#12121a', border: '1px solid #2a2a3e',
        borderRadius: 16, padding: 36, color: '#f0f0f5',
        boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
      }}>
        <div style={{
          width: 64, height: 64, borderRadius: '50%',
          background: 'rgba(245,158,11,0.15)', border: '2px solid rgba(245,158,11,0.3)',
          display: 'grid', placeItems: 'center', margin: '0 auto 20px',
        }}>
          <Lock size={28} style={{ color: '#f59e0b' }} />
        </div>

        <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 24, fontWeight: 800, textAlign: 'center', marginBottom: 8 }}>
          {isExpired ? 'Abonnement expiré' : "Accès non autorisé"}
        </h1>
        <p style={{ textAlign: 'center', color: '#b0b0c0', marginBottom: 24, fontSize: 14, lineHeight: 1.6 }}>
          {isExpired
            ? `Votre abonnement a expiré le ${format(end, 'dd MMMM yyyy', { locale: fr })}.`
            : "Votre compte n'a pas encore d'abonnement actif."}
          <br/>
          Contactez l'administrateur pour activer l'accès.
        </p>

        <div style={{
          padding: 16, background: '#0a0a0f', borderRadius: 10, marginBottom: 20,
          fontSize: 13, color: '#b0b0c0',
        }}>
          <div style={{ marginBottom: 4 }}><strong style={{ color: '#f0f0f5' }}>{user?.name}</strong></div>
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
          border: '1px solid rgba(255,255,255,0.15)', background: 'transparent', color: '#fff',
          cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontSize: 13,
        }}>
          <LogOut size={14} /> Se déconnecter
        </button>
      </div>
    </div>
  );
}
