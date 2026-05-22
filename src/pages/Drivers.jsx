import { useState } from 'react';
import { Plus, Search, Eye, Phone, Mail, MapPin, IdCard, Pencil, Trash2, Calendar, DollarSign, AlertTriangle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';
import { format, parseISO, isBefore, addMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Drivers() {
  const { drivers, addDriver, patchDriver, removeDriver, reservations, vehicles } = useApp();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);

  const filtered = drivers.filter(d => {
    const matchSearch = `${d.firstName} ${d.lastName} ${d.phone} ${d.email || ''}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'Tous' || d.status === (filter === 'Actifs' ? 'active' : 'inactive');
    return matchSearch && matchFilter;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Chauffeurs</h1>
          <p className="page-subtitle">{drivers.length} chauffeur{drivers.length > 1 ? 's' : ''} enregistré{drivers.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Ajouter un chauffeur
        </button>
      </div>

      <div className="filters-row">
        <div className="search-bar filters-search">
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher par nom, téléphone..." />
        </div>
        <div className="filter-group filters-buttons">
          {['Tous', 'Actifs', 'Inactifs'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{f}</button>
          ))}
        </div>
        <select className="form-select filters-select" value={filter} onChange={e => setFilter(e.target.value)}>
          {['Tous', 'Actifs', 'Inactifs'].map(f => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      {drivers.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧑‍✈️</div>
          <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, marginBottom: 8 }}>Aucun chauffeur enregistré</h3>
          <p style={{ color: 'var(--text-3)', fontSize: 13, marginBottom: 20 }}>Ajoutez vos chauffeurs pour les assigner aux réservations.</p>
          <button className="btn btn-primary" onClick={() => setShowAdd(true)}><Plus size={16} /> Ajouter mon premier chauffeur</button>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Chauffeur</th>
                  <th>Contact</th>
                  <th>Permis</th>
                  <th>Tarif / Salaire</th>
                  <th>Réservations</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => {
                  const driverRes = reservations.filter(r => r.driverId === d.id);
                  const activeRes = driverRes.find(r => r.status === 'active');
                  const vehicle = activeRes ? vehicles.find(v => v.id === activeRes.vehicleId) : null;
                  const licenseExpiringSoon = d.licenseExpiry && isBefore(parseISO(d.licenseExpiry), addMonths(new Date(), 2));
                  return (
                    <tr key={d.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                            {d.firstName?.[0]}{d.lastName?.[0]}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600 }}>{d.firstName} {d.lastName}</div>
                            {vehicle && <div style={{ fontSize: 11, color: 'var(--accent)' }}>🚗 {vehicle.brand} {vehicle.model}</div>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-2)' }}><Phone size={11} /> {d.phone}</div>
                        {d.email && <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}><Mail size={11} /> {d.email}</div>}
                      </td>
                      <td>
                        <span className="badge badge-neutral">{d.license || 'B'}</span>
                        {d.licenseExpiry && (
                          <div style={{ fontSize: 10, color: licenseExpiringSoon ? 'var(--danger)' : 'var(--text-3)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 3 }}>
                            {licenseExpiringSoon && <AlertTriangle size={10} />}
                            Exp. {format(parseISO(d.licenseExpiry), 'dd/MM/yyyy')}
                          </div>
                        )}
                      </td>
                      <td style={{ fontSize: 12 }}>
                        {d.dailyRate > 0 && <div style={{ color: 'var(--text-2)' }}>{d.dailyRate.toLocaleString('fr-DZ')} DA/jour</div>}
                        {d.salary > 0 && <div style={{ color: 'var(--text-3)', fontSize: 11, marginTop: 2 }}>{d.salary.toLocaleString('fr-DZ')} DA/mois</div>}
                        {!d.dailyRate && !d.salary && <span style={{ color: 'var(--text-3)' }}>—</span>}
                      </td>
                      <td>
                        <div style={{ fontWeight: 700, fontSize: 16 }}>{driverRes.length}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>course{driverRes.length > 1 ? 's' : ''}</div>
                      </td>
                      <td>
                        <span className={`badge ${d.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                          {d.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="action-btn" title="Voir" onClick={() => setSelected(d)}><Eye size={14} /></button>
                          <button className="action-btn" title="Modifier" onClick={() => setEditing(d)}>
                            <Pencil size={14} style={{ color: 'var(--primary)' }} />
                          </button>
                          <button className="action-btn" title="Supprimer" onClick={async () => {
                            if (confirm(`Supprimer le chauffeur ${d.firstName} ${d.lastName} ?`)) {
                              try { await removeDriver(d.id); } catch (err) { alert('Erreur : ' + err.message); }
                            }
                          }}>
                            <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && <DriverFormModal onClose={() => setShowAdd(false)} onSave={async (data) => {
        try { await addDriver(data); setShowAdd(false); } catch (err) { alert('Erreur : ' + err.message); }
      }} />}
      {selected && <DriverDetailModal driver={selected} onClose={() => setSelected(null)} onEdit={() => { setEditing(selected); setSelected(null); }} />}
      {editing && <DriverFormModal driver={editing} onClose={() => setEditing(null)} onSave={async (data) => {
        try { await patchDriver(editing.id, data); setEditing(null); } catch (err) { alert('Erreur : ' + err.message); }
      }} />}
    </div>
  );
}

function DriverFormModal({ driver, onClose, onSave }) {
  const isEdit = !!driver;
  const [form, setForm] = useState({
    firstName: driver?.firstName || '',
    lastName: driver?.lastName || '',
    phone: driver?.phone || '',
    email: driver?.email || '',
    address: driver?.address || '',
    birthDate: driver?.birthDate || '',
    license: driver?.license || 'B',
    licenseNumber: driver?.licenseNumber || '',
    licenseExpiry: driver?.licenseExpiry || '',
    dailyRate: driver?.dailyRate || 0,
    salary: driver?.salary || 0,
    notes: driver?.notes || '',
    status: driver?.status || 'active',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async () => {
    if (!form.firstName || !form.lastName || !form.phone) {
      alert('Prénom, nom et téléphone sont obligatoires');
      return;
    }
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <Modal title={isEdit ? `Modifier ${driver.firstName} ${driver.lastName}` : 'Nouveau chauffeur'} onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
      </>
    }>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Prénom *</label><input className="form-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Nom *</label><input className="form-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Téléphone *</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0555 12 34 56" /></div>
        <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Adresse</label><input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Date de naissance</label><input className="form-input" type="date" value={form.birthDate || ''} onChange={e => set('birthDate', e.target.value)} /></div>
      </div>

      <div style={{ marginTop: 8, marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
        Permis de conduire
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Catégorie</label>
          <select className="form-select" value={form.license} onChange={e => set('license', e.target.value)}>
            {['B', 'C', 'D', 'E', 'B+E', 'C+E'].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">N° permis</label><input className="form-input" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">Date d'expiration du permis</label><input className="form-input" type="date" value={form.licenseExpiry || ''} onChange={e => set('licenseExpiry', e.target.value)} /></div>

      <div style={{ marginTop: 8, marginBottom: 12, fontSize: 11, fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-3)' }}>
        Rémunération
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Tarif journalier (DA)</label><input className="form-input" type="number" min="0" value={form.dailyRate} onChange={e => set('dailyRate', parseInt(e.target.value) || 0)} /></div>
        <div className="form-group"><label className="form-label">Salaire mensuel (DA)</label><input className="form-input" type="number" min="0" value={form.salary} onChange={e => set('salary', parseInt(e.target.value) || 0)} /></div>
      </div>

      <div className="form-group"><label className="form-label">Notes</label><textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Disponibilité, spécialités, langues parlées..." /></div>

      {isEdit && (
        <div className="form-group"><label className="form-label">Statut</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="active">Actif</option>
            <option value="inactive">Inactif</option>
          </select>
        </div>
      )}
    </Modal>
  );
}

function DriverDetailModal({ driver: d, onClose, onEdit }) {
  const { reservations, vehicles } = useApp();
  const driverRes = reservations.filter(r => r.driverId === d.id).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  const statusMap = { active: { cls: 'badge-success', label: 'Active' }, upcoming: { cls: 'badge-accent', label: 'À venir' }, completed: { cls: 'badge-neutral', label: 'Terminée' }, cancelled: { cls: 'badge-danger', label: 'Annulée' } };
  const licenseExpiringSoon = d.licenseExpiry && isBefore(parseISO(d.licenseExpiry), addMonths(new Date(), 2));

  return (
    <Modal title={`${d.firstName} ${d.lastName}`} onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>Fermer</button>
        {onEdit && <button className="btn btn-primary" onClick={onEdit}><Pencil size={14} /> Modifier</button>}
      </>
    }>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0 20px', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--primary), var(--accent))', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontSize: 20 }}>
          {d.firstName?.[0]}{d.lastName?.[0]}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{d.firstName} {d.lastName}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>
            Chauffeur depuis {d.createdAt ? format(parseISO(d.createdAt), 'MMMM yyyy', { locale: fr }) : '—'}
          </div>
        </div>
        <span className={`badge ${d.status === 'active' ? 'badge-success' : 'badge-neutral'}`} style={{ marginLeft: 'auto' }}>{d.status === 'active' ? 'Actif' : 'Inactif'}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        <DetailRow icon={<Phone size={13} />} value={d.phone} />
        <DetailRow icon={<Mail size={13} />} value={d.email || '—'} />
        <DetailRow icon={<MapPin size={13} />} value={d.address || '—'} />
        <DetailRow icon={<Calendar size={13} />} value={d.birthDate ? format(parseISO(d.birthDate), 'dd MMM yyyy', { locale: fr }) : '—'} />
        <DetailRow icon={<IdCard size={13} />} value={`Permis ${d.license || 'B'} ${d.licenseNumber ? '— ' + d.licenseNumber : ''}`} />
        <DetailRow
          icon={<AlertTriangle size={13} style={licenseExpiringSoon ? { color: 'var(--danger)' } : undefined} />}
          value={d.licenseExpiry ? `Exp. ${format(parseISO(d.licenseExpiry), 'dd/MM/yyyy')}` : 'Pas d\'expiration'}
          danger={licenseExpiringSoon}
        />
      </div>

      {(d.dailyRate > 0 || d.salary > 0) && (
        <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
          {d.dailyRate > 0 && (
            <div style={{ flex: 1, background: 'var(--primary-soft)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--primary)' }}>{d.dailyRate.toLocaleString('fr-DZ')} DA</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Tarif journalier</div>
            </div>
          )}
          {d.salary > 0 && (
            <div style={{ flex: 1, background: 'var(--success-soft)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{d.salary.toLocaleString('fr-DZ')} DA</div>
              <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Salaire mensuel</div>
            </div>
          )}
        </div>
      )}

      {d.notes && (
        <div style={{ padding: 12, background: 'var(--bg-2)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)', marginBottom: 16, whiteSpace: 'pre-wrap' }}>
          {d.notes}
        </div>
      )}

      {driverRes.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', marginBottom: 10 }}>HISTORIQUE DES COURSES</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {driverRes.map(r => {
              const v = vehicles.find(vv => vv.id === r.vehicleId);
              const s = statusMap[r.status] || { cls: 'badge-neutral', label: r.status };
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{v?.brand} {v?.model}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.startDate} → {r.endDate}</div>
                  </div>
                  <span className={`badge ${s.cls}`} style={{ fontSize: 10 }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}

function DetailRow({ icon, value, danger }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 8,
      padding: '8px 12px', background: danger ? 'var(--danger-soft)' : 'var(--bg-2)',
      borderRadius: 8, fontSize: 12, color: danger ? 'var(--danger)' : 'var(--text-2)',
    }}>
      {icon} {value}
    </div>
  );
}
