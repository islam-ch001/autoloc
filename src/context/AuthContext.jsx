import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AuthContext = createContext();
const envUrl = import.meta.env.VITE_API_URL;
const isDevVite = typeof window !== 'undefined' && window.location.port === '5173';
const BASE = (envUrl !== undefined ? envUrl : (isDevVite ? 'http://localhost:3001' : '')) + '/api';

// Convertit snake_case → camelCase (cohérent avec api.js)
const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
function camelize(obj) {
  if (Array.isArray(obj)) return obj.map(camelize);
  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) out[toCamel(k)] = camelize(v);
    return out;
  }
  return obj;
}

// Token + user cache persistés dans localStorage (optimistic auth)
const TOKEN_KEY = 'autoloc_token';
const USER_KEY = 'autoloc_user';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);
const getCachedUser = () => {
  try { const s = localStorage.getItem(USER_KEY); return s ? JSON.parse(s) : null; }
  catch { return null; }
};
const setCachedUser = (u) => {
  if (u) localStorage.setItem(USER_KEY, JSON.stringify(u));
  else   localStorage.removeItem(USER_KEY);
};

export function AuthProvider({ children }) {
  // OPTIMISTIC AUTH : si un user est en cache, on l'utilise IMMEDIATEMENT
  // → pas de "Vérification de la session…" sur les visites suivantes
  const initialToken = getToken();
  const initialUser  = initialToken ? getCachedUser() : null;
  const [user, setUser]       = useState(initialUser);
  // loading = true seulement si on n'a PAS de cache (1ere visite ou logout)
  const [loading, setLoading] = useState(!initialUser);

  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) { setUser(null); setCachedUser(null); setLoading(false); return; }
    try {
      const res = await fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      const freshUser = camelize(await res.json());
      setUser(freshUser);
      setCachedUser(freshUser);  // met le cache a jour avec les dernieres donnees
    } catch {
      // Token invalide → on nettoie et on force re-login
      setToken(null);
      setCachedUser(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Au mount : on revalide en arriere-plan (l'app est deja accessible si user en cache)
  useEffect(() => { fetchMe(); }, [fetchMe]);

  const login = async (email, password) => {
    const res = await fetch(`${BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur de connexion');
    setToken(data.token);
    const u = camelize(data.user);
    setUser(u);
    setCachedUser(u);
  };

  // Auto-login pour l'app desktop (single-user offline, pas de mot de passe)
  const desktopAutoLogin = async () => {
    const res = await fetch(`${BASE}/auth/desktop-auto-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur de demarrage');
    setToken(data.token);
    const u = camelize(data.user);
    setUser(u);
    setCachedUser(u);
    return data.user;
  };

  // Étape 1 : demander l'envoi du code par email
  const signupRequest = async (name, email, password) => {
    const res = await fetch(`${BASE}/auth/signup-request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur d\'inscription');
    return data;
  };

  // Étape 2 : vérifier le code → compte créé + auto-login
  const signupVerify = async (email, code) => {
    const res = await fetch(`${BASE}/auth/signup-verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Code invalide');
    setToken(data.token);
    const u = camelize(data.user);
    setUser(u);
    setCachedUser(u);
  };

  const signupResend = async (email) => {
    const res = await fetch(`${BASE}/auth/signup-resend`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur');
    return data;
  };

  // Mot de passe oublié
  const forgotPassword = async (email) => {
    const res = await fetch(`${BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur');
    return data;
  };

  const resetPassword = async (email, code, newPassword) => {
    const res = await fetch(`${BASE}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, code, newPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Erreur');
    return data;
  };

  const logout = () => {
    setToken(null);
    setCachedUser(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, desktopAutoLogin, signupRequest, signupVerify, signupResend, forgotPassword, resetPassword, logout, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
