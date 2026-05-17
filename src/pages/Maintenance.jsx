import { useState } from 'react';
import { Plus, Search, Wrench, Calendar, Gauge, DollarSign, Trash2, AlertCircle, Car } from 'lucide-react';
import { format, parseISO, isBefore, isAfter, differenceInDays } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

const TYPES = [
  'Vidange',
  'Filtres',
  'Freins',
  'Pneus',
  'Révision',
  'Climatisation',
  'Carrosserie',
  'Moteur',
  'Réparation',
  'Autre',
];

const fmt = (n) => (Number(n) || 0).toLocaleString('fr-DZ');

export default function Maintenance() {
  const { maintenance, vehicles, addMaintenance, removeMaintenance } = useApp();
  const [search, setSearch] = useState('');
  const [filterVehicle, setFilterVehicle] = useState('all');
  const [showAdd, setShowAdd] = useState(false);

  const today = new Date();
  const filtered = maintenance.filter(m => {
    const text = `${m.type} ${m.description || ''} ${m.brand} ${m.model} ${m.plate}`.toLowerCase();
    const matchSearch = text.includes(search.toLowerCase());
    const matchVeh = filterVehicle === 'all' || m.vehicleId === +filterVehicle;
    return matchSearch && matchVeh;
  });

  const totalCost = filtered.reduce((s, m) => s + (m.cost || 0), 0);

  // Alertes : interventions futures dont next_date arrive bientôt
  const upcoming = maintenance
    .filter(m => m.nextDate)
    .map(m => ({ ...m, nextDateParsed: parseISO(m.nextDate) }))
    .filter(m => isAfter(m.nextDateParsed, today) && differenceInDays(m.nextDateParsed, today) <= 30)
    .sort((a, b) => a.nextDateParsed - b.nextDateParsed);

  const overdue = maintenance
    .filter(m => m.nextDate)
    .filter(m => isBefore(parseISO(m.nextDate), today));

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Maintenance</h1>
          <p className="page-subtitle">{maintenance.length} intervention{maintenance.length > 1 ? 's' : ''} enregistrée{maintenance.length > 1 ? 's' : ''}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Nouvelle intervention
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <div style={{ flex: '1 1 200px', background: 'var(--primary-soft)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>Coût total</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--primary)', marginTop: 4 }}>{fmt(totalCost)} DA</div>
        </div>
        <div style={{ flex: '1 1 200px', background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>À planifier (30j)</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--accent)', marginTop: 4 }}>{upcoming.length}</div>
        </div>
        <div style={{ flex: '1 1 200px', background: overdue.length ? 'rgba(239,68,68,0.08)' : 'var(--surface-2)', border: `1px solid ${overdue.length ? 'rgba(239,68,68,0.2)' : 'var(--border)'}`, borderRadius: 12, padding: '14px 18px' }}>
          <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>En retard</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: overdue.length ? 'var(--danger)' : 'var(--text-2)', marginTop: 4 }}>{overdue.length}</div>
        </div>
      </div>

      {/* Alertes interventions à venir */}
      {(upcoming.length > 0 || overdue.length > 0) && (
        <div style={{ marginBottom: 20, padding: 14, background: 'var(--bg-2)', borderRadius: 12, border: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, fontSize: 13, fontWeight: 700, color: 'var(--text-2)' }}>
            <AlertCircle size={14} style={{ color: 'var(--warning)' }} /> Rappels de maintenance
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {overdue.map(m => (
              <div key={`o-${m.id}`} style={{ fontSize: 12, padding: '6px 10px', background: 'rgba(239,68,68,0.1)', borderRadius: 6 }}>
                <strong style={{ color: 'var(--danger)' }}>EN RETARD</strong> · {m.brand} {m.model} ({m.plate}) — {m.type} prévu le {format(parseISO(m.nextDate), 'dd/MM/yyyy')}
              </div>
            ))}
            {upcoming.map(m => (
              <div key={`u-${m.id}`} style={{ fontSize: 12, padding: '6px 10px', background: 'var(--surface-2)', borderRadius: 6 }}>
                <strong style={{ color: 'var(--accent)' }}>Dans {differenceInDays(parseISO(m.nextDate), today)}j</strong> · {m.brand} {m.model} ({m.plate}) — {m.type} prévu le {format(parseISO(m.nextDate), 'dd/MM/yyyy')}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filtres */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 260 }}>
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher par type, véhicule, description..." />
        </div>
        <select className="form-select" style={{ maxWidth: 260 }} value={filterVehicle} onChange={e => setFilterVehicle(e.target.value)}>
          <option value="all">Tous les véhicules</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} — {v.plate}</option>)}
        </select>
      </div>

      {/* Tableau */}
      {filtered.length === 0 ? (
        <div style={{ padding: 60, textAlign: 'center', background: 'var(--bg-2)', borderRadius: 12, border: '1px dashed var(--border)' }}>
          <Wrench size={48} style={{ color: 'var(--text-3)', opacity: 0.4, marginBottom: 16 }} />
          <h3 style={{ color: 'var(--text-2)', margin: '8px 0' }}>Aucune intervention</h3>
          <p style={{ color: 'var(--text-3)', fontSize: 13 }}>
            Cliquez sur <strong>"Nouvelle intervention"</strong> pour enregistrer une opération de maintenance.
          </p>
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Véhicule</th>
                  <th>Type</th>
                  <th>Description</th>
                  <th>Km</th>
                  <th>Coût</th>
                  <th>Prochaine</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontSize: 12 }}>{format(parseISO(m.date), 'dd MMM yyyy', { locale: fr })}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{m.brand} {m.model}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{m.plate}</div>
                    </td>
                    <td><span className="badge badge-warning">{m.type}</span></td>
                    <td style={{ fontSize: 12, color: 'var(--text-2)', maxWidth: 240 }}>{m.description || '—'}</td>
                    <td style={{ fontSize: 12 }}>{m.mileage ? `${fmt(m.mileage)} km` : '—'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{fmt(m.cost)} DA</td>
                    <td style={{ fontSize: 12, color: 'var(--text-3)' }}>
                      {m.nextDate && <div>📅 {format(parseISO(m.nextDate), 'dd/MM/yyyy')}</div>}
                      {m.nextMileage && <div>🛣️ {fmt(m.nextMileage)} km</div>}
                      {!m.nextDate && !m.nextMileage && '—'}
                    </td>
                    <td>
                      <button className="action-btn" title="Supprimer" onClick={async () => {
                        if (!confirm('Supprimer cette intervention ?')) return;
                        try { await removeMaintenance(m.id); }
                        catch (e) { alert('Erreur : ' + e.message); }
                      }}>
                        <Trash2 size={14} style={{ color: 'var(--danger)' }} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showAdd && <AddMaintenanceModal vehicles={vehicles} onClose={() => setShowAdd(false)} onAdd={async (data) => {
        try { await addMaintenance(data); setShowAdd(false); }
        catch (e) { alert('Erreur : ' + e.message); }
      }} />}
    </div>
  );
}

