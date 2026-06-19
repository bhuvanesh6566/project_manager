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

  const isActive = (to) => location.pathname.startsWith(to);

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>

      {/* ── Desktop Sidebar ── */}
      <aside className="hidden md:flex w-64 flex-col p-4 gap-2 border-r flex-shrink-0"
        style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="text-2xl font-bold text-blue-600 mb-6 px-2">⚡ DevFlow</div>
        {navItems.map(({ to, icon, label }) => (
          <Link key={to} to={to}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActive(to) ? 'bg-blue-600 text-white' : 'hover:bg-blue-50 dark:hover:bg-slate-700'
            }`}>
            <span>{icon}</span>{label}
          </Link>
        ))}
        <div className="mt-auto flex flex-col gap-2">
          <button onClick={toggle}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
          </button>
          <div className="px-3 py-2 text-sm truncate" style={{ color: 'var(--muted)' }}>👤 {user?.name}</div>
          <button onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-slate-700 transition-colors">
            🚪 Logout
          </button>
        </div>
      </aside>

      {/* ── Main Content ── */}
      <div className="flex flex-col flex-1 min-w-0">
        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b flex-shrink-0"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <span className="text-lg font-bold text-blue-600">⚡ DevFlow</span>
          <div className="flex items-center gap-2">
            <button onClick={toggle} className="text-xl p-1">{dark ? '☀️' : '🌙'}</button>
            <button onClick={handleLogout} className="text-sm text-red-500 font-medium px-2 py-1 rounded-lg border border-red-200">
              Logout
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">
          {children}
        </main>

        {/* ── Mobile Bottom Nav (scrollable) ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t z-50 flex-shrink-0"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div className="flex overflow-x-auto scrollbar-hide">
            {navItems.map(({ to, icon, label }) => (
              <Link key={to} to={to}
                className={`flex flex-col items-center gap-0.5 px-4 py-2 flex-shrink-0 text-xs font-medium transition-colors min-w-[72px] ${
                  isActive(to) ? 'text-blue-600' : ''
                }`}
                style={!isActive(to) ? { color: 'var(--muted)' } : {}}>
                <span className="text-xl">{icon}</span>
                <span>{label}</span>
              </Link>
            ))}
          </div>
        </nav>
      </div>
    </div>
  );
}
