import { getBrandColor } from '../data/carBrands';

// Badge visuel pour une marque + modèle
// Couleurs signature de la marque, première lettre, nom complet
export default function BrandBadge({ brand, model, size = 'lg' }) {
  if (!brand) return null;
  const color = getBrandColor(brand);
  const initial = brand[0]?.toUpperCase();
  const isLarge = size === 'lg';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 14,
      padding: isLarge ? '14px 16px' : '8px 12px',
      background: 'var(--bg-2)',
      borderRadius: 12,
      border: '1px solid var(--border)',
    }}>
      <div style={{
        width:  isLarge ? 56 : 40,
        height: isLarge ? 56 : 40,
        borderRadius: '50%',
        background: `linear-gradient(135deg, ${color}, ${darken(color, 0.2)})`,
        color: getTextColorFor(color),
        display: 'grid', placeItems: 'center',
        fontWeight: 800, fontSize: isLarge ? 26 : 18,
        fontFamily: "'Space Grotesk', sans-serif",
        boxShadow: `0 4px 14px ${color}44`,
        flexShrink: 0,
        border: '2px solid rgba(255,255,255,0.15)',
      }}>
        {initial}
      </div>
      <div style={{ minWidth: 0, flex: 1 }}>
        <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: isLarge ? 18 : 14, color: 'var(--text)', letterSpacing: -0.3 }}>
          {brand}
        </div>
        {model && (
          <div style={{ fontSize: isLarge ? 14 : 12, color: 'var(--text-2)', marginTop: 2 }}>
            {model}
          </div>
        )}
      </div>
    </div>
  );
}

// Assombrit une couleur hex de X%
function darken(hex, amount) {
  const c = hex.replace('#', '');
  const r = Math.max(0, parseInt(c.slice(0, 2), 16) - Math.round(255 * amount));
  const g = Math.max(0, parseInt(c.slice(2, 4), 16) - Math.round(255 * amount));
  const b = Math.max(0, parseInt(c.slice(4, 6), 16) - Math.round(255 * amount));
  return `#${[r, g, b].map(v => v.toString(16).padStart(2, '0')).join('')}`;
}

// Choisit blanc ou noir pour contraster avec la couleur de fond
function getTextColorFor(hex) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16);
  const g = parseInt(c.slice(2, 4), 16);
  const b = parseInt(c.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? '#000000' : '#ffffff';
}
