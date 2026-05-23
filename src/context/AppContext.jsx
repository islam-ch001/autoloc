import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [vehicles,     setVehicles]     = useState([]);
  const [clients,      setClients]      = useState([]);
  const [drivers,      setDrivers]      = useState([]);
  const [reservations, setReservations] = useState([]);
  const [returns,      setReturns]      = useState([]);
  const [maintenance,  setMaintenance]  = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(null);

  // ── Chargement initial ─────────────────────────────────────
  const loadAll = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Essai 1 : endpoint /bootstrap (1 seule requête, 5-10x plus rapide)
      try {
        const all = await api.getBootstrap();
        setVehicles(all.vehicles || []);
        setClients(all.clients || []);
        setDrivers(all.drivers || []);
        setReservations(all.reservations || []);
        setReturns(all.returns || []);
        setMaintenance(all.maintenance || []);
        return;
      } catch (e) {
        // Fallback : 6 requêtes parallèles (compat avec ancien backend)
        if (!String(e.message).match(/404|introuvable/i)) throw e;
      }
      const [v, c, d, r, ret, m] = await Promise.all([
        api.getVehicles(),
        api.getClients(),
        api.getDrivers().catch(() => []),
        api.getReservations(),
        api.getReturns(),
        api.getMaintenance(),
      ]);
      setVehicles(v);
      setClients(c);
      setDrivers(d);
      setReservations(r);
      setReturns(ret);
      setMaintenance(m);
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

  // ── Chauffeurs ─────────────────────────────────────────────
  const addDriver = async (data) => {
    const d = await api.createDriver(data);
    setDrivers(prev => [...prev, d]);
    return d;
  };
  const patchDriver = async (id, data) => {
    const d = await api.updateDriver(id, data);
    setDrivers(prev => prev.map(x => x.id === id ? d : x));
    return d;
  };
  const removeDriver = async (id) => {
    await api.deleteDriver(id);
    setDrivers(prev => prev.filter(x => x.id !== id));
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

  // ── Maintenance ────────────────────────────────────────────
  const addMaintenance = async (data) => {
    const m = await api.createMaintenance(data);
    // La réponse POST ne contient pas les infos du véhicule (jointure côté GET) → on enrichit localement
    const v = vehicles.find(vv => vv.id === m.vehicleId);
    const enriched = v ? { ...m, brand: v.brand, model: v.model, plate: v.plate } : m;
    setMaintenance(prev => [enriched, ...prev]);
    // Re-charger les véhicules si le statut a pu changer
    if (data.setInMaintenance) {
      const updated = await api.getVehicles();
      setVehicles(updated);
    }
    return enriched;
  };
  const patchMaintenance = async (id, data) => {
    const m = await api.updateMaintenance(id, data);
    setMaintenance(prev => prev.map(x => x.id === id ? { ...x, ...m } : x));
    return m;
  };
  const removeMaintenance = async (id) => {
    await api.deleteMaintenance(id);
    setMaintenance(prev => prev.filter(x => x.id !== id));
  };

  const value = {
    vehicles, clients, drivers, reservations, returns, maintenance,
    loading, error, reload: loadAll,
    addMaintenance, patchMaintenance, removeMaintenance,
    // Véhicules
    setVehicles, addVehicle, patchVehicle, removeVehicle,
    // Clients
    setClients, addClient, patchClient,
    // Chauffeurs
    setDrivers, addDriver, patchDriver, removeDriver,
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
