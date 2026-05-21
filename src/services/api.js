import { getToken } from '../context/AuthContext';

// VITE_API_URL :
//  - défini  → utiliser cette URL (web production : Render)
//  - vide ('') ou non défini en desktop → URL relative (même origine, Electron)
//  - non défini en dev Vite (port 5173) → fallback localhost:3001
const envUrl = import.meta.env.VITE_API_URL;
const isDevVite = typeof window !== 'undefined' && window.location.port === '5173';
const BASE = (envUrl !== undefined ? envUrl : (isDevVite ? 'http://localhost:3001' : '')) + '/api';

// ─── Conversion snake_case → camelCase ─────────────────────
const toCamel = (s) => s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

function camelize(obj) {
  if (Array.isArray(obj)) return obj.map(camelize);
  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[toCamel(k)] = camelize(v);
    }
    return out;
  }
  return obj;
}

// ─── Conversion camelCase → snake_case (pour envoyer au backend) ──
const toSnake = (s) => s.replace(/([A-Z])/g, '_$1').toLowerCase();

function snakeify(obj) {
  if (Array.isArray(obj)) return obj.map(snakeify);
  if (obj && typeof obj === 'object' && obj.constructor === Object) {
    const out = {};
    for (const [k, v] of Object.entries(obj)) {
      out[toSnake(k)] = snakeify(v);
    }
    return out;
  }
  return obj;
}

async function request(method, path, body) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(snakeify(body)) : undefined,
  });
  if (res.status === 401) {
    localStorage.removeItem('autoloc_token');
    window.location.href = '/login';
    throw new Error('Session expirée');
  }
  if (res.status === 402) {
    // Abonnement requis → notifier l'app pour afficher l'écran adéquat
    window.dispatchEvent(new CustomEvent('autoloc:subscription-required'));
    const e = new Error('Abonnement requis');
    e.subscriptionRequired = true;
    throw e;
  }
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return camelize(data);
}

// ─── Véhicules ───────────────────────────────────────────────
export const getVehicles     = (status)     => request('GET', `/vehicles${status ? `?status=${status}` : ''}`);
export const getVehicle      = (id)         => request('GET', `/vehicles/${id}`);
export const createVehicle   = (data)       => request('POST', '/vehicles', data);
export const updateVehicle   = (id, data)   => request('PATCH', `/vehicles/${id}`, data);
export const deleteVehicle   = (id)         => request('DELETE', `/vehicles/${id}`);

// ─── Clients ─────────────────────────────────────────────────
export const getClients      = (params)     => request('GET', `/clients${buildQS(params)}`);
export const getClient       = (id)         => request('GET', `/clients/${id}`);
export const createClient    = (data)       => request('POST', '/clients', data);
export const updateClient    = (id, data)   => request('PATCH', `/clients/${id}`, data);
export const deleteClient    = (id)         => request('DELETE', `/clients/${id}`);

// ─── Chauffeurs (drivers) ────────────────────────────────────
export const getDrivers      = (params)     => request('GET', `/drivers${buildQS(params)}`);
export const getDriver       = (id)         => request('GET', `/drivers/${id}`);
export const createDriver    = (data)       => request('POST', '/drivers', data);
export const updateDriver    = (id, data)   => request('PATCH', `/drivers/${id}`, data);
export const deleteDriver    = (id)         => request('DELETE', `/drivers/${id}`);

// ─── Réservations ────────────────────────────────────────────
export const getReservations  = (status)   => request('GET', `/reservations${status ? `?status=${status}` : ''}`);
export const getReservation   = (id)       => request('GET', `/reservations/${id}`);
export const createReservation= (data)     => request('POST', '/reservations', data);
export const updateReservation= (id, data) => request('PATCH', `/reservations/${id}`, data);
export const deleteReservation= (id)       => request('DELETE', `/reservations/${id}`);

// ─── Retours ─────────────────────────────────────────────────
export const getReturns       = ()         => request('GET', '/returns');
export const createReturn     = (data)     => request('POST', '/returns', data);

// ─── Dashboard ───────────────────────────────────────────────
export const getDashboardStats       = () => request('GET', '/dashboard/stats');
export const getRecentReservations   = () => request('GET', '/dashboard/recent-reservations');

// ─── Maintenance ─────────────────────────────────────────────
export const getMaintenance     = (vehicleId)  => request('GET', `/maintenance${vehicleId ? `?vehicleId=${vehicleId}` : ''}`);
export const createMaintenance  = (data)       => request('POST', '/maintenance', data);
export const updateMaintenance  = (id, data)   => request('PATCH', `/maintenance/${id}`, data);
export const deleteMaintenance  = (id)         => request('DELETE', `/maintenance/${id}`);

// ─── Super-Admin ─────────────────────────────────────────────
export const adminListUsers      = ()             => request('GET', '/admin/users');
export const adminUpdateSubscription = (id, data) => request('PATCH', `/admin/users/${id}/subscription`, data);
export const adminBlockUser      = (id, data)     => request('PATCH', `/admin/users/${id}/block`, data);


// ─── Utilitaire ──────────────────────────────────────────────
function buildQS(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') q.append(k, v); });
  const s = q.toString();
  return s ? `?${s}` : '';
}
