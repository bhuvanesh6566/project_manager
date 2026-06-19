import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      <div className="text-8xl">🔍</div>
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-lg" style={{ color: 'var(--muted)' }}>Page not found</p>
      <button onClick={() => navigate('/login')}
        className="mt-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors">
        Back to Dashboard
      </button>
    </div>
  );
}
