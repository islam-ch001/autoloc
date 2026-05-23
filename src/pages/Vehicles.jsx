import { useState } from 'react';
import { Plus, Search, Car, Fuel, Settings2, Users, Wrench, Eye, Trash2, AlertTriangle, CheckCircle, Image as ImageIcon, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useT } from '../context/LanguageContext';
import Modal from '../components/Modal';
import { readAndResizeImage } from '../utils/imageUpload';
import { CAR_BRANDS, BRAND_LIST } from '../data/carBrands';

const statusMap = {
  available: { cls: 'badge-success', tkey: 'vehicle.available' },
  rented: { cls: 'badge-accent', tkey: 'vehicle.rented' },
  maintenance: { cls: 'badge-warning', tkey: 'vehicle.maintenance' },
};


export default function Vehicles() {
  const { vehicles, reservations, addVehicle, patchVehicle, removeVehicle } = useApp();
  const { t } = useT();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [editing, setEditing] = useState(null);

  const handleDelete = async (vehicle) => {
    const isRented = reservations.some(r => r.vehicleId === vehicle.id && r.status === 'active');
    if (isRented) return;
    try {
      await removeVehicle(vehicle.id);
      setToDelete(null);
    } catch (err) {
      alert("Suppression impossible : " + err.message);
      setToDelete(null);
    }
  };

  const handleMarkAvailable = async (vehicleId) => {
    try {
      await patchVehicle(vehicleId, { status: 'available' });
    } catch (err) {
      alert("Erreur : " + err.message);
    }
  };

  const filtered = vehicles.filter(v => {
    const matchSearch = `${v.brand} ${v.model} ${v.plate}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'Tous' || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('veh.title')}</h1>
          <p className="page-subtitle">{vehicles.length} {t('veh.inFleet')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> {t('veh.addNew')}
        </button>
      </div>

      {/* Filters */}
      <div className="filters-row">
        <div className="search-bar filters-search">
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t('veh.searchPh')} />
        </div>
        {/* Desktop : boutons */}
        <div className="filter-group filters-buttons">
          {['Tous', 'available', 'rented', 'maintenance'].map(s => (
            <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s === 'Tous' ? t('action.all') : t(statusMap[s]?.tkey)}
            </button>
          ))}
        </div>
        {/* Mobile : liste deroulante */}
        <select className="form-select filters-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          {['Tous', 'available', 'rented', 'maintenance'].map(s => (
            <option key={s} value={s}>
              {s === 'Tous' ? t('action.all') : t(statusMap[s]?.tkey)}
            </option>
          ))}
        </select>
      </div>

      {/* Stats bar */}
      <div className="veh-stats-bar" style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { key: 'available', label: t('vehicle.available'), count: vehicles.filter(v => v.status === 'available').length, color: 'var(--success)' },
          { key: 'rented', label: t('vehicle.rented'), count: vehicles.filter(v => v.status === 'rented').length, color: 'var(--accent)' },
          { key: 'maintenance', label: t('vehicle.maintenance'), count: vehicles.filter(v => v.status === 'maintenance').length, color: 'var(--warning)' },
        ].map(s => (
          <div key={s.key} style={{ padding: '8px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--text-3)' }}>{s.label}</span>
            <strong>{s.count}</strong>
          </div>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card"><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>{t('veh.notFound')}</div></div>
      ) : (
        <div className="vehicle-grid">
          {filtered.map(v => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onView={() => setSelected(v)}
              onEdit={() => setEditing(v)}
              onDelete={() => setToDelete(v)}
              onMarkAvailable={() => handleMarkAvailable(v.id)}
            />
          ))}
        </div>
      )}

      {showAdd && <AddVehicleModal onClose={() => setShowAdd(false)} onAdd={async v => {
        try {
          await addVehicle(v);
          setShowAdd(false);
        } catch (err) {
          alert("Erreur : " + err.message);
        }
      }} />}

      {selected && <VehicleDetailModal vehicle={selected} onClose={() => setSelected(null)} />}

      {toDelete && (
        <DeleteConfirmModal
          vehicle={toDelete}
          isRented={reservations.some(r => r.vehicleId === toDelete.id && r.status === 'active')}
          onClose={() => setToDelete(null)}
          onConfirm={() => handleDelete(toDelete)}
        />
      )}

      {editing && <EditVehicleModal
        vehicle={editing}
        onClose={() => setEditing(null)}
        onSave={async (data) => {
          try { await patchVehicle(editing.id, data); setEditing(null); }
          catch (err) { alert("Erreur : " + err.message); }
        }}
      />}
    </div>
  );
}

function VehicleCard({ vehicle: v, onView, onEdit, onDelete, onMarkAvailable }) {
  const { t } = useT();
  const s = statusMap[v.status];
  return (
    <div className="vehicle-card" style={{ borderColor: v.status === 'maintenance' ? 'rgba(245,158,11,0.3)' : undefined }}>
      <div style={{
        position: 'relative', height: v.image ? 180 : 90,
        background: v.image
          ? `#0a0a0f center / cover no-repeat url("${v.image}")`
          : (v.status === 'maintenance'
            ? 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.05) 100%)'
            : 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)'),
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        filter: v.status === 'maintenance' && v.image ? 'brightness(0.7) saturate(0.6)' : undefined,
      }}>
        {!v.image && <Car size={42} style={{ color: 'var(--text-3)', opacity: 0.5 }} />}
        <span className={`badge ${s.cls}`} style={{ position: 'absolute', top: 12, right: 12 }}>{t(s.tkey)}</span>
        <button
          onClick={onEdit}
          title={t('action.edit')}
          style={{
            position: 'absolute', top: 12, left: 50,
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(4px)',
            border: '1px solid rgba(59,130,246,0.35)',
            color: 'var(--accent)', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--accent)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,10,15,0.7)'; e.currentTarget.style.color = 'var(--accent)'; }}
        >
          <Pencil size={13} />
        </button>
        <button
          onClick={onDelete}
          title={t('action.delete')}
          style={{
            position: 'absolute', top: 12, left: 12,
            width: 30, height: 30, borderRadius: 8,
            background: 'rgba(10,10,15,0.7)', backdropFilter: 'blur(4px)',
            border: '1px solid rgba(239,68,68,0.3)',
            color: 'var(--danger)', cursor: 'pointer',
            display: 'grid', placeItems: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--danger)'; e.currentTarget.style.color = 'white'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(10,10,15,0.7)'; e.currentTarget.style.color = 'var(--danger)'; }}
        >
          <Trash2 size={13} />
        </button>

        {/* Bannière maintenance avec bouton "Rendre disponible" */}
        {v.status === 'maintenance' && (
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(6px)',
            padding: '10px 12px',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--warning)' }}>
              <Wrench size={13} /> {t('vehicle.maintenance')}
            </div>
            <button
              onClick={onMarkAvailable}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '7px 14px', borderRadius: 8, fontSize: 12, fontWeight: 800,
                background: '#22c55e', color: '#ffffff',
                border: '2px solid #4ade80',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(34,197,94,0.45), 0 0 0 1px rgba(255,255,255,0.1) inset',
                textShadow: '0 1px 2px rgba(0,0,0,0.25)',
                transition: 'transform 0.15s, box-shadow 0.15s, background 0.15s',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = '#16a34a';
                e.currentTarget.style.transform = 'translateY(-1px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(34,197,94,0.6), 0 0 0 1px rgba(255,255,255,0.15) inset';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = '#22c55e';
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(34,197,94,0.45), 0 0 0 1px rgba(255,255,255,0.1) inset';
              }}
            >
              <CheckCircle size={14} /> {t('action.makeAvailable')}
            </button>
          </div>
        )}
      </div>
      <div className="vehicle-body">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="vehicle-brand">{v.brand}</div>
            <div className="vehicle-model">{v.model} <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 400 }}>{v.year}</span></div>
          </div>
          <div title="Immatriculation" style={{
            display: 'inline-flex', alignItems: 'center',
            background: '#facc15',
            color: '#0a0a0f',
            border: '2px solid #000',
            borderRadius: 4,
            padding: '4px 10px',
            fontFamily: '"Courier New", Consolas, monospace',
            fontWeight: 800,
            fontSize: 14,
            letterSpacing: 1,
            lineHeight: 1,
            boxShadow: '0 2px 4px rgba(0,0,0,0.25)',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}>
            {v.plate}
          </div>
        </div>
        <div className="vehicle-specs" style={{ marginTop: 10 }}>
          <span className="vehicle-spec"><Fuel size={12} /> {v.fuel}</span>
          <span className="vehicle-spec"><Settings2 size={12} /> {v.transmission}</span>
          <span className="vehicle-spec"><Users size={12} /> {v.seats} places</span>
          <span className="vehicle-spec"><Car size={12} /> {v.category}</span>
        </div>
      </div>
      <div className="vehicle-footer">
        <div className="vehicle-price">{v.pricePerDay.toLocaleString('fr-DZ')} DA <span>/ jour</span></div>
        <button className="btn btn-sm" onClick={onView}><Eye size={14} /> {t('veh.details')}</button>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ vehicle: v, isRented, onClose, onConfirm }) {
  const { t } = useT();
  return (
    <Modal title={t('veh.delete.title')} onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>{t('action.cancel')}</button>
        {!isRented && (
          <button
            className="btn"
            style={{ background: 'var(--danger)', color: 'white', border: 'none' }}
            onClick={onConfirm}
          >
            <Trash2 size={14} /> {t('action.delete')}
          </button>
        )}
      </>
    }>
      {isRented ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8px 0', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--warning-soft)', display: 'grid', placeItems: 'center', color: 'var(--warning)' }}>
            <AlertTriangle size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Suppression impossible</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Le véhicule <strong>{v.brand} {v.model}</strong> est actuellement <span style={{ color: 'var(--accent)' }}>en location</span>.<br />
              Vous devez d'abord enregistrer son retour avant de le supprimer.
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '8px 0', textAlign: 'center' }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--danger-soft)', display: 'grid', placeItems: 'center', color: 'var(--danger)' }}>
            <Trash2 size={24} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6 }}>Confirmer la suppression</div>
            <div style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.6 }}>
              Vous allez supprimer définitivement :<br />
              <strong style={{ color: 'var(--text)', fontSize: 15 }}>{v.brand} {v.model} {v.year}</strong><br />
              <span style={{ color: 'var(--text-3)' }}>{v.plate}</span>
            </div>
            <div style={{ marginTop: 12, padding: '8px 14px', background: 'var(--danger-soft)', borderRadius: 8, fontSize: 12, color: 'var(--danger)' }}>
              ⚠ Cette action est irréversible
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}

