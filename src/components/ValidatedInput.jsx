import { forwardRef, useState } from 'react';
import { Check, AlertCircle, AlertTriangle, Eye, EyeOff } from 'lucide-react';

/**
 * ValidatedInput — champ de saisie avec validation visuelle, style HeroUI InputGroup.
 *
 * Props principales :
 *   - label (string)
 *   - value, onChange, type, placeholder, etc. (props HTML standard)
 *   - icon (ReactNode)        : icône à gauche
 *   - validation              : 'success' | 'error' | 'warning' | null
 *   - helperText (string)     : message sous le champ (couleur selon validation)
 *   - description (string)    : texte de description neutre sous le champ
 *   - required (boolean)
 *   - showPasswordToggle      : ajoute le bouton œil pour les mots de passe
 */
const ValidatedInput = forwardRef(function ValidatedInput({
  label,
  icon,
  validation,
  helperText,
  description,
  required = false,
  type = 'text',
  showPasswordToggle = false,
  className = '',
  ...inputProps
}, ref) {
  const [revealed, setRevealed] = useState(false);
  const realType = showPasswordToggle ? (revealed ? 'text' : 'password') : type;

  const wrapClass = `vinput-wrap vinput-${validation || 'default'} ${className}`;

  return (
    <div className="vinput-group">
      {label && (
        <label className="vinput-label">
          {label}{required && <span className="vinput-required">*</span>}
        </label>
      )}

      <div className={wrapClass}>
        {icon && <span className="vinput-icon-left">{icon}</span>}
        <input
          ref={ref}
          type={realType}
          className="vinput-field"
          {...inputProps}
          style={{ paddingLeft: icon ? 40 : 14, paddingRight: (showPasswordToggle || validation) ? 40 : 14, ...inputProps.style }}
        />
        {showPasswordToggle && (
          <button
            type="button"
            className="vinput-icon-right vinput-eye"
            onClick={() => setRevealed(r => !r)}
            tabIndex={-1}
            title={revealed ? 'Masquer' : 'Afficher'}
          >
            {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {validation === 'success' && !showPasswordToggle && (
          <span className="vinput-icon-right vinput-status success"><Check size={16} /></span>
        )}
        {validation === 'error' && !showPasswordToggle && (
          <span className="vinput-icon-right vinput-status error"><AlertCircle size={16} /></span>
        )}
        {validation === 'warning' && !showPasswordToggle && (
          <span className="vinput-icon-right vinput-status warning"><AlertTriangle size={16} /></span>
        )}
      </div>

      {helperText && (
        <p className={`vinput-helper vinput-helper-${validation || 'default'}`}>
          {validation === 'success' && <Check size={12} />}
          {validation === 'error' && <AlertCircle size={12} />}
          {validation === 'warning' && <AlertTriangle size={12} />}
          {helperText}
        </p>
      )}
      {!helperText && description && (
        <p className="vinput-description">{description}</p>
      )}
    </div>
  );
});

export default ValidatedInput;
