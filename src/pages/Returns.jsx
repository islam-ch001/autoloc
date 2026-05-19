import { useState } from 'react';
import { Plus, Search, CheckCircle, AlertTriangle, Fuel, Gauge } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../context/LanguageContext';
import Modal from '../components/Modal';

const conditionMap = {
  'Bon état':  { cls: 'badge-success', icon: <CheckCircle size={12} /> },
  'Sale':      { cls: 'badge-warning', icon: <AlertTriangle size={12} /> },
  'Endommagé': { cls: 'badge-danger',  icon: <AlertTriangle size={12} /> },
  // Compatibilité avec anciennes valeurs (pour ne pas casser l'affichage)
  'Bon':            { cls: 'badge-success', icon: <CheckCircle size={12} /> },
  'Dommage mineur': { cls: 'badge-warning', icon: <AlertTriangle size={12} /> },
  'Dommage majeur': { cls: 'badge-danger',  icon: <AlertTriangle size={12} /> },
};

export default function Returns() {
  const { returns, reservations, vehicles, clients, addReturn } = useApp();
  const { t } = useT();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);

  const enriched = returns.map(ret => {
    const res = reservations.find(r => r.id === ret.reservationId);
    const client = res ? clients.find(c => c.id === res.clientId) : null;
    const vehicle = res ? vehicles.find(v => v.id === res.vehicleId) : null;
    return { ...ret, res, client, vehicle };
  }).filter(r => {
    const q = search.toLowerCase();
    return `${r.client?.firstName} ${r.client?.lastName} ${r.vehicle?.brand} ${r.vehicle?.model}`.toLowerCase().includes(q);
  }).sort((a, b) => new Date(b.returnDate) - new Date(a.returnDate));

  const activeRentals = reservations.filter(r => r.status === 'active');

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('ret.title')}</h1>
          <p className="page-subtitle">{returns.length} {t('ret.totalCount')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> {t('ret.addNew')}
        </button>
      </div>

      {/* Active rentals alert */}
      {activeRentals.length > 0 && (
        <div style={{ padding: '14px 18px', background: 'var(--accent-soft)', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 12, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
          <AlertTriangle size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />
          <span style={{ fontSize: 13, color: 'var(--text-2)' }}>
            <strong style={{ color: 'var(--text)' }}>{activeRentals.length} véhicule(s)</strong> actuellement en location — en attente de retour
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            {activeRentals.slice(0, 3).map(r => {
              const v = vehicles.find(vv => vv.id === r.vehicleId);
              return (
                <span key={r.id} className="badge badge-accent">{v?.brand} {v?.model}</span>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        <div className="search-bar" style={{ flex: 1 }}>
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher par client ou véhicule..." />
        </div>
      </div>

      <div className="card">
        <div style={{ overflowX: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>{t('res.vehicle')}</th>
                <th>{t('res.client')}</th>
                <th>{t('ret.returnDate')}</th>
                <th>{t('veh.mileage')}</th>
                <th>{t('ret.fuelOut').split(' ')[0]}</th>
                <th>{t('ret.condition').split(' ')[0]}</th>
                <th>{t('ret.extraCharges').split(' (')[0]}</th>
                <th>{t('ret.extraPaid').split(' (')[0]}</th>
                <th>{t('maint.notes')}</th>
              </tr>
            </thead>
            <tbody>
              {enriched.map(r => {
                const kmDiff = r.mileageIn - r.mileageOut;
                const cond = conditionMap[r.condition] || conditionMap['Bon état'];
                const condLabelMap = {
                  'Bon état': t('ret.condition.good'),
                  'Sale': t('ret.condition.dirty'),
                  'Endommagé': t('ret.condition.damaged'),
                  'Bon': t('ret.condition.good'),
                  'Dommage mineur': t('ret.condition.dirty'),
                  'Dommage majeur': t('ret.condition.damaged'),
                };
                const condLabel = condLabelMap[r.condition] || r.condition;
                return (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700, color: 'var(--text-3)' }}>#{r.reservationId}</td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{r.vehicle?.brand} {r.vehicle?.model}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{r.vehicle?.plate}</div>
                    </td>
                    <td style={{ fontWeight: 500 }}>{r.client?.firstName} {r.client?.lastName}</td>
                    <td style={{ fontSize: 12 }}>{r.returnDate}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
                        <Gauge size={12} style={{ color: 'var(--text-3)' }} />
                        {r.mileageIn.toLocaleString()} km
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-3)' }}>+{kmDiff.toLocaleString()} km</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>Départ: {r.fuelOut}</div>
                        <div style={{ fontSize: 11, color: r.fuelIn !== r.fuelOut ? 'var(--warning)' : 'var(--text-2)' }}>Retour: {r.fuelIn}</div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${cond.cls}`} style={{ display: 'flex', alignItems: 'center', gap: 4, width: 'fit-content' }}>
                        {cond.icon} {condLabel}
                      </span>
                    </td>
                    <td>
                      {r.extraCharges > 0
                        ? <span style={{ fontWeight: 700, color: 'var(--danger)' }}>+{r.extraCharges.toLocaleString('fr-DZ')} DA</span>
                        : <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                    <td>
                      {r.extraPaid > 0
                        ? <span style={{ fontWeight: 700, color: 'var(--success)' }}>+{r.extraPaid.toLocaleString('fr-DZ')} DA</span>
                        : <span style={{ color: 'var(--text-3)' }}>—</span>}
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--text-2)', maxWidth: 160 }}>
                      {r.damages && <div style={{ color: 'var(--warning)', marginBottom: 2 }}>⚠ {r.damages}</div>}
                      {r.notes || '—'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showAdd && <ReturnModal onClose={() => setShowAdd(false)} onAdd={async ret => {
        try {
          await addReturn(ret);
          setShowAdd(false);
        } catch (err) {
          alert("Erreur : " + err.message);
        }
      }} />}
    </div>
  );
}

function ReturnModal({ onClose, onAdd }) {
  const { reservations, vehicles, clients } = useApp();
  const { t } = useT();
  const active = reservations.filter(r => r.status === 'active');
  const [form, setForm] = useState({ reservationId: '', returnDate: new Date().toISOString().split('T')[0], mileageOut: '', mileageIn: '', fuelOut: 'Plein', fuelIn: 'Plein', condition: 'Bon état', damages: '', manualCharges: 0, extraPaid: 0, notes: '' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const selectedRes = reservations.find(r => r.id === +form.reservationId);
  const vehicle = selectedRes ? vehicles.find(v => v.id === selectedRes.vehicleId) : null;

  // Calcul dépassement kilométrique
  const kmDriven = form.mileageIn && form.mileageOut ? +form.mileageIn - +form.mileageOut : 0;
  const kmLimit = selectedRes?.kmLimit || 0;
  const extraKmPrice = selectedRes?.extraKmPrice || 0;
  const excessKm = kmLimit > 0 && kmDriven > kmLimit ? kmDriven - kmLimit : 0;
  const kmFees = excessKm * extraKmPrice;
  const totalExtraCharges = kmFees + (+form.manualCharges || 0);

  const handleResChange = (id) => {
    const res = reservations.find(r => r.id === +id);
    const v = res ? vehicles.find(vv => vv.id === res.vehicleId) : null;
    set('reservationId', id);
    if (v) set('mileageOut', v.mileage);
  };

  return (
    <Modal title="Retour de véhicule" onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>{t('action.cancel')}</button>
        <button className="btn btn-primary" disabled={!form.reservationId || !form.mileageIn || +form.mileageIn < +form.mileageOut} onClick={() => {
          if (!form.reservationId) return alert("Sélectionnez une réservation");
          if (!form.mileageOut || !form.mileageIn) return alert("Renseignez les kilomètres au départ et au retour");
          if (+form.mileageIn < +form.mileageOut) return alert(`Le km au retour (${form.mileageIn}) doit être supérieur ou égal au km au départ (${form.mileageOut})`);
          onAdd({
            ...form,
            reservationId: +form.reservationId,
            mileageOut: +form.mileageOut,
            mileageIn: +form.mileageIn,
            excessKm,
            kmFees,
            extraCharges: totalExtraCharges,
            extraPaid: +form.extraPaid || 0,
          });
        }}>
          {t('action.save')}
        </button>
      </>
    }>
      <div className="form-group">
        <label className="form-label">{t('ret.activeRes')} *</label>
        <select className="form-select" value={form.reservationId} onChange={e => handleResChange(e.target.value)}>
          <option value="">-- Sélectionner --</option>
          {active.map(r => {
            const v = vehicles.find(vv => vv.id === r.vehicleId);
            const c = clients.find(cc => cc.id === r.clientId);
            return <option key={r.id} value={r.id}>#{r.id} — {v?.brand} {v?.model} — {c?.lastName} (retour: {r.endDate})</option>;
          })}
        </select>
      </div>

      {vehicle && (
        <div style={{ padding: '10px 14px', background: 'var(--primary-soft)', borderRadius: 8, marginBottom: 16, fontSize: 12, color: 'var(--text-2)' }}>
          🚗 {vehicle.brand} {vehicle.model} — {vehicle.plate} — Km départ enregistré: <strong>{vehicle.mileage.toLocaleString()}</strong>
        </div>
      )}

      <div className="form-group">
        <label className="form-label">{t('ret.returnDate')}</label>
        <input className="form-input" type="date" value={form.returnDate} onChange={e => set('returnDate', e.target.value)} />
      </div>

      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('ret.kmOut')}</label><input className="form-input" type="number" value={form.mileageOut} placeholder="Auto-rempli" onChange={e => set('mileageOut', e.target.value)} /></div>
        <div className="form-group"><label className="form-label">{t('ret.kmIn')} *</label><input className="form-input" type="number" value={form.mileageIn} placeholder={`≥ ${form.mileageOut || '0'}`} min={form.mileageOut || 0} onChange={e => set('mileageIn', e.target.value)} /></div>
      </div>
      {form.mileageIn && form.mileageOut && +form.mileageIn < +form.mileageOut && (
        <div style={{ padding: '8px 12px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderRadius: 8, fontSize: 12, marginBottom: 12 }}>
          ⚠️ Le km au retour doit être ≥ km au départ ({form.mileageOut})
        </div>
      )}

      {/* Calcul kilométrique en temps réel */}
      {kmDriven > 0 && kmLimit > 0 && (
        <div style={{
          borderRadius: 10, overflow: 'hidden', marginBottom: 16,
          border: `1px solid ${excessKm > 0 ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`,
        }}>
          <div style={{ padding: '10px 14px', background: excessKm > 0 ? 'var(--danger-soft)' : 'var(--success-soft)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Gauge size={14} style={{ color: excessKm > 0 ? 'var(--danger)' : 'var(--success)' }} />
            <span style={{ fontWeight: 700, fontSize: 12, color: excessKm > 0 ? 'var(--danger)' : 'var(--success)' }}>
              {excessKm > 0 ? `${t('ret.kmExcess')}: ${excessKm.toLocaleString()} km` : 'Kilométrage dans la limite'}
            </span>
          </div>
          <div style={{ padding: '12px 14px', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', gap: 6 }}>
            <KmRow label={t('ret.kmDriven')} value={`${kmDriven.toLocaleString()} km`} />
            <KmRow label={t('res.kmAllowed')} value={`${kmLimit.toLocaleString()} km`} />
            {excessKm > 0 && (
              <>
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                <KmRow label="Km en dépassement" value={`${excessKm.toLocaleString()} km`} danger />
                <KmRow label={`Prix/km (${extraKmPrice} DA)`} value={`× ${extraKmPrice.toLocaleString()} DA`} />
                <div style={{ height: 1, background: 'var(--border)', margin: '4px 0' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 14 }}>
                  <span style={{ color: 'var(--text-2)' }}>Frais km suppl.</span>
                  <span style={{ color: 'var(--danger)' }}>+{kmFees.toLocaleString('fr-DZ')} DA</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('ret.fuelOut')}</label>
          <select className="form-select" value={form.fuelOut} onChange={e => set('fuelOut', e.target.value)}>
            {['Plein', '3/4', '1/2', '1/4', 'Vide'].map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">{t('ret.fuelIn')}</label>
          <select className="form-select" value={form.fuelIn} onChange={e => set('fuelIn', e.target.value)}>
            {['Plein', '3/4', '1/2', '1/4', 'Vide'].map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
      </div>

      <div className="form-group"><label className="form-label">{t('ret.condition')}</label>
        <select className="form-select" value={form.condition} onChange={e => set('condition', e.target.value)}>
          <option value="Bon état">{t('ret.condition.good')}</option>
          <option value="Sale">{t('ret.condition.dirty')}</option>
          <option value="Endommagé">{t('ret.condition.damaged')}</option>
        </select>
      </div>

      {form.condition !== 'Bon état' && (
        <div className="form-group"><label className="form-label">{t('ret.damages')}</label><textarea className="form-textarea" value={form.damages} onChange={e => set('damages', e.target.value)} placeholder="Décrivez les dommages..." /></div>
      )}

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t('ret.extraCharges')}</label>
          <input className="form-input" type="text" inputMode="numeric" value={form.manualCharges}
            onChange={e => set('manualCharges', e.target.value.replace(/[^\d]/g, ''))} placeholder="0" />
        </div>
        <div className="form-group">
          <label className="form-label" style={{ color: 'var(--success)' }}>{'💰 ' + t('ret.extraPaid')}</label>
          <input className="form-input" type="text" inputMode="numeric" value={form.extraPaid}
            onChange={e => set('extraPaid', e.target.value.replace(/[^\d]/g, ''))} placeholder="0"
            style={{ borderColor: +form.extraPaid > 0 ? 'rgba(16,185,129,0.4)' : undefined }} />
        </div>
      </div>
      {+form.extraPaid > 0 && (
        <div style={{ padding: '10px 14px', background: 'var(--success-soft)', borderRadius: 8, marginBottom: 12, fontSize: 12, color: 'var(--success)', fontWeight: 600 }}>
          ✓ +{(+form.extraPaid).toLocaleString('fr-DZ')} DA seront ajoutés au paiement de la réservation (et au revenu total du tableau de bord)
        </div>
      )}

      {/* Récap total frais */}
      {totalExtraCharges > 0 && (
        <div style={{ padding: '12px 16px', background: 'var(--surface-2)', borderRadius: 10, marginBottom: 12, border: '1px solid var(--border)' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{t('ret.totalFees')}</div>
          {kmFees > 0 && <KmRow label={t('ret.kmFees')} value={`+${kmFees.toLocaleString('fr-DZ')} DA`} danger />}
          {+form.manualCharges > 0 && <KmRow label="Autres frais" value={`+${(+form.manualCharges).toLocaleString('fr-DZ')} DA`} />}
          <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 15 }}>
            <span>{t('ret.totalFees')}</span>
            <span style={{ color: 'var(--danger)' }}>+{totalExtraCharges.toLocaleString('fr-DZ')} DA</span>
          </div>
        </div>
      )}

      <div className="form-group"><label className="form-label">{t('maint.notes')}</label><textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} /></div>
    </Modal>
  );
}

function KmRow({ label, value, danger }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
      <span style={{ color: 'var(--text-3)' }}>{label}</span>
      <span style={{ fontWeight: 600, color: danger ? 'var(--danger)' : 'var(--text-2)' }}>{value}</span>
    </div>
  );
}
