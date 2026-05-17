import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';

const SettingsContext = createContext();

const DEFAULTS = {
  agencyName: 'AutoLoc',
  tagline:    'Location de véhicules',
  address:    '',
  phone:      '',
  email:      '',
  deposit:    20000,
  lateFeePct: 10,
  currency:   'DA',
};

const keyFor = (userId) => `autoloc_settings_${userId || 'guest'}`;

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULTS);

  // Recharger les settings à chaque changement d'utilisateur
  useEffect(() => {
    if (!user) return;
    try {
      const raw = localStorage.getItem(keyFor(user.id));
      setSettings(raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS);
    } catch {
      setSettings(DEFAULTS);
    }
  }, [user]);

  const save = useCallback((newSettings) => {
    if (!user) return;
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    localStorage.setItem(keyFor(user.id), JSON.stringify(merged));
  }, [user, settings]);

  return (
    <SettingsContext.Provider value={{ settings, save }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
