import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';
import Badge from '../components/Badge';
import ProgressBar from '../components/ProgressBar';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', id],
    queryFn: () => api.get(`/projects/${id}`).then(r => r.data),
  });

  if (isLoading) return <div className="text-center py-12" style={{ color: 'var(--muted)' }}>Loading...</div>;
  if (!project) return <div className="text-center py-12 text-red-500">Project not found</div>;

  return (
    <div className="space-y-6 max-w-4xl">
      <button onClick={() => navigate('/projects')} className="text-sm text-blue-600 hover:underline">← Back to Projects</button>

      <div className="p-6 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="flex items-start justify-between gap-2 mb-4 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold">{project.name}</h1>
            <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>{project.description}</p>
          </div>
          <Badge value={project.status} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4 text-sm">
          <div><span style={{ color: 'var(--muted)' }}>Start Date</span><p className="font-medium">{project.startDate || '—'}</p></div>
          <div><span style={{ color: 'var(--muted)' }}>End Date</span><p className="font-medium">{project.endDate || '—'}</p></div>
          <div><span style={{ color: 'var(--muted)' }}>Tasks</span><p className="font-medium">{project.Tasks?.length || 0}</p></div>
          <div><span style={{ color: 'var(--muted)' }}>Progress</span><p className="font-medium">{project.progress}%</p></div>
        </div>
        <ProgressBar value={project.progress} />
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Tasks ({project.Tasks?.length})</h2>
          <button onClick={() => navigate(`/tasks?projectId=${id}`)} className="text-sm text-blue-600 hover:underline">View in Tasks →</button>
        </div>
        <div className="space-y-2">
          {project.Tasks?.map(task => (
            <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg border"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.name}</p>
                {task.dueDate && <p className="text-xs" style={{ color: 'var(--muted)' }}>Due: {task.dueDate}</p>}
              </div>
              <Badge value={task.priority} />
              <Badge value={task.status} />
            </div>
          ))}
          {project.Tasks?.length === 0 && (
            <p className="text-sm text-center py-6" style={{ color: 'var(--muted)' }}>No tasks yet for this project.</p>
          )}
        </div>
      </div>
    </div>
  );
}
