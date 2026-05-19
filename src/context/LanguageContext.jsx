import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { TRANSLATIONS, LANGS } from '../i18n/translations';

const LanguageContext = createContext();
const KEY = 'autoloc_lang';

function getInitial() {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored && LANGS[stored]) return stored;
  } catch {}
  return 'fr';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(getInitial);

  useEffect(() => {
    const cfg = LANGS[lang];
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('dir', cfg.dir);
    try { localStorage.setItem(KEY, lang); } catch {}
  }, [lang]);

  const setLang = useCallback((l) => {
    if (LANGS[l]) setLangState(l);
  }, []);

  const t = useCallback((key, fallback) => {
    const dict = TRANSLATIONS[lang] || TRANSLATIONS.fr;
    return dict[key] || TRANSLATIONS.fr[key] || fallback || key;
  }, [lang]);

  const toggle = useCallback(() => {
    setLangState(prev => prev === 'fr' ? 'ar' : 'fr');
  }, []);

  return (
    <LanguageContext.Provider value={{ lang, setLang, toggle, t, dir: LANGS[lang].dir, isRTL: LANGS[lang].dir === 'rtl' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useT = () => useContext(LanguageContext);
