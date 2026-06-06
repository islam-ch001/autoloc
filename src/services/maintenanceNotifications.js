/**
 * Service de rappels de maintenance (notifications push Android/iOS).
 * Programme des notifications locales avant chaque echeance.
 *
 * Declencheurs :
 *   - 7 jours avant la nextDate prevue
 *   - 1 jour avant la nextDate prevue
 *   - Quand le km actuel atteint nextMileage - 500
 *   - Quand nextMileage est depasse (alerte urgente)
 */

import { LocalNotifications } from '@capacitor/local-notifications';
import { Capacitor } from '@capacitor/core';
import { parseISO, differenceInDays, addDays } from 'date-fns';

const IS_NATIVE = Capacitor.isNativePlatform();

// --- Permission ----------------------------------------------------
let permissionRequested = false;
export async function ensureNotificationPermission() {
  if (!IS_NATIVE) return false;
  try {
    const perm = await LocalNotifications.checkPermissions();
    if (perm.display === 'granted') return true;
    if (permissionRequested) return false;
    permissionRequested = true;
    const result = await LocalNotifications.requestPermissions();
    return result.display === 'granted';
  } catch (e) {
    console.warn('[notifs] Permission error:', e);
    return false;
  }
}

// --- Generation d'un ID stable a partir d'une chaine -----------------
// (LocalNotifications exige un ID numerique 32-bit unique)
function hashId(str) {
  let h = 5381;
  for (let i = 0; i < str.length; i++) h = ((h << 5) + h) + str.charCodeAt(i);
  return Math.abs(h | 0);  // signed 32-bit
}

// --- Annule toutes les notifs deja programmees pour ce service -------
export async function cancelAllMaintenanceNotifs() {
  if (!IS_NATIVE) return;
  try {
    const { notifications } = await LocalNotifications.getPending();
    const ids = notifications
      .filter(n => n.extra?.type === 'maintenance')
      .map(n => ({ id: n.id }));
    if (ids.length > 0) await LocalNotifications.cancel({ notifications: ids });
  } catch (e) {
    console.warn('[notifs] Cancel error:', e);
  }
}

// --- Programme une notification a une date donnee --------------------
async function scheduleAt(id, title, body, when, extra = {}) {
  if (when <= new Date()) return; // Date passee : on ignore
  await LocalNotifications.schedule({
    notifications: [{
      id,
      title,
      body,
      schedule: { at: when, allowWhileIdle: true },
      smallIcon: 'ic_stat_icon',  // fallback sur icone de l'app si non present
      iconColor: '#6366F1',
      extra: { type: 'maintenance', ...extra },
    }],
  });
}

// --- Programme une notif IMMEDIATE (pour les alertes urgentes) ------
async function fireNow(id, title, body, extra = {}) {
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id,
        title,
        body,
        schedule: { at: new Date(Date.now() + 5000) },  // dans 5 sec
        iconColor: '#EF4444',
        extra: { type: 'maintenance', ...extra },
      }],
    });
  } catch (e) { console.warn('[notifs] Fire error:', e); }
}

// --- API principale : sync les notifs avec la liste de maintenance ---
export async function syncMaintenanceNotifications({ maintenance, vehicles }) {
  if (!IS_NATIVE) return;
  const granted = await ensureNotificationPermission();
  if (!granted) return;

  // On efface les anciennes notifs maintenance avant de re-programmer
  await cancelAllMaintenanceNotifs();

  const today = new Date();
  const next7Days = addDays(today, 7);

  for (const m of maintenance) {
    if (!m) continue;
    const vehicle = vehicles.find(v => v.id === m.vehicleId);
    const carName = vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.plate})` : `Vehicule #${m.vehicleId}`;

    // --- Rappel par DATE ---
    if (m.nextDate) {
      let nextDateObj;
      try { nextDateObj = parseISO(m.nextDate); } catch { continue; }
      const daysUntil = differenceInDays(nextDateObj, today);

      // J-7 : rappel "approche"
      if (daysUntil > 7) {
        const at = addDays(nextDateObj, -7);
        at.setHours(9, 0, 0, 0);
        await scheduleAt(
          hashId(`m-${m.id}-d7`),
          'Maintenance dans 7 jours',
          `${carName} : ${m.type} prevu pour le ${nextDateObj.toLocaleDateString('fr-FR')}.`,
          at, { maintenanceId: m.id }
        );
      }
      // J-1 : rappel "demain"
      if (daysUntil > 1) {
        const at = addDays(nextDateObj, -1);
        at.setHours(9, 0, 0, 0);
        await scheduleAt(
          hashId(`m-${m.id}-d1`),
          'Maintenance demain',
          `${carName} : ${m.type} prevu demain. Pensez a prendre rendez-vous.`,
          at, { maintenanceId: m.id }
        );
      }
      // Jour J : rappel "aujourd'hui"
      if (daysUntil >= 0) {
        const at = new Date(nextDateObj);
        at.setHours(9, 0, 0, 0);
        await scheduleAt(
          hashId(`m-${m.id}-d0`),
          'Maintenance prevue aujourd\'hui',
          `${carName} : ${m.type} a faire aujourd'hui.`,
          at, { maintenanceId: m.id }
        );
      }
      // Date depassee : alerte URGENTE immediate (une seule fois par session)
      if (daysUntil < 0 && daysUntil > -30) {
        await fireNow(
          hashId(`m-${m.id}-overdue`),
          '⚠ Maintenance en retard',
          `${carName} : ${m.type} aurait du etre fait le ${nextDateObj.toLocaleDateString('fr-FR')} (${-daysUntil} jours de retard).`,
          { maintenanceId: m.id }
        );
      }
    }

    // --- Rappel par KILOMETRAGE ---
    if (m.nextMileage && vehicle) {
      const currentKm = vehicle.mileage || 0;
      const kmRemaining = m.nextMileage - currentKm;

      if (kmRemaining <= 0) {
        // Kilometrage depasse : alerte urgente
        await fireNow(
          hashId(`m-${m.id}-km-over`),
          '⚠ Kilometrage maintenance depasse',
          `${carName} : ${m.type} prevu a ${m.nextMileage.toLocaleString()} km, vous etes a ${currentKm.toLocaleString()} km.`,
          { maintenanceId: m.id }
        );
      } else if (kmRemaining <= 500) {
        // Moins de 500km : alerte approche
        await fireNow(
          hashId(`m-${m.id}-km-near`),
          'Maintenance kilometrique approche',
          `${carName} : ${m.type} dans ${kmRemaining.toLocaleString()} km (${m.nextMileage.toLocaleString()} km prevu).`,
          { maintenanceId: m.id }
        );
      }
    }
  }
}
