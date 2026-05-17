import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth, getToken } from './AuthContext';

const SettingsContext = createContext();

const envUrl = import.meta.env.VITE_API_URL;
const isDevVite = typeof window !== 'undefined' && window.location.port === '5173';
const BASE = (envUrl !== undefined ? envUrl : (isDevVite ? 'http://localhost:3001' : '')) + '/api';

const DEFAULTS = {
  agencyName: 'AutoLoc',
  tagline:    'Location de véhicules',
  logo:       '',     // data URL base64
  address:    '',
  phone:      '',
  email:      '',
  deposit:    20000,
  lateFeePct: 10,
  currency:   'DA',
};

const cacheKey = (userId) => `autoloc_settings_${userId || 'guest'}`;

async function apiGet(token) {
  const res = await fetch(`${BASE}/auth/settings`, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) throw new Error('Failed to fetch settings');
  return res.json();
}

async function apiPut(token, settings) {
  const res = await fetch(`${BASE}/auth/settings`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(settings),
  });
  if (!res.ok) throw new Error('Failed to save settings');
  return res.json();
}

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState(DEFAULTS);

  // Charger : 1) cache local (instantané), 2) serveur (autoritaire)
  useEffect(() => {
    if (!user) return;
    // Cache local pour affichage instantané
    try {
      const raw = localStorage.getItem(cacheKey(user.id));
      if (raw) setSettings({ ...DEFAULTS, ...JSON.parse(raw) });
    } catch {}

    // Source de vérité = serveur (DB)
    const token = getToken();
    if (!token) return;
    apiGet(token)
      .then(remote => {
        const merged = { ...DEFAULTS, ...remote };
        setSettings(merged);
        try { localStorage.setItem(cacheKey(user.id), JSON.stringify(merged)); } catch {}
      })
      .catch(() => {});
  }, [user]);

  const save = useCallback(async (newSettings) => {
    if (!user) return;
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    try { localStorage.setItem(cacheKey(user.id), JSON.stringify(merged)); } catch {}
    const token = getToken();
    if (!token) return;
    try { await apiPut(token, merged); }
    catch (err) { console.error('Settings save error', err); throw err; }
  }, [user, settings]);

  return (
    <SettingsContext.Provider value={{ settings, save }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => useContext(SettingsContext);
