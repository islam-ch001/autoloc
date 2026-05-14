import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, parseISO, isWithinInterval } from 'date-fns';
import { fr } from 'date-fns/locale';

const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];

export default function Calendar() {
  const { reservations, vehicles, clients } = useApp();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedVehicle, setSelectedVehicle] = useState('all');

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start: calStart, end: calEnd });

  const filteredRes = reservations.filter(r =>
    (selectedVehicle === 'all' || r.vehicleId === +selectedVehicle) &&
    r.status !== 'cancelled'
  );

  const getEvents = (day) => filteredRes.filter(r => {
    try {
      return isWithinInterval(day, { start: parseISO(r.startDate), end: parseISO(r.endDate) });
    } catch { return false; }
  });

  const statusColor = { active: '#10b981', upcoming: '#3b82f6', completed: '#707088' };

  const prev = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const next = () => setCurrentDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const activeVehicles = [...new Set(reservations.map(r => r.vehicleId))];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Calendrier</h1>
          <p className="page-subtitle">Vue des disponibilités et réservations</p>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <select className="form-select" style={{ width: 220 }} value={selectedVehicle} onChange={e => setSelectedVehicle(e.target.value)}>
            <option value="all">Tous les véhicules</option>
            {activeVehicles.map(id => {
              const v = vehicles.find(vv => vv.id === id);
              return v ? <option key={id} value={id}>{v.brand} {v.model}</option> : null;
            })}
          </select>
        </div>
      </div>

      {/* Month nav */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
        <button className="btn btn-sm" onClick={prev}><ChevronLeft size={16} /></button>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, textTransform: 'capitalize', minWidth: 200, textAlign: 'center' }}>
          {format(currentDate, 'MMMM yyyy', { locale: fr })}
        </h2>
        <button className="btn btn-sm" onClick={next}><ChevronRight size={16} /></button>
        <button className="btn btn-sm" onClick={() => setCurrentDate(new Date())}>Aujourd'hui</button>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 16, fontSize: 12 }}>
          {Object.entries({ active: 'Active', upcoming: 'À venir', completed: 'Terminée' }).map(([k, label]) => (
            <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: statusColor[k] }} />
              <span style={{ color: 'var(--text-3)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <div className="card-body" style={{ padding: 16 }}>
          {/* Day headers */}
          <div className="calendar-grid" style={{ marginBottom: 4 }}>
            {DAY_NAMES.map(d => (
              <div key={d} className="calendar-header-cell">{d}</div>
            ))}
          </div>

          {/* Days */}
          <div className="calendar-grid">
            {days.map(day => {
              const events = getEvents(day);
              const isOther = !isSameMonth(day, currentDate);
              const isTod = isToday(day);
              return (
                <div key={day.toString()} className={`calendar-cell ${isTod ? 'today' : ''} ${isOther ? 'other-month' : ''}`}>
                  <div className="calendar-day" style={{ color: isTod ? 'var(--primary)' : undefined }}>
                    {format(day, 'd')}
                  </div>
                  {events.slice(0, 2).map(r => {
                    const client = clients.find(c => c.id === r.clientId);
                    const vehicle = vehicles.find(v => v.id === r.vehicleId);
                    return (
                      <div key={r.id} className="calendar-event" style={{ background: `${statusColor[r.status]}22`, color: statusColor[r.status], border: `1px solid ${statusColor[r.status]}44` }}>
                        {vehicle?.brand} — {client?.lastName}
                      </div>
                    );
                  })}
                  {events.length > 2 && <div style={{ fontSize: 10, color: 'var(--text-3)', paddingLeft: 4 }}>+{events.length - 2}</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Vehicle timeline */}
      <div style={{ marginTop: 24 }}>
        <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 16, marginBottom: 16 }}>Disponibilité des véhicules</h2>
        <div className="card">
          <div style={{ overflowX: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Véhicule</th>
                  <th>Statut</th>
                  <th>Réservations en cours</th>
                  <th>Prochaine dispo</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map(v => {
                  const activeR = reservations.find(r => r.vehicleId === v.id && r.status === 'active');
                  const upcomingR = reservations.filter(r => r.vehicleId === v.id && r.status === 'upcoming').sort((a, b) => new Date(a.startDate) - new Date(b.startDate))[0];
                  const sMap = { available: { cls: 'badge-success', label: 'Disponible' }, rented: { cls: 'badge-accent', label: 'En location' }, maintenance: { cls: 'badge-warning', label: 'Maintenance' } };
                  const s = sMap[v.status];
                  return (
                    <tr key={v.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{v.brand} {v.model}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-3)' }}>{v.plate}</div>
                      </td>
                      <td><span className={`badge ${s.cls}`}>{s.label}</span></td>
                      <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                        {activeR ? (
                          <span>Jusqu'au {activeR.endDate} — {clients.find(c => c.id === activeR.clientId)?.lastName}</span>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: 'var(--text-2)' }}>
                        {upcomingR ? `${upcomingR.startDate} → ${upcomingR.endDate}` : (v.status === 'available' ? <span style={{ color: 'var(--success)' }}>Disponible maintenant</span> : '—')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
