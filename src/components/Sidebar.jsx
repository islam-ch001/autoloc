import { NavLink, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, Car, CalendarDays, Users, FileText, RotateCcw, Settings, LogOut, Wrench, Sun, Moon, Languages, ShieldCheck, Menu, X, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { useTheme } from '../context/ThemeContext';
import { useT } from '../context/LanguageContext';

const menuItemStyle = {
  display: 'flex', alignItems: 'center', gap: 12,
  width: '100%', padding: '10px 14px',
  background: 'transparent', border: 'none', cursor: 'pointer',
  color: 'var(--text)', fontSize: 13, fontWeight: 500,
  textAlign: 'left', transition: 'background 0.15s',
};

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
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const location = useLocation();

  // Fermer la sidebar quand on change de page (mobile)
  useEffect(() => { setOpen(false); setMenuOpen(false); }, [location.pathname]);

  // Fermer le menu en cliquant à l'extérieur
  useEffect(() => {
    if (!menuOpen) return;
    const onDoc = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [menuOpen]);
  const activeCount = reservations.filter(r => r.status === 'active').length;
  const initials = (user?.name || 'U')
    .split(' ').map(s => s[0]).join('').slice(0, 2).toUpperCase();

  return (
    <>
    <button className="mobile-menu-btn" onClick={() => setOpen(o => !o)} aria-label="Menu">
      {open ? <X size={20} /> : <Menu size={20} />}
    </button>
    <div className={`sidebar-overlay ${open ? 'show' : ''}`} onClick={() => setOpen(false)} />
    <aside className={`sidebar ${open ? 'open' : ''}`}>
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
        {user?.isSuperAdmin && (
          <NavLink to="/admin" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
            <ShieldCheck size={18} style={{ color: 'var(--primary)' }} />
            Administration
          </NavLink>
        )}
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={18} />
          {t('nav.settings')}
        </NavLink>
      </nav>

      <div className="sidebar-footer" ref={menuRef} style={{ position: 'relative' }}>
        {menuOpen && (
          <div style={{
            position: 'absolute',
            bottom: 'calc(100% - 4px)', left: 12, right: 12,
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 12,
            boxShadow: '0 -8px 24px rgba(0,0,0,0.35)',
            overflow: 'hidden',
            zIndex: 50,
          }}>
            <button onClick={() => { toggleLang(); setMenuOpen(false); }} style={menuItemStyle}>
              <Languages size={16} />
              <span style={{ flex: 1, textAlign: 'left' }}>{lang === 'fr' ? 'العربية' : 'Français'}</span>
              <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-3)' }}>{lang === 'fr' ? 'AR' : 'FR'}</span>
            </button>
            <button onClick={() => { toggleTheme(); setMenuOpen(false); }} style={menuItemStyle}>
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              <span style={{ flex: 1, textAlign: 'left' }}>{theme === 'dark' ? 'Mode clair' : 'Mode sombre'}</span>
            </button>
            <div style={{ height: 1, background: 'var(--border)' }} />
            <button onClick={() => { setMenuOpen(false); logout(); }} style={{ ...menuItemStyle, color: 'var(--danger)' }}>
              <LogOut size={16} />
              <span style={{ flex: 1, textAlign: 'left' }}>Se déconnecter</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setMenuOpen(o => !o)}
          className="sidebar-user"
          style={{
            background: menuOpen ? 'var(--surface-2)' : 'transparent',
            border: 'none', cursor: 'pointer', width: '100%',
            textAlign: 'left', transition: 'background 0.15s',
          }}
        >
          <div className="user-avatar">{initials}</div>
          <div className="user-info" style={{ flex: 1, minWidth: 0 }}>
            <div className="user-name" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'Utilisateur'}</div>
            <div className="user-role" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
          </div>
          <ChevronUp size={16} style={{ color: 'var(--text-3)', transition: 'transform 0.2s', transform: menuOpen ? 'rotate(0deg)' : 'rotate(180deg)', flexShrink: 0 }} />
        </button>
      </div>
    </aside>
    </>
  );
}