function VehicleDetailModal({ vehicle: v, onClose }) {
  const { t } = useT();
  const s = statusMap[v.status];
  return (
    <Modal title={`${v.brand} ${v.model}`} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          [t('veh.brand'), v.brand], [t('veh.model'), v.model], [t('veh.year'), v.year], [t('veh.category'), v.category],
          [t('veh.fuel'), v.fuel], [t('veh.transmission'), v.transmission], [t('veh.mileage'), `${v.mileage.toLocaleString()} km`],
          [t('veh.plate'), v.plate],
        ].map(([label, value]) => (
          <div key={label} style={{ background: 'var(--bg-2)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 4 }}>{label}</div>
            <div style={{ fontWeight: 600 }}>{value}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', background: 'var(--primary-soft)', borderRadius: 8, border: '1px solid rgba(245,158,11,0.15)' }}>
        <span style={{ color: 'var(--text-2)', fontSize: 13 }}>Prix par jour</span>
        <span style={{ fontWeight: 700, fontSize: 20, color: 'var(--primary)' }}>{v.pricePerDay.toLocaleString('fr-DZ')} DA</span>
      </div>
      {v.features?.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-3)', marginBottom: 8 }}>ÉQUIPEMENTS</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {v.features.map(f => <span key={f} className="badge badge-neutral">{f}</span>)}
          </div>
        </div>
      )}
      <div style={{ marginTop: 16 }}>
        <span className={`badge ${s.cls}`}>{t('veh.status')}: {t(s.tkey)}</span>
      </div>
    </Modal>
  );
}

function AddVehicleModal({ onClose, onAdd }) {
  const { t } = useT();
  const [form, setForm] = useState({ brand: '', model: '', year: new Date().getFullYear(), category: 'Berline', fuel: 'Essence', transmission: 'Manuelle', seats: 5, pricePerDay: '', plate: '', mileage: '', image: '', color: '#000000' });
  const [photoErr, setPhotoErr] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoErr(null);
    setPhotoLoading(true);
    try {
      const dataUrl = await readAndResizeImage(file);
      set('image', dataUrl);
    } catch (err) {
      setPhotoErr(err.message);
    } finally { setPhotoLoading(false); }
  };

  return (
    <Modal title={t('veh.addNew')} onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>{t('action.cancel')}</button>
        <button className="btn btn-primary" onClick={() => onAdd({ ...form, pricePerDay: +form.pricePerDay || 0, mileage: +form.mileage || 0, year: +form.year || new Date().getFullYear(), seats: +form.seats || 5 })}>{t('action.add')}</button>
      </>
    }>
      <div className="form-group">
        <label className="form-label">{t('veh.photo')}</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 120, height: 80, borderRadius: 8, overflow: 'hidden',
            background: form.image ? `center / cover no-repeat url("${form.image}")` : 'var(--bg-2)',
            border: '1px dashed var(--border)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-3)', fontSize: 11, textAlign: 'center', padding: 6,
          }}>
            {!form.image && (photoLoading ? 'Chargement…' : 'Aucune photo')}
          </div>
          <div style={{ flex: 1 }}>
            <label className="btn" style={{ display: 'inline-flex', cursor: 'pointer' }}>
              <ImageIcon size={14} /> {form.image ? t('action.change') : t('action.choose')}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
            </label>
            {form.image && (
              <button type="button" className="btn" style={{ marginLeft: 8 }} onClick={() => set('image', '')}>
                {t('action.remove')}
              </button>
            )}
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
              Stockée localement (redimensionnée à 800×500). Pas de connexion requise.
            </div>
            {photoErr && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{photoErr}</div>}
          </div>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label className="form-label">{t('veh.brand')} *</label>
          <input className="form-input" list="brand-list-add" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Cliquez pour choisir ou tapez…" />
          <datalist id="brand-list-add">
            {BRAND_LIST.map(b => <option key={b} value={b} />)}
          </datalist>
        </div>
        <div className="form-group">
          <label className="form-label">{t('veh.model')} *</label>
          <input className="form-input" list="model-list-add" value={form.model} onChange={e => set('model', e.target.value)} placeholder={CAR_BRANDS[form.brand] ? 'Cliquez pour choisir' : 'Tapez le modèle…'} />
          <datalist id="model-list-add">
            {(CAR_BRANDS[form.brand] || []).map(m => <option key={m} value={m} />)}
          </datalist>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('veh.year')}</label><input className="form-input" type="number" value={form.year} onChange={e => set('year', +e.target.value)} /></div>
        <div className="form-group"><label className="form-label">{t('veh.category')}</label>
          <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
            {['Berline', 'SUV', 'Citadine', 'Premium', 'Économique', 'Utilitaire'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('veh.fuel')}</label>
          <select className="form-select" value={form.fuel} onChange={e => set('fuel', e.target.value)}>
            {['Essence', 'Diesel', 'Hybride', 'Électrique'].map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">{t('veh.transmission')}</label>
          <select className="form-select" value={form.transmission} onChange={e => set('transmission', e.target.value)}>
            <option>Manuelle</option><option>Automatique</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">{t('veh.pricePerDay')} *</label><input className="form-input" type="number" value={form.pricePerDay} onChange={e => set('pricePerDay', e.target.value)} placeholder="4500" /></div>
        <div className="form-group"><label className="form-label">{t('veh.plate')} *</label><input className="form-input" value={form.plate} onChange={e => set('plate', e.target.value)} placeholder="00125-116-16" /></div>
      </div>
      <div className="form-group"><label className="form-label">{t('veh.mileage')}</label><input className="form-input" type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} placeholder="0" /></div>
    </Modal>
  );
}

