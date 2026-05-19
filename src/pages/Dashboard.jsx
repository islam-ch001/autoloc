import { Car, FileText, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Clock, Wrench, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { useT } from '../context/LanguageContext';
import { useMemo } from 'react';

const formatDA = (n) => (n || 0).toLocaleString('fr-DZ') + ' DA';

const MONTH_LABELS = ['Janv', 'Févr', 'Mars', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sept', 'Oct', 'Nov', 'Déc'];

// Couleurs pour les catégories de véhicules
const CAT_COLORS = {
  'SUV':        '#f59e0b',
  'Berline':    '#3b82f6',
  'Citadine':   '#10b981',
  'Premium':    '#8b5cf6',
  'Économique': '#6b7280',
  'Utilitaire': '#ef4444',
};

export default function Dashboard() {
  const { vehicles, clients, reservations, maintenance: maintenanceList = [] } = useApp();
  const { t } = useT();

  const available = vehicles.filter(v => v.status === 'available').length;
  const rented = vehicles.filter(v => v.status === 'rented').length;
  const maintenance = vehicles.filter(v => v.status === 'maintenance').length;
  const activeRes = reservations.filter(r => r.status === 'active');
  const upcomingRes = reservations.filter(r => r.status === 'upcoming');
  const totalRevenue = reservations.filter(r => r.status === 'completed' || r.status === 'active').reduce((s, r) => s + r.paidAmount, 0);
  const unpaid = activeRes.reduce((s, r) => s + (r.totalPrice - r.paidAmount), 0);
  const maintenanceCost = maintenanceList.reduce((s, m) => s + (m.cost || 0), 0);
  const netRevenue = totalRevenue - maintenanceCost;

  // Revenu des 6 derniers mois — calculé depuis les réservations réelles
  const monthlyRevenue = useMemo(() => {
    const now = new Date();
    const months = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
        month: MONTH_LABELS[d.getMonth()],
        revenue: 0,
        rentals: 0,
      });
    }
    reservations.forEach(r => {
      if (r.status === 'cancelled' || !r.startDate) return;
      const k = r.startDate.slice(0, 7); // YYYY-MM
      const slot = months.find(m => m.key === k);
      if (slot) {
        slot.revenue += r.paidAmount || 0;
        slot.rentals += 1;
      }
    });
    return months;
  }, [reservations]);

  // Statistiques par catégorie — calculées depuis la flotte réelle
  const categoryStats = useMemo(() => {
    if (!vehicles.length) return [];
    const counts = {};
    vehicles.forEach(v => { counts[v.category] = (counts[v.category] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, count]) => ({
        name,
        value: Math.round((count / vehicles.length) * 100),
        color: CAT_COLORS[name] || '#94a3b8',
      }))
      .sort((a, b) => b.value - a.value);
  }, [vehicles]);

  const recentReservations = [...reservations]
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('dash.title')}</h1>
          <p className="page-subtitle">{t('dash.subtitle')}</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={<Car />} label={t('dash.vehiclesAvail')} value={`${available}/${vehicles.length}`} change={`${rented} · ${maintenance}`} up bg="var(--success-soft)" iconColor="var(--success)" />
        <StatCard icon={<FileText />} label={t('dash.activeRentals')} value={rented} change={`${upcomingRes.length} ${t('res.upcoming')}`} up bg="var(--accent-soft)" iconColor="var(--accent)" />
        <StatCard icon={<DollarSign />} label={t('dash.totalRevenue')} value={formatDA(totalRevenue)} change={`${reservations.filter(r => r.status === 'completed').length} ${t('res.completed')}`} up bg="var(--primary-soft)" iconColor="var(--primary)" />
        <StatCard icon={<Wrench />} label={t('dash.maintCost')} value={formatDA(maintenanceCost)} change={`${maintenanceList.length} ${t('nav.maintenance')}`} up={false} bg="rgba(239,68,68,0.12)" iconColor="var(--danger)" />
        <StatCard icon={<Receipt />} label={t('dash.netRevenue')} value={formatDA(netRevenue)} change={''} up={netRevenue >= 0} bg="rgba(139,92,246,0.12)" iconColor="var(--purple)" />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">{t('dash.monthlyRevenue')}</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>{t('dash.last6Months')}</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyRevenue}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-3)', fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, fontSize: 12, color: 'var(--text)' }}
                  formatter={(v) => [formatDA(v), 'Revenu']}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">{t('dash.byCategory')}</span>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            {categoryStats.length === 0 ? (
              <div style={{ width: '100%', textAlign: 'center', padding: 30, color: 'var(--text-3)' }}>
                <Car size={36} style={{ opacity: 0.4, marginBottom: 12 }} />
                <div style={{ fontSize: 13 }}>{t('veh.addVehicles')}</div>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="50%" height={200}>
                  <PieChart>
                    <Pie data={categoryStats} dataKey="value" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3}>
                      {categoryStats.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: '#1a1a28', border: '1px solid #2a2a3e', borderRadius: 12, fontSize: 12, color: '#f0f0f5' }} formatter={v => [`${v}%`]} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {categoryStats.map(c => (
                    <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
                      <div style={{ width: 10, height: 10, borderRadius: 3, background: c.color }} />
                      <span style={{ color: 'var(--text-2)' }}>{c.name}</span>
                      <span style={{ marginLeft: 'auto', fontWeight: 600 }}>{c.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">{t('dash.fleetState')}</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FleetRow icon={<Car size={16} />} label={t('vehicle.available')} count={available} total={vehicles.length} color="var(--success)" />
            <FleetRow icon={<Clock size={16} />} label={t('vehicle.rented')} count={rented} total={vehicles.length} color="var(--accent)" />
            <FleetRow icon={<Wrench size={16} />} label={t('vehicle.maintenance')} count={maintenance} total={vehicles.length} color="var(--warning)" />
            {unpaid > 0 && (
              <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--danger-soft)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>
                <AlertTriangle size={14} /> {t('dash.unpaid')}: {formatDA(unpaid)}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">{t('dash.recentRes')}</span>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>{t('nav.clients')}</th>
                  <th>{t('veh.title').replace('s','')}</th>
                  <th>{t('veh.status')}</th>
                  <th>{t('common.currency')}</th>
                </tr>
              </thead>
              <tbody>
                {recentReservations.map(r => {
                  const client = clients.find(c => c.id === r.clientId);
                  const vehicle = vehicles.find(v => v.id === r.vehicleId);
                  return (
                    <tr key={r.id}>
                      <td style={{ fontWeight: 600 }}>{client?.firstName} {client?.lastName}</td>
                      <td style={{ color: 'var(--text-2)' }}>{vehicle?.brand} {vehicle?.model}</td>
                      <td><StatusBadge status={r.status} /></td>
                      <td style={{ fontWeight: 600 }}>{formatDA(r.totalPrice)}</td>
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

function StatCard({ icon, label, value, change, up, bg, iconColor }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ background: bg, color: iconColor }}>{icon}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={`stat-change ${up ? 'up' : 'down'}`}>
        {up ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {change}
      </div>
    </div>
  );
}

function FleetRow({ icon, label, count, total, color }) {
  const pct = Math.round((count / total) * 100);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)' }}>{icon} {label}</div>
        <span style={{ fontWeight: 700, fontSize: 13 }}>{count} <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>/ {total}</span></span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-2)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: 3, transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const { t } = useT();
  const map = {
    active:    { cls: 'badge-success', key: 'res.active' },
    upcoming:  { cls: 'badge-accent',  key: 'res.upcoming' },
    completed: { cls: 'badge-neutral', key: 'res.completed' },
    cancelled: { cls: 'badge-danger',  key: 'res.cancelled' },
  };
  const s = map[status] || map.active;
  return <span className={`badge ${s.cls}`}>{t(s.key)}</span>;
}
