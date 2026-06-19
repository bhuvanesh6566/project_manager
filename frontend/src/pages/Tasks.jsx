import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import toast from 'react-hot-toast';

const PRIORITIES = ['Low', 'Medium', 'High'];
const STATUSES = ['Pending', 'In Progress', 'Completed'];
const TYPES = ['Feature', 'Bug', 'Enhancement'];

function TaskForm({ onSubmit, defaultValues = {}, loading, projects }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div>
        <input {...register('name', { required: 'Required' })} placeholder="Task name"
          className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <textarea {...register('description')} placeholder="Description" rows={2}
        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
      <div>
        <select {...register('projectId', { required: 'Required' })}
          className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          <option value="">Select Project</option>
          {projects?.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
        {errors.projectId && <p className="text-red-500 text-xs mt-1">{errors.projectId.message}</p>}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <select {...register('priority')}
          className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          {PRIORITIES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select {...register('status')}
          className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select {...register('type')}
          className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          {TYPES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>Due Date</label>
          <input {...register('dueDate')} type="date"
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>Estimated Hours</label>
          <input {...register('estimatedHours')} type="number" step="0.5" placeholder="e.g. 4"
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
        {loading ? 'Saving...' : 'Save Task'}
      </button>
    </form>
  );
}

export default function Tasks() {
  const qc = useQueryClient();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const projectIdFilter = searchParams.get('projectId');

  useEffect(() => { if (projectIdFilter) setPage(1); }, [projectIdFilter]);

  const { data, isLoading } = useQuery({
    queryKey: ['tasks', search, status, priority, sort, page, projectIdFilter],
    queryFn: () => api.get('/tasks', { params: { search, status, priority, sort, page, limit: 10, projectId: projectIdFilter } }).then(r => r.data),
    keepPreviousData: true,
  });

  const { data: projectsData } = useQuery({
    queryKey: ['projects-all'],
    queryFn: () => api.get('/projects', { params: { limit: 100 } }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/tasks', d),
    onSuccess: () => { qc.invalidateQueries(['tasks']); qc.invalidateQueries(['dashboard']); toast.success('Task created'); setModal(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }) => api.put(`/tasks/${id}`, d),
    onSuccess: () => { qc.invalidateQueries(['tasks']); qc.invalidateQueries(['dashboard']); toast.success('Task updated'); setModal(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/tasks/${id}`),
    onSuccess: () => { qc.invalidateQueries(['tasks']); qc.invalidateQueries(['dashboard']); toast.success('Task deleted'); setDeleting(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const isOverdue = (task) => task.dueDate && task.status !== 'Completed' && new Date(task.dueDate) < new Date();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <button onClick={() => setModal('create')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          + New Task
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="🔍 Search tasks..."
          className="px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
        {[['Status', status, setStatus, ['', ...STATUSES]], ['Priority', priority, setPriority, ['', ...PRIORITIES]]].map(([label, val, set, opts]) => (
          <select key={label} value={val} onChange={e => { set(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
            {opts.map(o => <option key={o} value={o}>{o || `All ${label}`}</option>)}
          </select>
        ))}
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </select>
      </div>

      {/* Table */}
      {isLoading ? <div className="text-center py-12" style={{ color: 'var(--muted)' }}>Loading...</div> : (
        <>
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
            <table className="w-full text-sm">
              <thead>
                <tr style={{ backgroundColor: 'var(--bg)', borderBottom: '1px solid var(--border)' }}>
                  {['Task', 'Project', 'Priority', 'Status', 'Type', 'Due Date', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-xs" style={{ color: 'var(--muted)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data?.tasks.map((task, i) => (
                  <tr key={task.id}
                    className="border-t transition-colors hover:opacity-90"
                    style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                    <td className="px-4 py-3">
                      <p className="font-medium">{task.name}</p>
                      {task.estimatedHours && <p className="text-xs" style={{ color: 'var(--muted)' }}>⏱ {task.estimatedHours}h</p>}
                    </td>
                    <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted)' }}>{task.Project?.name}</td>
                    <td className="px-4 py-3"><Badge value={task.priority} /></td>
                    <td className="px-4 py-3"><Badge value={task.status} /></td>
                    <td className="px-4 py-3"><Badge value={task.type} /></td>
                    <td className="px-4 py-3 text-xs">
                      {task.dueDate ? (
                        <span className={isOverdue(task) ? 'text-red-500 font-medium' : ''}>
                          {isOverdue(task) ? '🚨 ' : ''}{task.dueDate}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setModal({ ...task, projectId: task.projectId?.toString() })}
                          className="px-2 py-1 text-xs border rounded hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                          style={{ borderColor: 'var(--border)' }}>Edit</button>
                        <button onClick={() => setDeleting(task.id)}
                          className="px-2 py-1 text-xs border border-red-200 text-red-500 rounded hover:bg-red-50 transition-colors">Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {data?.tasks.length === 0 && (
              <div className="text-center py-16" style={{ backgroundColor: 'var(--card)', color: 'var(--muted)' }}>
                <div className="text-5xl mb-3">📝</div>
                <p>No tasks found.</p>
              </div>
            )}
          </div>
          {/* Pagination */}
          {data?.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              {Array.from({ length: data.totalPages }, (_, i) => i + 1).map(p => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-8 h-8 rounded-lg text-sm transition-colors ${page === p ? 'bg-blue-600 text-white' : 'border hover:bg-blue-50'}`}
                  style={page !== p ? { borderColor: 'var(--border)' } : {}}>
                  {p}
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {modal && (
        <Modal title={modal === 'create' ? 'New Task' : 'Edit Task'} onClose={() => setModal(null)}>
          <TaskForm
            defaultValues={modal !== 'create' ? modal : {}}
            projects={projectsData?.projects}
            loading={createMutation.isPending || updateMutation.isPending}
            onSubmit={(d) => modal === 'create' ? createMutation.mutate(d) : updateMutation.mutate({ id: modal.id, ...d })}
          />
        </Modal>
      )}

      {deleting && (
        <Modal title="Delete Task" onClose={() => setDeleting(null)}>
          <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>Are you sure you want to delete this task?</p>
          <div className="flex gap-2">
            <button onClick={() => setDeleting(null)}
              className="flex-1 py-2 border rounded-lg text-sm"
              style={{ borderColor: 'var(--border)' }}>Cancel</button>
            <button onClick={() => deleteMutation.mutate(deleting)} disabled={deleteMutation.isPending}
              className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm disabled:opacity-60">
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
