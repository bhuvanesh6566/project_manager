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
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 flex-col p-4 gap-2 border-r" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
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
      <main className="flex-1 p-4 md:p-6 overflow-auto pb-20 md:pb-6">{children}</main>

      {/* Bottom nav — mobile only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t flex items-center justify-around z-50"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        {navItems.map(({ to, icon, label }) => (
          <Link key={to} to={to}
            className={`flex flex-col items-center py-2 px-3 text-xs gap-0.5 transition-colors ${
              location.pathname.startsWith(to) ? 'text-blue-600' : ''
            }`}
            style={!location.pathname.startsWith(to) ? { color: 'var(--muted)' } : {}}>
            <span className="text-xl">{icon}</span>
            {label}
          </Link>
        ))}
        <button onClick={toggle}
          className="flex flex-col items-center py-2 px-3 text-xs gap-0.5"
          style={{ color: 'var(--muted)' }}>
          <span className="text-xl">{dark ? '☀️' : '🌙'}</span>
          Theme
        </button>
        <button onClick={handleLogout}
          className="flex flex-col items-center py-2 px-3 text-xs gap-0.5 text-red-500">
          <span className="text-xl">🚪</span>
          Logout
        </button>
      </nav>
    </div>
  );
}
