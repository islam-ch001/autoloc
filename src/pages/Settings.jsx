import { Building2, Save, Image as ImageIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSettings } from '../context/SettingsContext';
import { readAndResizeImage } from '../utils/imageUpload';

export default function Settings() {
  const { settings, save } = useSettings();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  // Synchroniser le formulaire quand les settings sont chargés/changent d'utilisateur
  useEffect(() => { setForm(settings); }, [settings]);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const [saving, setSaving] = useState(false);
  const [logoErr, setLogoErr] = useState(null);
  const [logoLoading, setLogoLoading] = useState(false);

  const handleLogo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoErr(null);
    setLogoLoading(true);
    try {
      // Logo carré 256x256 max, qualité élevée
      const dataUrl = await readAndResizeImage(file, { maxWidth: 256, maxHeight: 256, quality: 0.9 });
      set('logo', dataUrl);
    } catch (err) { setLogoErr(err.message); }
    finally { setLogoLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await save(form);
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) {
      alert('Erreur de sauvegarde : ' + err.message);
    } finally { setSaving(false); }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Paramètres</h1>
          <p className="page-subtitle">Configuration de votre agence</p>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          <Save size={16} /> {saving ? 'Enregistrement…' : (saved ? 'Enregistré ✓' : 'Enregistrer')}
        </button>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title"><Building2 size={16} style={{ display: 'inline', marginRight: 8 }} />Informations agence</span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Logo de l'agence</label>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{
                  width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
                  background: form.logo ? `center / cover no-repeat url("${form.logo}")` : 'var(--bg-2)',
                  border: '1px dashed var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--text-3)', fontSize: 10, textAlign: 'center', padding: 4,
                }}>
                  {!form.logo && (logoLoading ? 'Chargement…' : 'Aucun logo')}
                </div>
                <div style={{ flex: 1 }}>
                  <label className="btn" style={{ display: 'inline-flex', cursor: 'pointer' }}>
                    <ImageIcon size={14} /> {form.logo ? 'Changer' : 'Choisir un logo'}
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleLogo} />
                  </label>
                  {form.logo && (
                    <button type="button" className="btn" style={{ marginLeft: 8 }} onClick={() => set('logo', '')}>
                      Supprimer
                    </button>
                  )}
                  <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 6 }}>
                    Stocké localement (carré 256×256). Affiché en haut de la barre latérale.
                  </div>
                  {logoErr && <div style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4 }}>{logoErr}</div>}
                </div>
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Nom de l'agence (affiché à côté du logo)</label>
              <input className="form-input" value={form.agencyName} onChange={e => set('agencyName', e.target.value)} placeholder="AutoLoc" />
            </div>
            <div className="form-group">
              <label className="form-label">Sous-titre (sous le logo)</label>
              <input className="form-input" value={form.tagline} onChange={e => set('tagline', e.target.value)} placeholder="Location de véhicules" />
            </div>
            <div className="form-group"><label className="form-label">Adresse</label><input className="form-input" value={form.address} onChange={e => set('address', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Téléphone</label><input className="form-input" value={form.phone} onChange={e => set('phone', e.target.value)} /></div>
            <div className="form-group"><label className="form-label">Email</label><input className="form-input" type="email" value={form.email} onChange={e => set('email', e.target.value)} /></div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Règles de facturation</span>
          </div>
          <div className="card-body">
            <div className="form-group">
              <label className="form-label">Caution par défaut (DA)</label>
              <input className="form-input" type="number" value={form.deposit} onChange={e => set('deposit', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Pénalité de retard (%/jour)</label>
              <input className="form-input" type="number" value={form.lateFeePct} onChange={e => set('lateFeePct', +e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Devise</label>
              <select className="form-select" value={form.currency} onChange={e => set('currency', e.target.value)}>
                <option>DA</option>
                <option>EUR</option>
                <option>USD</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-header">
          <span className="card-title">À propos du système</span>
        </div>
        <div className="card-body">
          <div style={{ display: 'flex', gap: 40 }}>
            {[['Version', '1.0.0'], ['Technologie', 'React + Vite'], ['Développeur', 'AutoLoc Team']].map(([k, v]) => (
              <div key={k}>
                <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, marginBottom: 4 }}>{k}</div>
                <div style={{ fontWeight: 600 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
