import { Car, FileText, DollarSign, TrendingUp, TrendingDown, AlertTriangle, Clock, Wrench, Receipt } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useApp } from '../context/AppContext';
import { monthlyRevenue, categoryStats } from '../data/mockData';

const formatDA = (n) => (n || 0).toLocaleString('fr-DZ') + ' DA';

export default function Dashboard() {
  const { vehicles, clients, reservations, maintenance: maintenanceList = [] } = useApp();

  const available = vehicles.filter(v => v.status === 'available').length;
  const rented = vehicles.filter(v => v.status === 'rented').length;
  const maintenance = vehicles.filter(v => v.status === 'maintenance').length;
  const activeRes = reservations.filter(r => r.status === 'active');
  const upcomingRes = reservations.filter(r => r.status === 'upcoming');
  const totalRevenue = reservations.filter(r => r.status === 'completed' || r.status === 'active').reduce((s, r) => s + r.paidAmount, 0);
  const unpaid = activeRes.reduce((s, r) => s + (r.totalPrice - r.paidAmount), 0);
  const maintenanceCost = maintenanceList.reduce((s, m) => s + (m.cost || 0), 0);
  const netRevenue = totalRevenue - maintenanceCost;

  const recentReservations = [...reservations]
    .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
    .slice(0, 5);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Tableau de bord</h1>
          <p className="page-subtitle">Vue d'ensemble de votre activité de location</p>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 24 }}>
        <StatCard icon={<Car />} label="Véhicules disponibles" value={`${available}/${vehicles.length}`} change={`${rented} en location · ${maintenance} en maintenance`} up bg="var(--success-soft)" iconColor="var(--success)" />
        <StatCard icon={<FileText />} label="Locations actives" value={rented} change={`${upcomingRes.length} à venir`} up bg="var(--accent-soft)" iconColor="var(--accent)" />
        <StatCard icon={<DollarSign />} label="Revenu total" value={formatDA(totalRevenue)} change={`${reservations.filter(r => r.status === 'completed').length} locations terminées`} up bg="var(--primary-soft)" iconColor="var(--primary)" />
        <StatCard icon={<Wrench />} label="Dépenses maintenance" value={formatDA(maintenanceCost)} change={`${maintenanceList.length} intervention${maintenanceList.length > 1 ? 's' : ''}`} up={false} bg="rgba(239,68,68,0.12)" iconColor="var(--danger)" />
        <StatCard icon={<Receipt />} label="Revenu net" value={formatDA(netRevenue)} change={`après déduction des dépenses`} up={netRevenue >= 0} bg="rgba(139,92,246,0.12)" iconColor="var(--purple)" />
      </div>

      <div className="grid-2" style={{ marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenus mensuels</span>
            <span style={{ fontSize: 12, color: 'var(--text-3)' }}>2025</span>
          </div>
          <div className="card-body">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyRevenue}>
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#707088', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#707088', fontSize: 11 }} tickFormatter={v => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: '#1a1a28', border: '1px solid #2a2a3e', borderRadius: 12, fontSize: 12, color: '#f0f0f5' }}
                  formatter={(v) => [formatDA(v), 'Revenu']}
                />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Répartition par catégorie</span>
          </div>
          <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
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
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <span className="card-title">État de la flotte</span>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <FleetRow icon={<Car size={16} />} label="Disponibles" count={available} total={vehicles.length} color="var(--success)" />
            <FleetRow icon={<Clock size={16} />} label="En location" count={rented} total={vehicles.length} color="var(--accent)" />
            <FleetRow icon={<Wrench size={16} />} label="Maintenance" count={maintenance} total={vehicles.length} color="var(--warning)" />
            {unpaid > 0 && (
              <div style={{ marginTop: 8, padding: '10px 14px', background: 'var(--danger-soft)', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--danger)', fontWeight: 600 }}>
                <AlertTriangle size={14} /> Impayés en cours: {formatDA(unpaid)}
              </div>
            )}
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Dernières réservations</span>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table>
              <thead>
                <tr>
                  <th>Client</th>
                  <th>Véhicule</th>
                  <th>Statut</th>
                  <th>Montant</th>
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
  const map = {
    active: { cls: 'badge-success', label: 'Active' },
    upcoming: { cls: 'badge-accent', label: 'À venir' },
    completed: { cls: 'badge-neutral', label: 'Terminée' },
    cancelled: { cls: 'badge-danger', label: 'Annulée' },
  };
  const s = map[status] || map.active;
  return <span className={`badge ${s.cls}`}>{s.label}</span>;
}
