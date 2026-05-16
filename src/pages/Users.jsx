import { useEffect, useState } from 'react';
import { Plus, Mail, User, Shield, Trash2, Calendar, Clock } from 'lucide-react';
import { useAuth, getToken } from '../context/AuthContext';
import Modal from '../components/Modal';

const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

async function apiAuth(method, path, body) {
  const res = await fetch(`${BASE}/auth${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return data;
}

export default function Users() {
  const { user: me } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setUsers(await apiAuth('GET', '/users'));
      setError(null);
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async (u) => {
    if (!confirm(`Supprimer le compte de ${u.name} (${u.email}) ?`)) return;
    try {
      await apiAuth('DELETE', `/users/${u.id}`);
      load();
    } catch (e) { alert('Erreur : ' + e.message); }
  };

  if (me?.role !== 'admin') {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>
        <Shield size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
        <h2 style={{ color: 'var(--text)', margin: '8px 0' }}>Accès réservé</h2>
        <p>Cette page est réservée aux administrateurs.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Utilisateurs</h1>
          <p className="page-subtitle">{users.length} compte{users.length > 1 ? 's' : ''} actif{users.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Nouvel utilisateur
        </button>
      </div>

      {error && <div style={{ padding: 12, background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderRadius: 10, marginBottom: 16, fontSize: 13 }}>{error}</div>}

      {loading ? (
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Chargement…</div>
      ) : (
        <div className="table-card">
          <table className="data-table">
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Email</th>
                <th>Rôle</th>
                <th>Créé le</th>
                <th>Dernière connexion</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#0a0a0f', fontWeight: 700, display: 'grid', placeItems: 'center', fontSize: 12 }}>
                        {(u.name || '?').split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                      <strong>{u.name}</strong>
                      {u.id === me.id && <span style={{ fontSize: 10, color: 'var(--primary)', background: 'var(--primary-soft)', padding: '2px 8px', borderRadius: 6 }}>VOUS</span>}
                    </div>
                  </td>
                  <td style={{ color: 'var(--text-2)', fontSize: 13 }}>{u.email}</td>
                  <td>
                    <span className={`badge ${u.role === 'admin' ? 'badge-warning' : 'badge-accent'}`}>
                      {u.role === 'admin' ? '👑 Admin' : 'Utilisateur'}
                    </span>
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    {new Date(u.created_at).toLocaleDateString('fr-DZ')}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                    {u.last_login_at ? new Date(u.last_login_at).toLocaleString('fr-DZ', { dateStyle: 'short', timeStyle: 'short' }) : '—'}
                  </td>
                  <td style={{ width: 50 }}>
                    {u.id !== me.id && (
                      <button className="action-btn" title="Supprimer" onClick={() => handleDelete(u)}>
                        <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAdd && <AddUserModal onClose={() => setShowAdd(false)} onAdd={() => { setShowAdd(false); load(); }} />}
    </div>
  );
}

function AddUserModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    setError(null);
    if (!form.name || !form.email || !form.password) { setError('Tous les champs sont requis'); return; }
    if (form.password.length < 6) { setError('Le mot de passe doit faire au moins 6 caractères'); return; }
    setLoading(true);
    try {
      await apiAuth('POST', '/users', form);
      onAdd();
    } catch (e) { setError(e.message); }
    finally { setLoading(false); }
  };

  return (
    <Modal title="Nouvel utilisateur" onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary" disabled={loading} onClick={handleSubmit}>
          {loading ? 'Création…' : 'Créer le compte'}
        </button>
      </>
    }>
      <div className="form-group">
        <label className="form-label">Nom complet *</label>
        <input className="form-input" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Ahmed Bouzid" />
      </div>
      <div className="form-group">
        <label className="form-label">Email *</label>
        <input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} placeholder="ahmed@autoloc.dz" />
      </div>
      <div className="form-group">
        <label className="form-label">Mot de passe (min. 6 caractères) *</label>
        <input className="form-input" type="password" value={form.password} onChange={e => set('password', e.target.value)} placeholder="••••••••" />
      </div>
      <div className="form-group">
        <label className="form-label">Rôle</label>
        <select className="form-select" value={form.role} onChange={e => set('role', e.target.value)}>
          <option value="user">Utilisateur (employé)</option>
          <option value="admin">Administrateur</option>
        </select>
      </div>
      {error && <div style={{ padding: '10px 12px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderRadius: 8, fontSize: 13 }}>{error}</div>}
    </Modal>
  );
}
