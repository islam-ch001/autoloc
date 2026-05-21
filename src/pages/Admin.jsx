import { useState, useEffect } from 'react';
import { Calendar, Lock, RefreshCw, Search } from 'lucide-react';
import { format, parseISO, addDays, addMonths, addYears, isAfter, isBefore } from 'date-fns';
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
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  if (!user?.isSuperAdmin) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
        <Lock size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
        <h2 style={{ color: 'var(--text)' }}>Acces reserve</h2>
        <p>Cette page est uniquement accessible au super-administrateur.</p>
      </div>
    );
  }

  const today = new Date();
  const managedUsers = users.filter(u => !u.isSuperAdmin);
  const filtered = managedUsers.filter(u => {
    const q = search.trim().toLowerCase();
    const matchSearch = !q
      || u.email?.toLowerCase().includes(q)
      || u.name?.toLowerCase().includes(q);

    let matchStatus = true;
    if (statusFilter === 'active') {
      matchStatus = u.subscriptionStatus === 'active' && u.subscriptionEnd && new Date(u.subscriptionEnd) >= today;
    } else if (statusFilter === 'trial') {
      matchStatus = u.subscriptionStatus === 'trial' && u.subscriptionEnd && new Date(u.subscriptionEnd) >= today;
    } else if (statusFilter === 'expired') {
      matchStatus = !!u.subscriptionEnd && new Date(u.subscriptionEnd) < today;
    } else if (statusFilter === 'none') {
      matchStatus = !u.subscriptionEnd;
    } else if (statusFilter === 'blocked') {
      matchStatus = !!u.blocked;
    }

    return matchSearch && matchStatus;
  });

  const statusOf = (u) => {
    if (u.blocked) return { label: 'Bloque', cls: 'badge-danger' };
    const end = u.subscriptionEnd ? parseISO(u.subscriptionEnd) : null;
    if (u.subscriptionStatus === 'active' && end && isAfter(end, today)) return { label: 'Actif', cls: 'badge-success' };
    if (u.subscriptionStatus === 'trial' && end && isAfter(end, today)) return { label: 'Essai', cls: 'badge-warning' };
    if (end && isBefore(end, today)) return { label: 'Expire', cls: 'badge-danger' };
    return { label: 'Aucun acces', cls: 'badge-neutral' };
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des acces</h1>
          <p className="page-subtitle">
            Interface admin pour activer, prolonger ou bloquer les autres comptes - {managedUsers.length} compte{managedUsers.length > 1 ? 's' : ''}
          </p>
        </div>
        <button className="btn" onClick={load}><RefreshCw size={14} /> Actualiser</button>
      </div>

      {error && (
        <div style={{ padding: 12, background: 'var(--danger-soft)', color: 'var(--danger)', borderRadius: 10, marginBottom: 16 }}>
          {error}
        </div>
      )}

      <div className="admin-filters">
        <div className="search-bar admin-search-bar">
          <Search size={16} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Chercher un compte par email..."
          />
        </div>
        <div className="filter-group admin-filter-group">
          {[
            { v: 'all',      label: 'Tous' },
            { v: 'active',   label: 'Actif' },
            { v: 'trial',    label: 'Essai' },
            { v: 'expired',  label: 'Expire' },
            { v: 'none',     label: 'Aucun acces' },
            { v: 'blocked',  label: 'Bloque' },
          ].map(opt => (
            <button
              key={opt.v}
              type="button"
              className={`filter-btn ${statusFilter === opt.v ? 'active' : ''}`}
              onClick={() => setStatusFilter(opt.v)}
            >
              {opt.label}
            </button>
          ))}
        </div>
        {(search || statusFilter !== 'all') && (
          <div style={{ fontSize: 12, color: 'var(--text-3)', width: '100%' }}>
            {filtered.length} / {managedUsers.length}
          </div>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Chargement...</div>
      ) : (
        <div className="card admin-table-card">
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th className="hide-mobile">Email</th>
                  <th className="hide-mobile">Inscrit le</th>
                  <th className="hide-mobile">Derniere connexion</th>
                  <th className="hide-mobile">Acces</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: 30, textAlign: 'center', color: 'var(--text-3)' }}>
                      Aucun compte ne correspond a la recherche
                    </td>
                  </tr>
                )}
                {filtered.map(u => {
                  const s = statusOf(u);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', color: '#fff', fontWeight: 700, display: 'grid', placeItems: 'center', fontSize: 12, flexShrink: 0 }}>
                            {(u.name || '?').split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <div style={{ minWidth: 0 }}>
                            <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.name}</div>
                            {/* email visible uniquement en mobile (sous le nom) */}
                            <div className="show-mobile" style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="hide-mobile" style={{ fontSize: 12, color: 'var(--text-2)' }}>{u.email}</td>
                      <td className="hide-mobile" style={{ fontSize: 12 }}>{u.createdAt ? format(parseISO(u.createdAt), 'dd MMM yyyy', { locale: fr }) : '-'}</td>
                      <td className="hide-mobile" style={{ fontSize: 12, color: 'var(--text-3)' }}>
                        {u.lastLoginAt ? format(parseISO(u.lastLoginAt), 'dd/MM HH:mm', { locale: fr }) : '-'}
                      </td>
                      <td className="hide-mobile" style={{ fontSize: 12 }}>
                        {u.subscriptionPlan && <div style={{ fontWeight: 600 }}>{u.subscriptionPlan}</div>}
                        {u.subscriptionEnd && <div style={{ color: 'var(--text-3)' }}>Jusqu'au {format(parseISO(u.subscriptionEnd), 'dd/MM/yyyy')}</div>}
                        {!u.subscriptionEnd && <span style={{ color: 'var(--text-3)' }}>Aucun acces</span>}
                      </td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td>
                        <button className="btn btn-sm" onClick={() => setEditing(u)}>
                          <Calendar size={12} /> <span className="hide-mobile">Gerer l'acces</span><span className="show-mobile">Gerer</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {editing && (
        <ManageAccessModal
          user={editing}
          onClose={() => setEditing(null)}
          onSave={async () => {
            setEditing(null);
            await load();
          }}
        />
      )}
    </div>
  );
}

