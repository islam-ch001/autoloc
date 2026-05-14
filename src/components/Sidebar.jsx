import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, CalendarDays, Users, FileText, RotateCcw, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/vehicles', icon: Car, label: 'Véhicules' },
  { to: '/reservations', icon: FileText, label: 'Réservations' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendrier' },
  { to: '/returns', icon: RotateCcw, label: 'Retours' },
];

export default function Sidebar() {
  const { reservations } = useApp();
  const activeCount = reservations.filter(r => r.status === 'active').length;

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Car strokeWidth={2.5} />
          </div>
          <div>
            <div className="logo-text">AutoLoc</div>
            <div className="logo-sub">Location de véhicules</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">Menu principal</div>
        {navItems.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={18} />
            {item.label}
            {item.to === '/reservations' && activeCount > 0 && (
              <span className="nav-badge">{activeCount}</span>
            )}
          </NavLink>
        ))}

        <div className="nav-section-label">Système</div>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          Paramètres
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">IB</div>
          <div className="user-info">
            <div className="user-name">Islem B.</div>
            <div className="user-role">Administrateur</div>
          </div>
        </div>
      </div>
    </aside>
  );
}
