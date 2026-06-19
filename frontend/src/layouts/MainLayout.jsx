import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { to: '/dashboard', icon: '📊', label: 'Dashboard' },
  { to: '/projects', icon: '📂', label: 'Projects' },
  { to: '/tasks', icon: '📝', label: 'Tasks' },
  { to: '/activity', icon: '📋', label: 'Activity' },
  { to: '/profile', icon: '👤', label: 'Profile' },
];

export default function MainLayout({ children }) {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try { await import('../services/api').then(m => m.default.post('/auth/logout')); } catch {}
    logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* Sidebar */}
      <aside className="w-64 flex flex-col p-4 gap-2 border-r" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="text-2xl font-bold text-blue-600 mb-6 px-2">⚡ DevFlow</div>
        {navItems.map(({ to, icon, label }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              location.pathname.startsWith(to)
                ? 'bg-blue-600 text-white'
                : 'hover:bg-blue-50 dark:hover:bg-slate-700'
            }`}
          >
            <span>{icon}</span>{label}
          </Link>
        ))}
        <div className="mt-auto flex flex-col gap-2">
          <button onClick={toggle} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <div className="px-3 py-2 text-sm" style={{ color: 'var(--muted)' }}>👤 {user?.name}</div>
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors">
            🚪 Logout
          </button>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 p-6 overflow-auto">{children}</main>
    </div>
  );
}
