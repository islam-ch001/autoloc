import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();
const KEY = 'autoloc_theme';

function getInitial() {
  try {
    const stored = localStorage.getItem(KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  } catch {}
  // Par défaut : suivre la préférence système (mais on garde dark si pas dispo)
  if (typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: light)').matches) {
    return 'light';
  }
  return 'dark';
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitial);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch {}
  }, [theme]);

  const setTheme = (t) => setThemeState(t === 'light' ? 'light' : 'dark');
  const toggle = () => setThemeState(prev => (prev === 'dark' ? 'light' : 'dark'));

  return <ThemeContext.Provider value={{ theme, setTheme, toggle }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
