import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Car, CalendarDays, Users, FileText, RotateCcw, Settings, LogOut, Wrench, Sun, Moon, Languages } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useT } from '../context/LanguageContext';

const navItemsConfig = [
  { to: '/', icon: LayoutDashboard, key: 'nav.dashboard' },
  { to: '/vehicles', icon: Car, key: 'nav.vehicles' },
  { to: '/reservations', icon: FileText, key: 'nav.reservations' },
  { to: '/clients', icon: Users, key: 'nav.clients' },
  { to: '/calendar', icon: CalendarDays, key: 'nav.calendar' },
  { to: '/returns', icon: RotateCcw, key: 'nav.returns' },
  { to: '/maintenance', icon: Wrench, key: 'nav.maintenance' },
];

export default function Sidebar() {
  const { reservations } = useApp();
  const { user, logout } = useAuth();
  const { settings } = useSettings();
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, toggle: toggleLang, t } = useT();
  const navItems = navItemsConfig.map(i => ({ ...i, label: t(i.key) }));
  const activeCount = reservations.filter(r => r.status === 'active').length;
  const initials = (user?.name || 'U')
    .split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          {settings?.logo ? (
            <img
              src={settings.logo}
              alt="Logo"
              style={{ width: 40, height: 40, borderRadius: 10, objectFit: 'cover', background: 'var(--bg-2)', flexShrink: 0 }}
            />
          ) : (
            <div className="logo-icon">
              <Car strokeWidth={2.5} />
            </div>
          )}
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="logo-text" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{settings?.agencyName || 'AutoLoc'}</div>
            <div className="logo-sub" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{settings?.tagline || 'Location de véhicules'}</div>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="nav-section-label">{t('nav.menuMain')}</div>
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

        <div className="nav-section-label">{t('nav.system')}</div>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          {t('nav.settings')}
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
            onClick={toggleLang}
            title={lang === 'fr' ? 'العربية' : 'Français'}
            style={{
              background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer',
              minWidth: 32, height: 32, padding: '0 8px', borderRadius: 8, display: 'inline-flex', alignItems: 'center', gap: 4,
              color: 'var(--text-3)', transition: 'all 0.15s', fontSize: 11, fontWeight: 700,
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <Languages size={12} />
            {lang === 'fr' ? 'AR' : 'FR'}
          </button>
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
            style={{
              background: 'transparent', border: '1px solid var(--border)', cursor: 'pointer',
              width: 32, height: 32, borderRadius: 8, display: 'grid', placeItems: 'center',
              color: 'var(--text-3)', transition: 'all 0.15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--primary)'; e.currentTarget.style.borderColor = 'rgba(245,158,11,0.4)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
          </button>
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
