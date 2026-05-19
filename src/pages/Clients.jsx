import { useState } from 'react';
import { Plus, Search, Eye, Phone, Mail, MapPin, User, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../context/LanguageContext';
import Modal from '../components/Modal';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function Clients() {
  const { clients, addClient, patchClient, reservations, vehicles } = useApp();
  const { t } = useT();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('Tous');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [editing, setEditing] = useState(null);

  const filtered = clients.filter(c => {
    const matchSearch = `${c.firstName} ${c.lastName} ${c.phone} ${c.email}`.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === 'Tous' || c.status === (filter === 'Actifs' ? 'active' : 'inactive');
    return matchSearch && matchFilter;
  });

  const filterLabels = { 'Tous': t('action.all'), 'Actifs': t('client.actives'), 'Inactifs': t('client.inactives') };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('cli.title')}</h1>
          <p className="page-subtitle">{clients.length} {t('cli.registered')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> {t('cli.addNew')}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('cli.searchPh')} />
        </div>
        <div className="filter-group">
          {['Tous', 'Actifs', 'Inactifs'].map(f => (
            <button key={f} className={`filter-btn ${filter === f ? 'active' : ''}`} onClick={() => setFilter(f)}>{filterLabels[f]}</button>
          ))}
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>{t('res.client')}</th>
                <th>{t('cli.contact')}</th>
                <th>{t('cli.address')}</th>
                <th>{t('cli.license')}</th>
                <th>{t('cli.rentals')}</th>
                <th>{t('cli.memberSince')}</th>
                <th>{t('veh.status')}</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => {
                const clientRes = reservations.filter(r => r.clientId === c.id);
                const activeRes = clientRes.find(r => r.status === 'active');
                const vehicle = activeRes ? vehicles.find(v => v.id === activeRes.vehicleId) : null;
                return (
                  <tr key={c.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
                          {c.firstName[0]}{c.lastName[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 600 }}>{c.firstName} {c.lastName}</div>
                          {vehicle && <div style={{ fontSize: 11, color: 'var(--accent)' }}>🚗 {vehicle.brand} {vehicle.model}</div>}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-2)' }}><Phone size={11} /> {c.phone}</div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}><Mail size={11} /> {c.email}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={11} /> {c.address}</div>
                    </td>
                    <td><span className="badge badge-neutral">{c.license}</span></td>
                    <td>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{c.totalRentals}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>location{c.totalRentals > 1 ? 's' : ''}</div>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                      {format(parseISO(c.joinedDate), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-neutral'}`}>
                        {c.status === 'active' ? t('client.active') : t('client.inactive')}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="action-btn" title={t('action.view')} onClick={() => setSelected(c)}><Eye size={14} /></button>
                        <button className="action-btn" title={t('action.edit')} onClick={() => setEditing(c)}>
                          <Pencil size={14} style={{ color: 'var(--primary)' }} />
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

      {showAdd && <AddClientModal onClose={() => setShowAdd(false)} onAdd={c => { addClient(c); setShowAdd(false); }} />}
      {selected && <ClientDetailModal client={selected} onClose={() => setSelected(null)} onEdit={() => { setEditing(selected); setSelected(null); }} />}
      {editing && <EditClientModal client={editing} onClose={() => setEditing(null)} onSave={async (data) => {
        try { await patchClient(editing.id, data); setEditing(null); }
        catch (err) { alert('Erreur : ' + err.message); }
      }} />}
    </div>
  );
}

function AddClientModal({ onClose, onAdd }) {
  const { t } = useT();
  const [form, setForm] = useState({ firstName: '', lastName: '', phone: '', email: '', address: '', license: 'B', licenseNumber: '', joinedDate: new Date().toISOString().split('T')[0] });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title={t('cli.addNew')} onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>{t('action.cancel')}</button>
        <button className="btn btn-primary" onClick={() => onAdd(form)}>{t('action.save')}</button>
      </>
    }>
      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('cli.firstName') + ' *'}</label><input className="form-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">{t('cli.lastName') + ' *'}</label><input className="form-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('cli.phone') + ' *'}</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="0555 12 34 56" /></div>
        <div className="form-group"><label className="form-label">{t('cli.email')}</label><input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">{t('cli.address')}</label><input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('cli.license')}</label>
          <select className="form-select" value={form.license} onChange={e => set('license', e.target.value)}>
            {['B', 'C', 'D', 'E'].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">{t('cli.licenseNum')}</label><input className="form-input" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} /></div>
      </div>
    </Modal>
  );
}

function EditClientModal({ client, onClose, onSave }) {
  const { t } = useT();
  const [form, setForm] = useState({
    firstName: client.firstName || '',
    lastName: client.lastName || '',
    phone: client.phone || '',
    email: client.email || '',
    address: client.address || '',
    license: client.license || 'B',
    licenseNumber: client.licenseNumber || '',
    status: client.status || 'active',
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
    <Modal title={`${t('cli.editTitle')} ${client.firstName} ${client.lastName}`} onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>{t('action.cancel')}</button>
        <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
          {saving ? t('action.saving') : t('action.save')}
        </button>
      </>
    }>
      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('cli.firstName') + ' *'}</label><input className="form-input" value={form.firstName} onChange={e => set('firstName', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">{t('cli.lastName') + ' *'}</label><input className="form-input" value={form.lastName} onChange={e => set('lastName', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('cli.phone') + ' *'}</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">{t('cli.email')}</label><input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">{t('cli.address')}</label><input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} /></div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('cli.license')}</label>
          <select className="form-select" value={form.license} onChange={e => set('license', e.target.value)}>
            {['B', 'C', 'D', 'E'].map(l => <option key={l}>{l}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">{t('cli.licenseNum')}</label><input className="form-input" value={form.licenseNumber} onChange={e => set('licenseNumber', e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">{t('veh.status')}</label>
        <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="active">{t('client.active')}</option>
          <option value="inactive">{t('client.inactive')}</option>
        </select>
      </div>
    </Modal>
  );
}

function ClientDetailModal({ client: c, onClose, onEdit }) {
  const { reservations, vehicles } = useApp();
  const { t } = useT();
  const clientRes = reservations.filter(r => r.clientId === c.id).sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  const totalSpent = clientRes.reduce((s, r) => s + r.paidAmount, 0);

  const statusMap = { active: { cls: 'badge-success', label: 'res.active' }, upcoming: { cls: 'badge-accent', label: 'res.upcoming' }, completed: { cls: 'badge-neutral', label: 'res.completed' } };

  return (
    <Modal title={`${c.firstName} ${c.lastName}`} onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>{t('action.close')}</button>
        {onEdit && <button className="btn btn-primary" onClick={onEdit}><Pencil size={14} /> {t('cli.editInfo')}</button>}
      </>
    }>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '16px 0 20px', borderBottom: '1px solid var(--border)', marginBottom: 20 }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--purple))', display: 'grid', placeItems: 'center', color: 'white', fontWeight: 700, fontSize: 20 }}>
          {c.firstName[0]}{c.lastName[0]}
        </div>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>{c.firstName} {c.lastName}</div>
          <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 4 }}>Client depuis {format(parseISO(c.joinedDate), 'MMMM yyyy', { locale: fr })}</div>
        </div>
        <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-neutral'}`} style={{ marginLeft: 'auto' }}>{c.status === 'active' ? t('client.active') : t('client.inactive')}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
        {[
          [<Phone size={13} />, c.phone], [<Mail size={13} />, c.email],
          [<MapPin size={13} />, c.address], [<User size={13} />, `Permis ${c.license} — ${c.licenseNumber}`],
        ].map(([icon, val], i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: 'var(--bg-2)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)' }}>
            {icon} {val}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ flex: 1, background: 'var(--primary-soft)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--primary)' }}>{c.totalRentals}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t('cli.rentals')}</div>
        </div>
        <div style={{ flex: 1, background: 'var(--success-soft)', borderRadius: 10, padding: '12px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--success)' }}>{totalSpent.toLocaleString('fr-DZ')}</div>
          <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{t('cli.totalSpent')}</div>
        </div>
      </div>

      {clientRes.length > 0 && (
        <div>
          <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', marginBottom: 10 }}>{t('cli.history').toUpperCase()}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {clientRes.map(r => {
              const v = vehicles.find(vv => vv.id === r.vehicleId);
              const s = statusMap[r.status] || { cls: 'badge-neutral', label: r.status };
              return (
                <div key={r.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 8 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{v?.brand} {v?.model}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.startDate} → {r.endDate}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, fontSize: 13 }}>{r.totalPrice.toLocaleString('fr-DZ')} DA</div>
                    <span className={`badge ${s.cls}`} style={{ fontSize: 10 }}>{statusMap[r.status] ? t(s.label) : s.label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Modal>
  );
}
