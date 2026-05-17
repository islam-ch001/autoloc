import { useState, useEffect, useRef } from 'react';
import { Search, X, Check } from 'lucide-react';

// Champ de recherche client avec suggestions
// Props :
//  - clients : liste complète
//  - value : id du client sélectionné (number) ou ''
//  - onChange : callback(id) appelé avec le nouveau id
//  - placeholder
export default function ClientAutocomplete({ clients, value, onChange, placeholder = 'Tapez un nom, prénom ou téléphone…' }) {
  const selected = clients.find(c => c.id === +value) || null;
  const [text, setText] = useState(selected ? `${selected.firstName} ${selected.lastName}` : '');
  const [open, setOpen] = useState(false);
  const [hi, setHi] = useState(0);
  const boxRef = useRef(null);

  // Sync si le client sélectionné change depuis l'extérieur
  useEffect(() => {
    if (selected) setText(`${selected.firstName} ${selected.lastName}`);
  }, [selected?.id]);

  // Fermer en cliquant à l'extérieur
  useEffect(() => {
    const onDoc = (e) => { if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  // Filtrage : si déjà sélectionné et texte non modifié → on montre tout
  const q = text.trim().toLowerCase();
  const showAll = selected && q === `${selected.firstName} ${selected.lastName}`.toLowerCase();
  const suggestions = (q && !showAll
    ? clients.filter(c => `${c.firstName} ${c.lastName} ${c.phone || ''} ${c.email || ''}`.toLowerCase().includes(q))
    : clients
  ).slice(0, 8);

  const pick = (c) => {
    onChange(c.id);
    setText(`${c.firstName} ${c.lastName}`);
    setOpen(false);
  };

  const clear = () => {
    onChange('');
    setText('');
    setOpen(true);
  };

  const onKeyDown = (e) => {
    if (!open) { if (['ArrowDown', 'Enter'].includes(e.key)) setOpen(true); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setHi(h => Math.min(h + 1, suggestions.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setHi(h => Math.max(h - 1, 0)); }
    else if (e.key === 'Enter') { e.preventDefault(); if (suggestions[hi]) pick(suggestions[hi]); }
    else if (e.key === 'Escape') { setOpen(false); }
  };

  return (
    <div ref={boxRef} style={{ position: 'relative' }}>
      <div style={{ position: 'relative' }}>
        <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
        <input
          className="form-input"
          style={{ paddingLeft: 36, paddingRight: text ? 32 : 12 }}
          value={text}
          onChange={e => { setText(e.target.value); setOpen(true); setHi(0); if (selected) onChange(''); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
        />
        {text && (
          <button type="button" onClick={clear} title="Effacer"
            style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-3)', padding: 4, display: 'flex' }}>
            <X size={14} />
          </button>
        )}
      </div>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
          boxShadow: '0 10px 30px rgba(0,0,0,0.4)', zIndex: 50,
          maxHeight: 280, overflowY: 'auto',
        }}>
          {suggestions.length === 0 ? (
            <div style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-3)' }}>
              Aucun client trouvé. Créez-le depuis l'onglet Clients d'abord.
            </div>
          ) : suggestions.map((c, idx) => {
            const isSelected = c.id === +value;
            const isHi = idx === hi;
            return (
              <div
                key={c.id}
                onMouseDown={(e) => { e.preventDefault(); pick(c); }}
                onMouseEnter={() => setHi(idx)}
                style={{
                  padding: '10px 14px', cursor: 'pointer',
                  background: isHi ? 'var(--surface-2)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text)' }}>
                    {c.firstName} {c.lastName}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-3)' }}>
                    {c.phone}{c.email ? ` · ${c.email}` : ''}
                  </div>
                </div>
                {isSelected && <Check size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
