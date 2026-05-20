import { useState, useEffect } from 'react';
import { ShieldCheck, Calendar, Check, X, Lock, Unlock, Plus, RefreshCw, Search } from 'lucide-react';
import { format, parseISO, addMonths, addYears, isAfter, isBefore } from 'date-fns';
import { fr } from 'date-fns/locale';
import * as api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/Modal';

export default function Admin() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.adminListUsers();
      setUsers(data);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  if (!user?.isSuperAdmin) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
        <Lock size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
        <h2 style={{ color: 'var(--text)' }}>Accès réservé</h2>
        <p>Cette page est uniquement accessible au super-administrateur.</p>
      </div>
    );
  }

  const today = new Date();

  // Filtrage utilisateurs
  const filtered = users.filter(u => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q
      || u.email?.toLowerCase().includes(q)
      || u.name?.toLowerCase().includes(q);
    let matchStatus = true;
    if (statusFilter !== 'all') {
      if (statusFilter === 'super') matchStatus = !!u.isSuperAdmin;
      else if (statusFilter === 'active') matchStatus = u.subscriptionStatus === 'active' && u.subscriptionEnd && new Date(u.subscriptionEnd) >= today;
      else if (statusFilter === 'trial')  matchStatus = u.subscriptionStatus === 'trial'  && u.subscriptionEnd && new Date(u.subscriptionEnd) >= today;
      else if (statusFilter === 'expired') matchStatus = u.subscriptionEnd && new Date(u.subscriptionEnd) < today;
      else if (statusFilter === 'none')    matchStatus = !u.subscriptionEnd && !u.isSuperAdmin;
      else if (statusFilter === 'blocked') matchStatus = !!u.blocked;
    }
    return matchSearch && matchStatus;
  });

  const statusOf = (u) => {
    if (u.isSuperAdmin) return { label: '👑 Super Admin', color: 'var(--primary)', cls: 'badge-warning' };
    if (u.blocked) return { label: '🚫 Bloqué', color: 'var(--danger)', cls: 'badge-danger' };
    const end = u.subscriptionEnd ? parseISO(u.subscriptionEnd) : null;
    if (u.subscriptionStatus === 'active' && end && isAfter(end, today)) return { label: '✓ Actif', color: 'var(--success)', cls: 'badge-success' };
    if (end && isBefore(end, today)) return { label: '⏰ Expiré', color: 'var(--danger)', cls: 'badge-danger' };
    return { label: '— Aucun', color: 'var(--text-3)', cls: 'badge-neutral' };
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Administration</h1>
          <p className="page-subtitle">Gérez les abonnements et l'accès des utilisateurs · {users.length} compte{users.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn" onClick={load}><RefreshCw size={14} /> Actualiser</button>
      </div>

      {error && <div style={{ padding: 12, background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderRadius: 10, marginBottom: 16 }}>{error}</div>}

      {/* Recherche + filtres */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
          <Search size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Chercher par email ou nom…"
          />
        </div>
        <select
          className="form-select"
          style={{ maxWidth: 220 }}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="all">Tous les statuts</option>
          <option value="super">👑 Super Admin</option>
          <option value="active">✓ Actif</option>
          <option value="trial">🎁 Essai</option>
          <option value="expired">⏰ Expiré</option>
          <option value="none">— Aucun</option>
          <option value="blocked">🚫 Bloqué</option>
        </select>
        {search || statusFilter !== 'all' ? (
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {filtered.length} / {users.length}
          </div>
        ) : null}
      </div>

      {loading ? <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Chargement…</div> : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Email</th>
                  <th>Inscrit le</th>
                  <th>Dernière connexion</th>
                  <th>Données</th>
                  <th>Abonnement</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr><td colSpan={8} style={{ padding: 30, textAlign: 'center', color: 'var(--text-3)' }}>Aucun utilisateur ne correspond à la recherche</td></tr>
                )}
                {filtered.map(u => {
                  const s = statusOf(u);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0a0a0f', fontWeight: 700, display: 'grid', placeItems: 'center', fontSize: 12 }}>
                            {(u.name || '?').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{u.name}</div>
                            {u.id === user.id && <div style={{ fontSize: 10, color: 'var(--primary)' }}>VOUS</div>}
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-2)' }}>{u.email}</td>
                      <td style={{ fontSize: 12 }}>{format(parseISO(u.createdAt), 'dd MMM yyyy', { locale: fr })}</td>
                      <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        {u.lastLoginAt ? format(parseISO(u.lastLoginAt), 'dd/MM HH:mm', { locale: fr }) : '—'}
                      </td>
                      <td style={{ fontSize: 11, color: 'var(--text-3)' }}>
                        🚗 {u.vehiclesCount} · 👥 {u.clientsCount} · 📅 {u.reservationsCount}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {u.subscriptionPlan && <div style={{ fontWeight: 600 }}>{u.subscriptionPlan}</div>}
                        {u.subscriptionEnd && <div style={{ color: 'var(--text-3)' }}>→ {format(parseISO(u.subscriptionEnd), 'dd/MM/yyyy')}</div>}
                        {!u.subscriptionEnd && !u.isSuperAdmin && <span style={{ color: 'var(--text-3)' }}>—</span>}
                      </td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td>
                        {!u.isSuperAdmin && (
                          <button className="btn btn-sm" onClick={() => setEditing(u)}>
                            <Calendar size={12} /> Gérer
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && <ManageSubscriptionModal user={editing} onClose={() => setEditing(null)} onSave={async () => { setEditing(null); await load(); }} />}
    </div>
  );
}

function ManageSubscriptionModal({ user: u, onClose, onSave }) {
  const [form, setForm] = useState({
    status: u.subscriptionStatus || 'none',
    end:    u.subscriptionEnd ? u.subscriptionEnd.split('T')[0] : '',
    plan:   u.subscriptionPlan || '',
    notes:  u.subscriptionNotes || '',
    blocked: !!u.blocked,
    blockedReason: u.blockedReason || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const grantPreset = (months, plan) => {
    const d = new Date();
    if (months >= 12) d.setFullYear(d.getFullYear() + Math.floor(months / 12));
    else d.setMonth(d.getMonth() + months);
    setForm(f => ({ ...f, status: 'active', end: d.toISOString().slice(0, 10), plan }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.adminUpdateSubscription(u.id, {
        status: form.status,
        end:    form.end || null,
        plan:   form.plan || null,
        notes:  form.notes || null,
      });
      await api.adminBlockUser(u.id, { blocked: form.blocked, reason: form.blockedReason });
      onSave();
    } catch (e) { alert('Erreur : ' + e.message); }
    finally { setSaving(false); }
  };

  return (
    <Modal title={`Gérer ${u.name}`} onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </>
    }>
      <div style={{ padding: 12, background: 'var(--bg-2)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--text-2)' }}>
        📧 {u.email} · 🚗 {u.vehiclesCount} véhicules · 👥 {u.clientsCount} clients
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        Donner l'accès rapidement
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        <button type="button" className="btn btn-sm" onClick={() => grantPreset(1, '1 mois')}>+1 mois</button>
        <button type="button" className="btn btn-sm" onClick={() => grantPreset(3, '3 mois')}>+3 mois</button>
        <button type="button" className="btn btn-sm" onClick={() => grantPreset(6, '6 mois')}>+6 mois</button>
        <button type="button" className="btn btn-sm" onClick={() => grantPreset(12, '1 an')}>+1 an</button>
        <button type="button" className="btn btn-sm" onClick={() => grantPreset(120, 'Lifetime')}>Lifetime</button>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Statut</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="none">Aucun</option>
            <option value="active">Actif</option>
            <option value="trial">Essai</option>
            <option value="expired">Expiré</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date de fin</label>
          <input className="form-input" type="date" value={form.end} onChange={e => set('end', e.target.value)} />
        </div>
      </div>
      <div className="form-group">
        <label className="form-label">Plan / Description</label>
        <input className="form-input" value={form.plan} onChange={e => set('plan', e.target.value)} placeholder="Ex: Mensuel, Annuel, Essai gratuit…" />
      </div>
      <div className="form-group">
        <label className="form-label">Notes internes</label>
        <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Paiement reçu, contact, etc." />
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: form.blocked ? 'rgba(239,68,68,0.1)' : 'var(--bg-2)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
        <input type="checkbox" checked={form.blocked} onChange={e => set('blocked', e.target.checked)} />
        <Lock size={14} style={{ color: 'var(--danger)' }} />
        Bloquer ce compte (impossibilité de se connecter)
      </label>
      {form.blocked && (
        <input className="form-input" style={{ marginTop: 8 }} value={form.blockedReason} onChange={e => set('blockedReason', e.target.value)} placeholder="Raison du blocage (visible par l'utilisateur)" />
      )}
    </Modal>
  );
}
