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

// Token persisté dans localStorage
const TOKEN_KEY = 'autoloc_token';
export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = useCallback(async () => {
    const token = getToken();
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const res = await fetch(`${BASE}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error();
      setUser(camelize(await res.json()));
    } catch {
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

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
    setUser(camelize(data.user));
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
    setUser(camelize(data.user));
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
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signupRequest, signupVerify, signupResend, forgotPassword, resetPassword, logout, refreshUser: fetchMe }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
