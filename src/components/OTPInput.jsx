import { useRef, useEffect } from 'react';

/**
 * OTPInput — composant de saisie de code à 6 chiffres, style HeroUI.
 *
 * Props :
 *   - value (string)         : valeur actuelle (ex: "123456")
 *   - onChange (string=>void): callback quand la valeur change
 *   - length (number)        : nombre de cases (defaut 6)
 *   - autoFocus (boolean)    : focus la 1ere case au mount
 *   - disabled (boolean)
 *
 * Comportement :
 *   - 1 chiffre par case
 *   - Focus auto sur la case suivante quand on tape
 *   - Backspace : efface + recule
 *   - Flèches gauche/droite pour naviguer
 *   - Coller (paste) : distribue les chiffres sur les cases
 *   - Auto-submit visuel quand toutes les cases sont remplies
 */
export default function OTPInput({ value = '', onChange, length = 6, autoFocus = false, disabled = false }) {
  const inputsRef = useRef([]);
  const digits = String(value).padEnd(length, ' ').slice(0, length).split('');

  useEffect(() => {
    if (autoFocus && inputsRef.current[0]) {
      inputsRef.current[0].focus();
    }
  }, [autoFocus]);

  const setDigit = (idx, digit) => {
    const arr = String(value).padEnd(length, ' ').slice(0, length).split('');
    arr[idx] = digit || ' ';
    const newValue = arr.join('').replace(/ /g, '').replace(/\D/g, '');
    onChange?.(newValue);
  };

  const handleChange = (idx, e) => {
    const raw = e.target.value;
    // Si l'utilisateur tape plusieurs chiffres d'un coup (paste, autofill SMS)
    if (raw.length > 1) {
      const cleanPaste = raw.replace(/\D/g, '').slice(0, length);
      onChange?.(cleanPaste);
      // Focus la derniere case remplie
      const lastFilled = Math.min(cleanPaste.length, length - 1);
      inputsRef.current[lastFilled]?.focus();
      return;
    }
    const digit = raw.replace(/\D/g, '');
    if (!digit) return;
    setDigit(idx, digit);
    // Focus la case suivante
    if (idx < length - 1) {
      inputsRef.current[idx + 1]?.focus();
      inputsRef.current[idx + 1]?.select();
    }
  };

  const handleKeyDown = (idx, e) => {
    if (e.key === 'Backspace') {
      e.preventDefault();
      const currentDigit = digits[idx]?.trim();
      if (currentDigit) {
        // Case avec valeur → on l'efface
        setDigit(idx, '');
      } else if (idx > 0) {
        // Case vide → recule + efface la précédente
        setDigit(idx - 1, '');
        inputsRef.current[idx - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && idx > 0) {
      e.preventDefault();
      inputsRef.current[idx - 1]?.focus();
      inputsRef.current[idx - 1]?.select();
    } else if (e.key === 'ArrowRight' && idx < length - 1) {
      e.preventDefault();
      inputsRef.current[idx + 1]?.focus();
      inputsRef.current[idx + 1]?.select();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = (e.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, length);
    if (!pasted) return;
    onChange?.(pasted);
    const lastFilled = Math.min(pasted.length, length - 1);
    inputsRef.current[lastFilled]?.focus();
  };

  return (
    <div className="otp-input-wrap" onPaste={handlePaste}>
      {Array.from({ length }).map((_, idx) => {
        const digit = digits[idx]?.trim() || '';
        return (
          <input
            key={idx}
            ref={(el) => (inputsRef.current[idx] = el)}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={1}
            value={digit}
            disabled={disabled}
            onChange={(e) => handleChange(idx, e)}
            onKeyDown={(e) => handleKeyDown(idx, e)}
            onFocus={(e) => e.target.select()}
            className={`otp-input-cell ${digit ? 'filled' : ''}`}
            aria-label={`Chiffre ${idx + 1}`}
          />
        );
      })}
    </div>
  );
}