function ManageAccessModal({ user: u, onClose, onSave }) {
  const [form, setForm] = useState({
    status: u.subscriptionStatus || 'none',
    end: u.subscriptionEnd ? u.subscriptionEnd.split('T')[0] : '',
    plan: u.subscriptionPlan || '',
    notes: u.subscriptionNotes || '',
    blocked: !!u.blocked,
    blockedReason: u.blockedReason || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const setPreset = (date, status, plan) => {
    setForm(f => ({
      ...f,
      status,
      end: date.toISOString().slice(0, 10),
      plan,
      blocked: false,
      blockedReason: '',
    }));
  };

  const grantTrial = () => setPreset(addDays(new Date(), 3), 'trial', 'Essai 3 jours');
  const grantMonths = (months, plan) => setPreset(addMonths(new Date(), months), 'active', plan);
  const grantYear = () => setPreset(addYears(new Date(), 1), 'active', '1 an');

  const removeAccess = () => {
    setForm(f => ({
      ...f,
      status: 'none',
      end: '',
      plan: '',
      notes: f.notes,
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.adminUpdateSubscription(u.id, {
        status: form.status,
        end: form.end || null,
        plan: form.plan || null,
        notes: form.notes || null,
      });
      await api.adminBlockUser(u.id, { blocked: form.blocked, reason: form.blockedReason });
      onSave();
    } catch (e) {
      alert('Erreur : ' + e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal title={`Gerer l'acces - ${u.name}`} onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary" disabled={saving} onClick={handleSave}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </>
    }>
      <div style={{ padding: 12, background: 'var(--bg-2)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--text-2)' }}>
        Email : <strong style={{ color: 'var(--text)' }}>{u.email}</strong>
      </div>

      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
        Donner l'acces rapidement
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 18 }}>
        <button type="button" className="btn btn-sm" onClick={grantTrial}>Essai 3 jours</button>
        <button type="button" className="btn btn-sm" onClick={() => grantMonths(1, '1 mois')}>1 mois</button>
        <button type="button" className="btn btn-sm" onClick={() => grantMonths(3, '3 mois')}>3 mois</button>
        <button type="button" className="btn btn-sm" onClick={() => grantMonths(6, '6 mois')}>6 mois</button>
        <button type="button" className="btn btn-sm" onClick={grantYear}>1 an</button>
        <button type="button" className="btn btn-sm" onClick={removeAccess}>Retirer l'acces</button>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Statut</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="none">Aucun acces</option>
            <option value="active">Actif</option>
            <option value="trial">Essai</option>
            <option value="expired">Expire</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Date de fin</label>
          <input className="form-input" type="date" value={form.end} onChange={e => set('end', e.target.value)} />
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Plan</label>
        <input className="form-input" value={form.plan} onChange={e => set('plan', e.target.value)} placeholder="Ex: 1 mois, 3 mois, annuel..." />
      </div>

      <div className="form-group">
        <label className="form-label">Notes internes</label>
        <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Paiement recu, contact, remarque..." />
      </div>

      <div style={{ height: 1, background: 'var(--border)', margin: '16px 0' }} />

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: form.blocked ? 'var(--danger-soft)' : 'var(--bg-2)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
        <input type="checkbox" checked={form.blocked} onChange={e => set('blocked', e.target.checked)} />
        <Lock size={14} style={{ color: 'var(--danger)' }} />
        Bloquer ce compte
      </label>
      {form.blocked && (
        <input
          className="form-input"
          style={{ marginTop: 8 }}
          value={form.blockedReason}
          onChange={e => set('blockedReason', e.target.value)}
          placeholder="Raison du blocage visible par l'utilisateur"
        />
      )}
    </Modal>
  );
}
