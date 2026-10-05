import { LogOut, Menu, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLE_LABELS, pageRoutes } from '../utils/constants';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(pageRoutes.login, { replace: true });
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="icon-btn mobile-only" onClick={onToggleSidebar}>
          <Menu size={20} />
        </button>
        <div className="brand">
          <div className="brand-mark">
            <Star size={18} fill="currentColor" />
          </div>
          <div className="brand-text">
            <strong>StoreRate</strong>
            <span>Rating Platform</span>
          </div>
        </div>
      </div>

      <div className="navbar-right">
        <div className="user-chip">
          <div className="avatar">
            {user?.name?.[0]?.toUpperCase() || '?'}
          </div>
          <div className="user-meta">
            <strong>{user?.name}</strong>
            <span>{ROLE_LABELS[user?.role] || user?.role}</span>
          </div>
        </div>
        <button className="icon-btn danger" onClick={handleLogout} title="Logout">
          <LogOut size={18} />
        </button>
      </div>
    </header>
  );
}