function EditVehicleModal({ vehicle, onClose, onSave }) {
  const { t } = useT();
  const [form, setForm] = useState({
    brand: vehicle.brand || '',
    model: vehicle.model || '',
    year: vehicle.year || new Date().getFullYear(),
    category: vehicle.category || 'Berline',
    fuel: vehicle.fuel || 'Essence',
    transmission: vehicle.transmission || 'Manuelle',
    seats: vehicle.seats || 5,
    pricePerDay: vehicle.pricePerDay || '',
    plate: vehicle.plate || '',
    mileage: vehicle.mileage || '',
    image: vehicle.image || '',
    status: vehicle.status || 'available',
  });
  const [photoErr, setPhotoErr] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handlePhoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoErr(null);
    setPhotoLoading(true);
    try {
      const dataUrl = await readAndResizeImage(file);
      set('image', dataUrl);
    } catch (err) { setPhotoErr(err.message); }
    finally { setPhotoLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.brand || !form.model || !form.plate) {
      alert('Marque, modèle et immatriculation sont obligatoires');
      return;
    }
    setSaving(true);
    await onSave({
      ...form,
      pricePerDay: +form.pricePerDay || 0,
      mileage: +form.mileage || 0,
      year: +form.year || new Date().getFullYear(),
      seats: +form.seats || 5,
    });
    setSaving(false);
  };

  return (
    <Modal title={`Modifier ${vehicle.brand} ${vehicle.model}`} onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary" disabled={saving} onClick={handleSubmit}>
          {saving ? 'Enregistrement…' : 'Enregistrer'}
        </button>
      </>
    }>
      <div className="form-group">
        <label className="form-label">Photo du véhicule</label>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <div style={{
            width: 120, height: 80, borderRadius: 8, overflow: 'hidden',
            background: form.image ? `center / cover no-repeat url("${form.image}")` : 'var(--bg-2)',
            border: '1px dashed var(--border)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'var(--text-3)', fontSize: 11, textAlign: 'center', padding: 6,
          }}>
            {!form.image && (photoLoading ? 'Chargement…' : 'Aucune photo')}
          </div>
          <div style={{ flex: 1 }}>
            <label className="btn" style={{ display: 'inline-flex', cursor: 'pointer' }}>
              <ImageIcon size={14} /> {form.image ? 'Changer' : 'Choisir une photo'}
              <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handlePhoto} />
            </label>
            {form.image && (
              <button type="button" className="btn" style={{ marginLeft: 8 }} onClick={() => set('image', '')}>
                Supprimer
              </button>
            )}
            {photoErr && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{photoErr}</div>}
          </div>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label className="form-label">Marque *</label>
          <input className="form-input" list="brand-list-edit" value={form.brand} onChange={e => set('brand', e.target.value)} />
          <datalist id="brand-list-edit">
            {BRAND_LIST.map(b => <option key={b} value={b} />)}
          </datalist>
        </div>
        <div className="form-group">
          <label className="form-label">Modèle *</label>
          <input className="form-input" list="model-list-edit" value={form.model} onChange={e => set('model', e.target.value)} />
          <datalist id="model-list-edit">
            {(CAR_BRANDS[form.brand] || []).map(m => <option key={m} value={m} />)}
          </datalist>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Année</label><input className="form-input" type="number" value={form.year} onChange={e => set('year', +e.target.value)} /></div>
        <div className="form-group"><label className="form-label">Catégorie</label>
          <select className="form-select" value={form.category} onChange={e => set('category', e.target.value)}>
            {['Berline', 'SUV', 'Citadine', 'Premium', 'Économique', 'Utilitaire'].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Carburant</label>
          <select className="form-select" value={form.fuel} onChange={e => set('fuel', e.target.value)}>
            {['Essence', 'Diesel', 'Hybride', 'Électrique'].map(f => <option key={f}>{f}</option>)}
          </select>
        </div>
        <div className="form-group"><label className="form-label">Transmission</label>
          <select className="form-select" value={form.transmission} onChange={e => set('transmission', e.target.value)}>
            <option>Manuelle</option><option>Automatique</option>
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Prix / jour (DA) *</label><input className="form-input" type="number" value={form.pricePerDay} onChange={e => set('pricePerDay', e.target.value)} placeholder="4500" /></div>
        <div className="form-group"><label className="form-label">Immatriculation *</label><input className="form-input" value={form.plate} onChange={e => set('plate', e.target.value)} /></div>
      </div>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Kilométrage</label><input className="form-input" type="number" value={form.mileage} onChange={e => set('mileage', e.target.value)} placeholder="0" /></div>
        <div className="form-group"><label className="form-label">Statut</label>
          <select className="form-select" value={form.status} onChange={e => set('status', e.target.value)}>
            <option value="available">Disponible</option>
            <option value="rented">En location</option>
            <option value="maintenance">Maintenance</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
