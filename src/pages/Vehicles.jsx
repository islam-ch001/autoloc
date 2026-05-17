import { useState } from 'react';
import { Plus, Search, Car, Fuel, Settings2, Users, Wrench, Eye, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import Modal from '../components/Modal';

const statusMap = {
  available: { cls: 'badge-success', label: 'Disponible' },
  rented: { cls: 'badge-accent', label: 'En location' },
  maintenance: { cls: 'badge-warning', label: 'Maintenance' },
};


export default function Vehicles() {
  const { vehicles, reservations, addVehicle, patchVehicle, removeVehicle } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tous');
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState(null);
  const [toDelete, setToDelete] = useState(null);

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
          <h1 className="page-title">Véhicules</h1>
          <p className="page-subtitle">{vehicles.length} véhicules dans la flotte</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)}>
          <Plus size={16} /> Ajouter un véhicule
        </button>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: 240 }}>
          <Search size={16} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Chercher par marque, modèle, immatriculation..." />
        </div>
        <div className="filter-group">
          {['Tous', 'available', 'rented', 'maintenance'].map(s => (
            <button key={s} className={`filter-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              {s === 'Tous' ? 'Tous' : statusMap[s]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Disponibles', count: vehicles.filter(v => v.status === 'available').length, color: 'var(--success)' },
          { label: 'En location', count: vehicles.filter(v => v.status === 'rented').length, color: 'var(--accent)' },
          { label: 'Maintenance', count: vehicles.filter(v => v.status === 'maintenance').length, color: 'var(--warning)' },
        ].map(s => (
          <div key={s.label} style={{ padding: '8px 16px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
            <span style={{ color: 'var(--text-3)' }}>{s.label}</span>
            <strong>{s.count}</strong>
          </div>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="card"><div style={{ padding: 40, textAlign: 'center', color: 'var(--text-3)' }}>Aucun véhicule trouvé</div></div>
      ) : (
        <div className="vehicle-grid">
          {filtered.map(v => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              onView={() => setSelected(v)}
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
    </div>
  );
}

function VehicleCard({ vehicle: v, onView, onDelete, onMarkAvailable }) {
  const s = statusMap[v.status];
  return (
    <div className="vehicle-card" style={{ borderColor: v.status === 'maintenance' ? 'rgba(245,158,11,0.3)' : undefined }}>
      <div style={{
        position: 'relative', height: 90,
        background: v.status === 'maintenance'
          ? 'linear-gradient(135deg, rgba(245,158,11,0.18) 0%, rgba(245,158,11,0.05) 100%)'
          : 'linear-gradient(135deg, var(--surface-2) 0%, var(--surface) 100%)',
        borderBottom: '1px solid var(--border)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Car size={42} style={{ color: 'var(--text-3)', opacity: 0.5 }} />
        <span className={`badge ${s.cls}`} style={{ position: 'absolute', top: 12, right: 12 }}>{s.label}</span>
        <button
          onClick={onDelete}
          title="Supprimer ce véhicule"
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
              <Wrench size={13} /> En maintenance
            </div>
            <button
              onClick={onMarkAvailable}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '5px 10px', borderRadius: 6, fontSize: 11, fontWeight: 700,
                background: 'var(--success)', color: 'white', border: 'none', cursor: 'pointer',
                transition: 'opacity 0.15s',
              }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              <CheckCircle size={12} /> Rendre disponible
            </button>
          </div>
        )}
      </div>
      <div className="vehicle-body">
        <div className="vehicle-brand">{v.brand}</div>
        <div className="vehicle-model">{v.model} <span style={{ fontSize: 13, color: 'var(--text-3)', fontWeight: 400 }}>{v.year}</span></div>
        <div className="vehicle-specs">
          <span className="vehicle-spec"><Fuel size={12} /> {v.fuel}</span>
          <span className="vehicle-spec"><Settings2 size={12} /> {v.transmission}</span>
          <span className="vehicle-spec"><Users size={12} /> {v.seats} places</span>
          <span className="vehicle-spec"><Car size={12} /> {v.category}</span>
        </div>
      </div>
      <div className="vehicle-footer">
        <div>
          <div className="vehicle-price">{v.pricePerDay.toLocaleString('fr-DZ')} DA <span>/ jour</span></div>
          <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 2 }}>{v.plate}</div>
        </div>
        <button className="btn btn-sm" onClick={onView}><Eye size={14} /> Détails</button>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ vehicle: v, isRented, onClose, onConfirm }) {
  return (
    <Modal title="Supprimer le véhicule" onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>Annuler</button>
        {!isRented && (
          <button
            className="btn"
            style={{ background: 'var(--danger)', color: 'white', border: 'none' }}
            onClick={onConfirm}
          >
            <Trash2 size={14} /> Supprimer définitivement
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
  const s = statusMap[v.status];
  return (
    <Modal title={`${v.brand} ${v.model}`} onClose={onClose}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
        {[
          ['Marque', v.brand], ['Modèle', v.model], ['Année', v.year], ['Catégorie', v.category],
          ['Carburant', v.fuel], ['Transmission', v.transmission], ['Kilométrage', `${v.mileage.toLocaleString()} km`],
          ['Immatriculation', v.plate],
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
        <span className={`badge ${s.cls}`}>Statut: {s.label}</span>
      </div>
    </Modal>
  );
}

function AddVehicleModal({ onClose, onAdd }) {
  const [form, setForm] = useState({ brand: '', model: '', year: new Date().getFullYear(), category: 'Berline', fuel: 'Essence', transmission: 'Manuelle', seats: 5, pricePerDay: '', plate: '', mileage: 0, image: '', color: '#000000' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <Modal title="Ajouter un véhicule" onClose={onClose} footer={
      <>
        <button className="btn" onClick={onClose}>Annuler</button>
        <button className="btn btn-primary" onClick={() => onAdd(form)}>Ajouter</button>
      </>
    }>
      <div className="form-row">
        <div className="form-group"><label className="form-label">Marque *</label><input className="form-input" value={form.brand} onChange={e => set('brand', e.target.value)} placeholder="Toyota" /></div>
        <div className="form-group"><label className="form-label">Modèle *</label><input className="form-input" value={form.model} onChange={e => set('model', e.target.value)} placeholder="Corolla" /></div>
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
        <div className="form-group"><label className="form-label">Prix / jour (DA) *</label><input className="form-input" type="number" value={form.pricePerDay} onChange={e => set('pricePerDay', +e.target.value)} placeholder="4500" /></div>
        <div className="form-group"><label className="form-label">Immatriculation *</label><input className="form-input" value={form.plate} onChange={e => set('plate', e.target.value)} placeholder="00125-116-16" /></div>
      </div>
      <div className="form-group"><label className="form-label">Kilométrage actuel</label><input className="form-input" type="number" value={form.mileage} onChange={e => set('mileage', +e.target.value)} /></div>
    </Modal>
  );
}
