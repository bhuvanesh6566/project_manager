export default function StatCard({ icon, label, value, color = 'blue' }) {
  const colors = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-900/30',
    green: 'bg-green-50 text-green-600 dark:bg-green-900/30',
    yellow: 'bg-yellow-50 text-yellow-600 dark:bg-yellow-900/30',
    red: 'bg-red-50 text-red-600 dark:bg-red-900/30',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-900/30',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-900/30',
  };
  return (
    <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl mb-3 ${colors[color]}`}>{icon}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{label}</div>
    </div>
  );
}
