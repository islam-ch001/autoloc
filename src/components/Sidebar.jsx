import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, CalendarDays, Users, FileText, RotateCcw, Settings, LogOut, Receipt } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Tableau de bord' },
  { to: '/vehicles', icon: Car, label: 'Véhicules' },
  { to: '/reservations', icon: FileText, label: 'Réservations' },
  { to: '/clients', icon: Users, label: 'Clients' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendrier' },
  { to: '/returns', icon: RotateCcw, label: 'Retours' },
  { to: '/invoices', icon: Receipt, label: 'Factures' },
];

export default function Sidebar() {
  const { reservations } = useApp();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const activeCount = reservations.filter(r => r.status === 'active').length;
  const initials = (user?.name || 'U')
    .split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">
            <Car strokeWidth={2.5} />
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="logo-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{settings?.agencyName || 'AutoLoc'}</div>
            <div className="logo-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{settings?.tagline || 'Location de véhicules'}</div>
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
          <div className="user-avatar">{initials}</div>
          <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Utilisateur'}</div>
            <div className="user-role" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
          <button
            onClick={logout}
            title="Se déconnecter"
            style={{
              background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer',
              width: 32, height: 32, borderRadius: 8, display: 'grid', placeItems: 'center',
              color: 'var(--text-3)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <LogOut size={14} />
          </button>
        </div>
      </div>
    </aside>
  );
}