function AddMaintenanceModal({ vehicles, onClose, onAdd }) {
  const [form, setForm] = useState({
    vehicleId: '', date: new Date().toISOString().slice(0, 10), type: TYPES[0],
    description: '', cost: '', mileage: '', nextDate: '', nextMileage: '', notes: '',
    setInMaintenance: false,
  });
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedVehicle = vehicles.find(v => v.id === +form.vehicleId);

  const handleSubmit = async () => {
    if (!form.vehicleId || !form.type) return alert('Véhicule et type requis');
    setSaving(true);
    await onAdd({
      vehicleId: +form.vehicleId,
      date: form.date,
      type: form.type,
      description: form.description,
      cost: +form.cost || 0,
      mileage: form.mileage ? +form.mileage : null,
      nextDate: form.nextDate || null,
      nextMileage: form.nextMileage ? +form.nextMileage : null,
      notes: form.notes,
      setInMaintenance: form.setInMaintenance,
    });
    setSaving(false);
  };

  return (
    <Modal title="Nouvelle intervention" onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </>
    }>
      <div className="form-group">
        <label className="form-label">Véhicule *</label>
        <select className="form-select" value={form.vehicleId} onChange={e => {
          set('vehicleId', e.target.value);
          const v = vehicles.find(vv => vv.id === +e.target.value);
          if (v && !form.mileage) set('mileage', v.mileage);
        }}>
          <option value="">-- Sélectionner --</option>
          {vehicles.map(v => <option key={v.id} value={v.id}>{v.brand} {v.model} — {v.plate}</option>)}
        </select>
      </div>

      <div className="form-row">
        <div className="form-group"><label className="form-label">Date *</label><input className="form-input" type="date" value={form.date} onChange={e => set('date', e.target.value)} /></div>
        <div className="form-group">
          <label className="form-label">Type *</label>
          <select className="form-select" value={form.type} onChange={e => set('type', e.target.value)}>
            {TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Description</label>
        <input className="form-input" value={form.description} onChange={e => set('description', e.target.value)} placeholder="Ex: Vidange + filtre huile et air" />
      </div>

      <div className="form-row">
        <div className="form-group"><label className="form-label">Coût (DA)</label><input className="form-input" type="number" value={form.cost} onChange={e => set('cost', e.target.value)} placeholder="0" /></div>
        <div className="form-group"><label className="form-label">Kilométrage au moment</label><input className="form-input" type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} placeholder={selectedVehicle ? selectedVehicle.mileage : ''} /></div>
      </div>

      <div style={{ marginTop: 6, marginBottom: 6, fontSize: 11, fontWeight: 700, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        Prochaine échéance (optionnel)
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Date prévue</label><input className="form-input" type="date" value={form.nextDate} onChange={e => set('nextDate', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Km prévus</label><input className="form-input" type="number" value={form.nextMileage} onChange={e => set('nextMileage', e.target.value)} placeholder={selectedVehicle ? selectedVehicle.mileage + 10000 : ''} /></div>
      </div>

      <div className="form-group">
        <label className="form-label">Notes</label>
        <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>

      <label style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 12px', background: 'var(--bg-2)', borderRadius: 8, cursor: 'pointer', fontSize: 13 }}>
        <input type="checkbox" checked={form.setInMaintenance} onChange={e => set('setInMaintenance', e.target.checked)} />
        Marquer le véhicule "En maintenance" maintenant
      </label>
    </Modal>
  );
}
