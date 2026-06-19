import { useQuery } from '@tanstack/react-query';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line, ResponsiveContainer, Legend } from 'recharts';
import api from '../services/api';
import StatCard from '../components/StatCard';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';
import { useAuth } from '../context/AuthContext';

const COLORS = ['#3b82f6', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export default function Dashboard() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: () => api.get('/dashboard').then(r => r.data) });

  if (isLoading) return <div className="flex items-center justify-center h-64 text-lg" style={{ color: 'var(--muted)' }}>Loading dashboard...</div>;

  const { stats, charts, recentProjects, activityLogs } = data;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back, {user?.name} 👋</h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>Here's your project overview</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-7 gap-3">
        <StatCard icon="📂" label="Total Projects" value={stats.totalProjects} color="blue" />
        <StatCard icon="📝" label="Total Tasks" value={stats.totalTasks} color="purple" />
        <StatCard icon="✅" label="Completed" value={stats.completedTasks} color="green" />
        <StatCard icon="⏳" label="Pending" value={stats.pendingTasks} color="yellow" />
        <StatCard icon="🔄" label="In Progress" value={stats.inProgressProjects} color="blue" />
        <StatCard icon="🚨" label="Overdue" value={stats.overdueTasks} color="red" />
        <StatCard icon="🎯" label="Completion %" value={`${stats.completionPercentage}%`} color="green" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Pie */}
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="font-semibold mb-4">Task Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={charts.taskStatus.map(d => ({ name: d.status, value: +d.count }))} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                {charts.taskStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Bar */}
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="font-semibold mb-4">Priority Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={charts.taskPriority.map(d => ({ name: d.priority, count: +d.count }))}>
              <XAxis dataKey="name" /><YAxis /><Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Line */}
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="font-semibold mb-4">Weekly Completed</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={charts.weeklyCompleted.map(d => ({ week: `W${d.week}`, count: +d.count }))}>
              <XAxis dataKey="week" /><YAxis /><Tooltip />
              <Line type="monotone" dataKey="count" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Projects & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="font-semibold mb-4">Recently Updated Projects</h3>
          <div className="space-y-3">
            {recentProjects.map(p => (
              <div key={p.id} className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p.name}</p>
                  <ProgressBar value={0} />
                </div>
                <Badge value={p.status} />
              </div>
            ))}
            {recentProjects.length === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>No projects yet</p>}
          </div>
        </div>

        <div className="p-4 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <h3 className="font-semibold mb-4">Activity Log</h3>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {activityLogs.map(log => (
              <div key={log.id} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5">📌</span>
                <div>
                  <p>{log.action}</p>
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>{new Date(log.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {activityLogs.length === 0 && <p className="text-sm" style={{ color: 'var(--muted)' }}>No activity yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
