import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [vehicles,     setVehicles]     = useState([]);
  const [clients,      setClients]      = useState([]);
  const [reservations, setReservations] = useState([]);
  const [returns,      setReturns]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  // ── Chargement initial ─────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [v, c, r, ret] = await Promise.all([
        api.getVehicles(),
        api.getClients(),
        api.getReservations(),
        api.getReturns(),
      ]);
      setVehicles(v);
      setClients(c);
      setReservations(r);
      setReturns(ret);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── Véhicules ──────────────────────────────────────────────
  const addVehicle = async (data) => {
    const v = await api.createVehicle(data);
    setVehicles(prev => [...prev, v]);
    return v;
  };

  const patchVehicle = async (id, data) => {
    const v = await api.updateVehicle(id, data);
    setVehicles(prev => prev.map(x => x.id === id ? v : x));
    return v;
  };

  const removeVehicle = async (id) => {
    await api.deleteVehicle(id);
    setVehicles(prev => prev.filter(x => x.id !== id));
  };

  // ── Clients ────────────────────────────────────────────────
  const addClient = async (data) => {
    const c = await api.createClient(data);
    setClients(prev => [...prev, c]);
    return c;
  };

  const patchClient = async (id, data) => {
    const c = await api.updateClient(id, data);
    setClients(prev => prev.map(x => x.id === id ? c : x));
    return c;
  };

  // ── Réservations ───────────────────────────────────────────
  const addReservation = async (data) => {
    const r = await api.createReservation(data);
    setReservations(prev => [...prev, r]);
    // Rafraîchir les véhicules car le statut peut changer
    const updated = await api.getVehicles();
    setVehicles(updated);
    return r;
  };

  const updateReservation = async (id, data) => {
    const r = await api.updateReservation(id, data);
    setReservations(prev => prev.map(x => x.id === id ? { ...x, ...r } : x));
    const updated = await api.getVehicles();
    setVehicles(updated);
    return r;
  };

  const removeReservation = async (id) => {
    await api.deleteReservation(id);
    setReservations(prev => prev.filter(x => x.id !== id));
    const updated = await api.getVehicles();
    setVehicles(updated);
  };

  // ── Retours ────────────────────────────────────────────────
  const addReturn = async (data) => {
    const ret = await api.createReturn(data);
    setReturns(prev => [...prev, ret]);
    // Rafraîchir réservations + véhicules
    const [res, veh] = await Promise.all([api.getReservations(), api.getVehicles()]);
    setReservations(res);
    setVehicles(veh);
    return ret;
  };

  // ── Helpers compatibilité ──────────────────────────────────
  const getClient      = (id) => clients.find(c => c.id === id);
  const getVehicle     = (id) => vehicles.find(v => v.id === id);
  const getReservation = (id) => reservations.find(r => r.id === id);

  const value = {
    vehicles, clients, reservations, returns,
    loading, error, reload: loadAll,
    // Véhicules
    setVehicles, addVehicle, patchVehicle, removeVehicle,
    // Clients
    setClients, addClient, patchClient,
    // Réservations
    setReservations, addReservation, updateReservation, removeReservation,
    // Retours
    setReturns, addReturn,
    // Helpers
    getClient, getVehicle, getReservation,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => useContext(AppContext);
