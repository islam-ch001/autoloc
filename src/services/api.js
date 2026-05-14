// En dev → localhost, en prod → variable d'environnement Vite
const BASE = (import.meta.env.VITE_API_URL || 'http://localhost:3001') + '/api';

async function request(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Erreur serveur');
  return data;
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

// ─── Utilitaire ──────────────────────────────────────────────
function buildQS(params = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v != null && v !== '') q.append(k, v); });
  const s = q.toString();
  return s ? `?${s}` : '';
}
