import { useState } from 'react';
import { Plus, Search, Eye, Edit, FileText, CalendarDays, DollarSign, Printer, Play, Pencil, Trash2, FileSignature } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../context/LanguageContext';
import Modal from '../components/Modal';
import InvoiceModal from '../components/InvoiceModal';
import ContractModal from '../components/ContractModal';
import ClientAutocomplete from '../components/ClientAutocomplete';
import { differenceInDays, format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';

const statusMap = {
  active: { cls: 'badge-success', label: 'res.active' },
  upcoming: { cls: 'badge-accent', label: 'res.upcoming' },
  completed: { cls: 'badge-neutral', label: 'res.completed' },
  cancelled: { cls: 'badge-danger', label: 'res.cancelled' },
};

export default function Reservations() {
  const { reservations, vehicles, clients, addReservation, updateReservation, removeReservation } = useApp();
  const { t } = useT();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [invoice, setInvoice]   = useState(null);
  const [contract, setContract] = useState(null);
  const [editing, setEditing]   = useState(null);

  const handleDelete = async (r) => {
    if (!confirm(`Supprimer la réservation #${r.displayId || r.id} ?\nCette action est irréversible.`)) return;
    try { await removeReservation(r.id); }
    catch (e) { alert('Erreur : ' + e.message); }
  };

  const filtered = reservations.filter(r => {
    const client = clients.find(c => c.id === r.clientId);
    const vehicle = vehicles.find(v => v.id === r.vehicleId);
    const matchSearch = `${client?.firstName} ${client?.lastName} ${vehicle?.brand} ${vehicle?.model}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tous' || r.status === statusFilter;
    return matchSearch && matchStatus;
  }).sort((a, b) => (b.displayId || b.id) - (a.displayId || a.id));

  const totalRevenue = reservations.filter(r => r.status !== 'cancelled').reduce((s, r) => s + r.paidAmount, 0);
  const pendingPayment = reservations.filter(r => r.status === 'active').reduce((s, r) => s + (r.totalPrice - r.paidAmount), 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('res.title')}</h1>
          <p className="page-subtitle">{reservations.length} {t('res.totalCount')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> {t('res.addNew')}
        </button>
      </div>

      {/* KPIs */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { icon: <FileText size={14} />, label: t('client.actives'), value: reservations.filter(r => r.status === 'active').length, color: 'var(--success)' },
          { icon: <CalendarDays size={14} />, label: t('res.upcoming'), value: reservations.filter(r => r.status === 'upcoming').length, color: 'var(--accent)' },
          { icon: <DollarSign size={14} />, label: t('res.encaisse'), value: totalRevenue.toLocaleString('fr-DZ') + ' DA', color: 'var(--primary)' },
          { icon: <DollarSign size={14} />, label: t('res.remaining'), value: pendingPayment.toLocaleString('fr-DZ') + ' DA', color: 'var(--danger)' },
        ].map(s => (
          <div key={s.label} style={{ padding: '10px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}>
            <span style={{ color: s.color }}>{s.icon}</span>
            <span style={{ color: 'var(--text-3)' }}>{s.label}:</span>
            <strong>{s.value}</strong>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('res.searchPh')} />
        </div>
        <div className="filter-group">
          {['Tous', 'active', 'upcoming', 'completed', 'cancelled'].map(s => (
            <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s === 'Tous' ? t('action.all') : t(statusMap[s]?.label)}
            </button>
          ))}
        </div>
      </div>

      <div className="card admin-table-card">
        <div className="admin-table-wrap">
          <table>
            <thead>
              <tr>
                <th className="hide-mobile">#</th>
                <th>{t('res.client')}</th>
                <th className="hide-mobile">{t('res.vehicle')}</th>
                <th className="hide-mobile">Période</th>
                <th className="hide-mobile">{t('res.duration')}</th>
                <th className="hide-mobile">{t('res.total')}</th>
                <th className="hide-mobile">{t('res.paid')}</th>
                <th>{t('veh.status')}</th>
                <th className="hide-mobile">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => {
                const client = clients.find(c => c.id === r.clientId);
                const vehicle = vehicles.find(v => v.id === r.vehicleId);
                const days = differenceInDays(parseISO(r.endDate), parseISO(r.startDate));
                const remaining = r.totalPrice - r.paidAmount;
                return (
                  <tr key={r.id} className="admin-row-clickable" onClick={() => setSelected(r)} style={{ cursor: 'pointer' }}>
                    <td className="hide-mobile" style={{ fontWeight: 700, color: 'var(--text-3)' }}>#{r.displayId || r.id}</td>
                    <td>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          <span style={{ color: 'var(--text-3)', fontWeight: 700, marginRight: 6 }}>#{r.displayId || r.id}</span>
                          {client?.firstName} {client?.lastName}
                        </div>
                        <div className="show-mobile" style={{ fontSize: 11, color: 'var(--text-3)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          🚗 {vehicle?.brand} {vehicle?.model} · {format(parseISO(r.startDate), 'dd/MM')}→{format(parseISO(r.endDate), 'dd/MM')}
                        </div>
                      </div>
                    </td>
                    <td className="hide-mobile">
                      <div style={{ fontWeight: 600 }}>{vehicle?.brand} {vehicle?.model}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{vehicle?.plate}</div>
                    </td>
                    <td className="hide-mobile">
                      <div style={{ fontSize: 12 }}>{format(parseISO(r.startDate), 'dd/MM/yyyy')}</div>
                      <div style={{ fontSize: 12, color: 'var(--text-3)' }}>→ {format(parseISO(r.endDate), 'dd/MM/yyyy')}</div>
                    </td>
                    <td className="hide-mobile" style={{ fontWeight: 600 }}>{days}j</td>
                    <td className="hide-mobile" style={{ fontWeight: 700 }}>{r.totalPrice.toLocaleString('fr-DZ')} DA</td>
                    <td className="hide-mobile">
                      <div style={{ fontWeight: 600, color: remaining > 0 ? 'var(--danger)' : 'var(--success)' }}>
                        {r.paidAmount.toLocaleString('fr-DZ')} DA
                      </div>
                      {remaining > 0 && <div style={{ fontSize: 11, color: 'var(--danger)' }}>-{remaining.toLocaleString('fr-DZ')} DA</div>}
                    </td>
                    <td><span className={`badge ${statusMap[r.status]?.cls}`}>{t(statusMap[r.status]?.label)}</span></td>
                    <td className="hide-mobile">
                      <div className="actions-cell" style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
                        <button className="action-btn" title={t('action.view')} onClick={() => setSelected(r)}><Eye size={14} /></button>
                        <button
                          title="Contrat de location"
                          onClick={() => setContract(r)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', borderRadius: 6,
                            background: 'rgba(59,130,246,0.10)', border: '1px solid rgba(59,130,246,0.35)',
                            color: 'var(--accent)', cursor: 'pointer',
                            fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                          }}
                        >
                          <FileSignature size={12} /> Contrat
                        </button>
                        <button
                          title={t('res.invoice')}
                          onClick={() => setInvoice(r)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 4,
                            padding: '5px 10px', borderRadius: 6,
                            background: 'var(--primary-soft)', border: '1px solid rgba(245,158,11,0.35)',
                            color: 'var(--primary)', cursor: 'pointer',
                            fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
                          }}
                        >
                          <Printer size={12} /> {t('res.invoice')}
                        </button>
                        {r.status === 'upcoming' && (
                          <>
                            <button className="action-btn" title={t('action.edit')} onClick={() => setEditing(r)}>
                              <Pencil size={14} style={{ color: 'var(--accent)' }} />
                            </button>
                            <button className="action-btn" title={t('action.activate')} onClick={() => updateReservation(r.id, { status: 'active' })}>
                              <Play size={14} style={{ color: 'var(--success)' }} />
                            </button>
                          </>
                        )}
                        {(r.status === 'upcoming' || r.status === 'cancelled') && (
                          <button className="action-btn" title={t('action.delete')} onClick={() => handleDelete(r)}>
                            <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <AddReservationModal onClose={() => setShowAdd(false)} />}
      {selected && <ReservationDetailModal
        reservation={selected}
        onClose={() => setSelected(null)}
        onPrint={() => { setInvoice(selected); setSelected(null); }}
        onContract={() => { setContract(selected); setSelected(null); }}
        onEdit={() => { setEditing(selected); setSelected(null); }}
        onActivate={async () => {
          try { await updateReservation(selected.id, { status: 'active' }); setSelected(null); }
          catch (err) { alert('Erreur : ' + err.message); }
        }}
        onDelete={async () => { await handleDelete(selected); setSelected(null); }}
      />}
      {invoice && <InvoiceModal reservation={invoice} onClose={() => setInvoice(null)} />}
      {contract && <ContractModal reservation={contract} onClose={() => setContract(null)} />}
      {editing && <EditReservationModal
        reservation={editing}
        onClose={() => setEditing(null)}
        onSave={async (data) => {
          try { await updateReservation(editing.id, data); setEditing(null); }
          catch (e) { alert('Erreur : ' + e.message); }
        }}
      />}
    </div>
  );
}

function EditReservationModal({ reservation: r, onClose, onSave }) {
  const { clients, vehicles } = useApp();
  const { t } = useT();
  const client  = clients.find(c => c.id === r.clientId);
  const vehicle = vehicles.find(v => v.id === r.vehicleId);

  const [form, setForm] = useState({
    startDate: r.startDate ? r.startDate.split('T')[0] : '',
    endDate:   r.endDate ? r.endDate.split('T')[0] : '',
    paidAmount:    r.paidAmount || 0,
    deposit:       r.deposit || 0,
    paymentMethod: r.paymentMethod || 'Espèces',
    kmLimit:       r.kmLimit || 200,
    extraKmPrice:  r.extraKmPrice || 50,
    notes:         r.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const days = form.startDate && form.endDate
    ? Math.max(0, differenceInDays(parseISO(form.endDate), parseISO(form.startDate)))
    : 0;
  const newTotal = vehicle ? days * vehicle.pricePerDay : r.totalPrice;

  const handleSubmit = async () => {
    if (!form.startDate || !form.endDate) return alert('Dates obligatoires');
    if (new Date(form.endDate) <= new Date(form.startDate)) return alert('La date de retour doit être après le départ');
    setSaving(true);
    await onSave({
      startDate: form.startDate,
      endDate: form.endDate,
      paidAmount: +form.paidAmount || 0,
      deposit: +form.deposit || 0,
      paymentMethod: form.paymentMethod,
      kmLimit: +form.kmLimit || 200,
      extraKmPrice: +form.extraKmPrice || 50,
      notes: form.notes,
    });
    setSaving(false);
  };

  return (
    <Modal title={`Modifier la réservation #${r.displayId || r.id}`} onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>{t('action.cancel')}</button>
        <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
          {saving ? t('action.saving') : t('action.save')}
        </button>
      </>
    }>
      <div style={{ padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 8, marginBottom: 14, fontSize: 12, color: 'var(--text-2)' }}>
        <div>👤 <strong>{client?.firstName} {client?.lastName}</strong> · {client?.phone}</div>
        <div>🚗 <strong>{vehicle?.brand} {vehicle?.model}</strong> · {vehicle?.plate} · {vehicle?.pricePerDay?.toLocaleString('fr-DZ')} DA/j</div>
      </div>

      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('res.startDate') + ' *'}</label><input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">{t('res.endDate') + ' *'}</label><input className="form-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
      </div>

      {days > 0 && (
        <div style={{ padding: '10px 14px', background: 'var(--primary-soft)', borderRadius: 8, marginBottom: 14, fontSize: 13 }}>
          <span style={{ color: 'var(--text-2)' }}>{days} jour{days > 1 ? 's' : ''} × {vehicle?.pricePerDay?.toLocaleString('fr-DZ')} DA = </span>
          <strong style={{ color: 'var(--primary)' }}>{newTotal.toLocaleString('fr-DZ')} DA</strong>
        </div>
      )}

      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('res.payment')}</label>
          <select className="form-select" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
            {['Espèces', 'CCP', 'Virement', 'Carte bancaire', 'Chèque'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">{t('res.deposit') + ' (DA)'}</label><input className="form-input" type="number" value={form.deposit} onChange={e => set('deposit', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('res.paid') + ' (DA)'}</label><input className="form-input" type="number" value={form.paidAmount} onChange={e => set('paidAmount', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">{t('res.kmAllowed')}</label><input className="form-input" type="number" value={form.kmLimit} onChange={e => set('kmLimit', e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">{t('res.kmExtra') + ' (DA)'}</label><input className="form-input" type="number" value={form.extraKmPrice} onChange={e => set('extraKmPrice', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">{t('res.notes')}</label><textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
    </Modal>
  );
}

function AddReservationModal({ onClose }) {
  const { clients, vehicles, drivers, addReservation } = useApp();
  const { t } = useT();
  const [form, setForm] = useState({ clientId: '', vehicleId: '', driverId: '', startDate: '', endDate: '', paymentMethod: 'Espèces', deposit: '', paidAmount: '', kmLimit: 200, extraKmPrice: 50, notes: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const vehicle = vehicles.find(v => v.id === +form.vehicleId);
  const days = form.startDate && form.endDate ? differenceInDays(parseISO(form.endDate), parseISO(form.startDate)) : 0;
  const total = vehicle ? days * vehicle.pricePerDay : 0;

  const handleSubmit = () => {
    if (!form.clientId || !form.vehicleId || !form.startDate || !form.endDate) return;
    addReservation({
      clientId: +form.clientId, vehicleId: +form.vehicleId,
      driverId: form.driverId ? +form.driverId : null,
      startDate: form.startDate, endDate: form.endDate,
      status: 'upcoming', totalPrice: total,
      paidAmount: +form.paidAmount || 0,
      deposit: +form.deposit || 0,
      paymentMethod: form.paymentMethod, notes: form.notes,
      kmLimit: +form.kmLimit || 200,
      extraKmPrice: +form.extraKmPrice || 50,
    });
    onClose();
  };

  return (
    <Modal title={t('res.addNew')} onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>{t('action.cancel')}</button>
        <button className="btn btn-primary" onClick={handleSubmit}>Créer</button>
      </>
    }>
      <div className="form-group">
        <label className="form-label">{t('res.client') + ' *'}</label>
        <ClientAutocomplete clients={clients} value={form.clientId} onChange={(id) => set('clientId', id)} />
      </div>
      <div className="form-group">
        <label className="form-label">{t('res.vehicle') + ' *'}</label>
        <select className="form-select" value={form.vehicleId} onChange={e => set('vehicleId', e.target.value)}>
          <option value="">{t('action.select')}</option>
          {vehicles.filter(v => v.status === 'available').map(v => (
            <option key={v.id} value={v.id}>{v.brand} {v.model} — {v.pricePerDay.toLocaleString()} DA/j</option>
          ))}
        </select>
      </div>
      {drivers && drivers.length > 0 && (
        <div className="form-group">
          <label className="form-label">Chauffeur (optionnel)</label>
          <select className="form-select" value={form.driverId} onChange={e => set('driverId', e.target.value)}>
            <option value="">— Sans chauffeur —</option>
            {drivers.filter(d => d.status === 'active').map(d => (
              <option key={d.id} value={d.id}>
                {d.firstName} {d.lastName}{d.dailyRate > 0 ? ` — ${d.dailyRate.toLocaleString()} DA/j` : ''}
              </option>
            ))}
          </select>
        </div>
      )}
      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('res.startDate') + ' *'}</label><input className="form-input" type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">{t('res.endDate') + ' *'}</label><input className="form-input" type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)} /></div>
      </div>
      {total > 0 && (
        <div style={{ padding: '12px 16px', background: 'var(--primary-soft)', borderRadius: 8, marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>{days} jours × {vehicle?.pricePerDay.toLocaleString()} DA</span>
          <strong style={{ color: 'var(--primary)', fontSize: 16 }}>{total.toLocaleString('fr-DZ')} DA</strong>
        </div>
      )}
      {/* Kilométrage */}
      <div style={{ padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 8, marginBottom: 16, border: '1px solid var(--border)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          📏 Limite kilométrique
        </div>
        <div className="form-row" style={{ marginBottom: 0 }}>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('res.kmAllowed')}</label>
            <input className="form-input" type="number" value={form.kmLimit} onChange={e => set('kmLimit', e.target.value)} placeholder="200" />
          </div>
          <div className="form-group" style={{ marginBottom: 0 }}>
            <label className="form-label">{t('res.kmExtra') + ' (DA)'}</label>
            <input className="form-input" type="number" value={form.extraKmPrice} onChange={e => set('extraKmPrice', e.target.value)} placeholder="50" />
          </div>
        </div>
        {form.kmLimit && form.extraKmPrice && (
          <div style={{ marginTop: 8, fontSize: 12, color: 'var(--text-3)' }}>
            Chaque km au-delà de <strong style={{ color: 'var(--text-2)' }}>{(+form.kmLimit).toLocaleString()} km</strong> sera facturé <strong style={{ color: 'var(--primary)' }}>{(+form.extraKmPrice).toLocaleString()} DA/km</strong>
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t('res.payment')}</label>
          <select className="form-select" value={form.paymentMethod} onChange={e => set('paymentMethod', e.target.value)}>
            {['Espèces', 'Virement', 'CCP', 'Chèque'].map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">{t('res.deposit') + ' (DA)'}</label><input className="form-input" type="number" value={form.deposit} onChange={e => set('deposit', e.target.value)} /></div>
      </div>
      <div className="form-group"><label className="form-label">{t('res.paid') + ' (DA)'}</label><input className="form-input" type="number" value={form.paidAmount} onChange={e => set('paidAmount', e.target.value)} /></div>
      <div className="form-group"><label className="form-label">{t('res.notes')}</label><textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
    </Modal>
  );
}

function ReservationDetailModal({ reservation: r, onClose, onPrint, onContract, onEdit, onActivate, onDelete }) {
  const { clients, vehicles } = useApp();
  const { t } = useT();
  const client = clients.find(c => c.id === r.clientId);
  const vehicle = vehicles.find(v => v.id === r.vehicleId);
  const days = differenceInDays(parseISO(r.endDate), parseISO(r.startDate));
  const isUpcoming  = r.status === 'upcoming';
  const isCancelled = r.status === 'cancelled';

  return (
    <Modal title={`Réservation #${r.displayId || r.id}`} onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>{t('action.close')}</button>
        <button className="btn btn-primary" onClick={onPrint}>
          <Printer size={14} /> {t('res.invoice')}
        </button>
      </>
    }>
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <span className={`badge ${statusMap[r.status]?.cls}`}>{t(statusMap[r.status]?.label)}</span>
        <span className="badge badge-neutral">{r.paymentMethod || 'Non défini'}</span>
      </div>

      {/* Boutons d'actions rapides (toutes plateformes — utile sur mobile) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 18 }}>
        {isUpcoming && onActivate && (
          <button onClick={onActivate}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'var(--success)', color: '#fff', fontWeight: 700, fontSize: 13, minHeight: 42,
            }}>
            <Play size={14} /> Activer
          </button>
        )}
        {onContract && (
          <button onClick={onContract}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(59,130,246,0.35)', cursor: 'pointer',
              background: 'rgba(59,130,246,0.10)', color: 'var(--accent)', fontWeight: 700, fontSize: 13, minHeight: 42,
            }}>
            <FileSignature size={14} /> Contrat
          </button>
        )}
        {isUpcoming && onEdit && (
          <button onClick={onEdit}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', cursor: 'pointer',
              background: 'var(--surface)', color: 'var(--text)', fontWeight: 600, fontSize: 13, minHeight: 42,
            }}>
            <Pencil size={14} /> Modifier
          </button>
        )}
        {(isUpcoming || isCancelled) && onDelete && (
          <button onClick={onDelete}
            style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(239,68,68,0.35)', cursor: 'pointer',
              background: 'var(--danger-soft)', color: 'var(--danger)', fontWeight: 700, fontSize: 13, minHeight: 42,
            }}>
            <Trash2 size={14} /> Supprimer
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        <InfoBox label={t('res.client')} value={`${client?.firstName} ${client?.lastName}`} sub={client?.phone} />
        <InfoBox label={t('res.vehicle')} value={`${vehicle?.brand} ${vehicle?.model}`} sub={vehicle?.plate} />
        <InfoBox label={t('res.startDate')} value={format(parseISO(r.startDate), 'dd MMMM yyyy', { locale: fr })} />
        <InfoBox label={t('res.endDate')} value={format(parseISO(r.endDate), 'dd MMMM yyyy', { locale: fr })} />
        <InfoBox label={t('res.duration')} value={`${days} jours`} />
        <InfoBox label={t('res.deposit')} value={`${(r.deposit || 0).toLocaleString('fr-DZ')} DA`} />
        {r.kmLimit && <InfoBox label={t('res.kmAllowed')} value={`${r.kmLimit.toLocaleString()} km`} />}
        {r.extraKmPrice && <InfoBox label={t('res.kmExtra')} value={`${r.extraKmPrice.toLocaleString()} DA/km`} />}
      </div>

      <div style={{ padding: '14px 16px', background: 'var(--surface-2)', borderRadius: 10, marginBottom: 12 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--text-2)' }}>
          <span>{t('res.total')}</span><strong style={{ color: 'var(--text)' }}>{r.totalPrice.toLocaleString('fr-DZ')} DA</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-2)' }}>
          <span>{t('res.paid')}</span><strong style={{ color: 'var(--success)' }}>{r.paidAmount.toLocaleString('fr-DZ')} DA</strong>
        </div>
        {r.totalPrice - r.paidAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginTop: 8, color: 'var(--danger)', fontWeight: 600 }}>
            <span>{t('res.remaining')}</span><span>{(r.totalPrice - r.paidAmount).toLocaleString('fr-DZ')} DA</span>
          </div>
        )}
      </div>
      {r.notes && <div style={{ padding: '10px 14px', background: 'var(--bg-2)', borderRadius: 8, fontSize: 12, color: 'var(--text-2)' }}>📝 {r.notes}</div>}
    </Modal>
  );
}

function InfoBox({ label, value, sub }) {
  return (
    <div style={{ background: 'var(--bg-2)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontWeight: 600 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{sub}</div>}
    </div>
  );
}
