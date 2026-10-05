import {
  Building2,
  LayoutDashboard,
  Store,
  Users
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { DBRoles } from '../utils/constants';

const NAV = {
  [DBRoles.SYSTEM_ADMIN]: [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/stores', label: 'Stores', icon: Building2 },
  ],
  [DBRoles.NORMAL_USER]: [
    { to: '/user', label: 'Stores', icon: Store, end: true },
  ],
  [DBRoles.STORE_OWNER  ]: [
    { to: '/owner', label: 'Dashboard', icon: LayoutDashboard, end: true },
  ],
};

export default function Sidebar({ open, onClose }) {
  const { role } = useAuth();
  const items = NAV[role] || [];

  return (
    <>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <nav className="sidebar-nav">
          <p className="sidebar-section">Navigation</p>
          {items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}