import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import Badge from '../components/Badge';
import Modal from '../components/Modal';
import ProgressBar from '../components/ProgressBar';
import toast from 'react-hot-toast';

const STATUSES = ['Not Started', 'In Progress', 'Completed'];

function ProjectForm({ onSubmit, defaultValues = {}, loading }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues });
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
      <div>
        <input {...register('name', { required: 'Required' })} placeholder="Project Name"
          className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>
      <textarea {...register('description')} placeholder="Description" rows={3}
        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
      <select {...register('status')}
        className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
        style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }}>
        {STATUSES.map(s => <option key={s}>{s}</option>)}
      </select>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>Start Date</label>
          <input {...register('startDate')} type="date"
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
        </div>
        <div>
          <label className="text-xs mb-1 block" style={{ color: 'var(--muted)' }}>End Date</label>
          <input {...register('endDate')} type="date"
            className="w-full px-3 py-2 rounded-lg border text-sm focus:outline-none"
            style={{ backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' }} />
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-60">
        {loading ? 'Saving...' : 'Save Project'}
      </button>
    </form>
  );
}

export default function Projects() {
  const qc = useQueryClient();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [modal, setModal] = useState(null); // null | 'create' | {project}
  const [deleting, setDeleting] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['projects', search, status, sort, page],
    queryFn: () => api.get('/projects', { params: { search, status, sort, page, limit: 9 } }).then(r => r.data),
    keepPreviousData: true,
  });

  const createMutation = useMutation({
    mutationFn: (d) => api.post('/projects', d),
    onSuccess: () => { qc.invalidateQueries(['projects']); qc.invalidateQueries(['dashboard']); toast.success('Project created'); setModal(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...d }) => api.put(`/projects/${id}`, d),
    onSuccess: () => { qc.invalidateQueries(['projects']); qc.invalidateQueries(['dashboard']); toast.success('Project updated'); setModal(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/projects/${id}`),
    onSuccess: () => { qc.invalidateQueries(['projects']); qc.invalidateQueries(['dashboard']); toast.success('Project deleted'); setDeleting(null); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button onClick={() => setModal('create')}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors">
          + New Project
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="🔍 Search projects..."
          className="flex-1 min-w-0 px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }} />
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s}>{s}</option>)}
        </select>
        <select value={sort} onChange={e => setSort(e.target.value)}
          className="px-3 py-2 rounded-lg border text-sm focus:outline-none"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)', color: 'var(--text)' }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>

      {/* Grid */}
      {isLoading ? <div className="text-center py-12" style={{ color: 'var(--muted)' }}>Loading...</div> : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {data?.projects.map(p => (
              <div key={p.id} className="p-4 rounded-xl border hover:shadow-md transition-shadow"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
                <div className="flex items-start justify-between mb-2">
                  <Link to={`/projects/${p.id}`} className="font-semibold hover:text-blue-600 transition-colors line-clamp-1">{p.name}</Link>
                  <Badge value={p.status} />
                </div>
                <p className="text-sm mb-3 line-clamp-2" style={{ color: 'var(--muted)' }}>{p.description || 'No description'}</p>
                <div className="mb-2">
                  <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--muted)' }}>
                    <span>Progress</span><span>{p.progress}%</span>
                  </div>
                  <ProgressBar value={p.progress} />
                </div>
                {p.endDate && <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>📅 {p.endDate}</p>}
                <div className="flex gap-2 mt-3">
                  <button onClick={() => setModal(p)}
                    className="flex-1 py-1.5 text-xs border rounded-lg hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                    style={{ borderColor: 'var(--border)' }}>Edit</button>
                  <button onClick={() => setDeleting(p.id)}
                    className="flex-1 py-1.5 text-xs border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
                </div>
              </div>
            ))}
          </div>
          {data?.projects.length === 0 && (
            <div className="text-center py-16" style={{ color: 'var(--muted)' }}>
              <div className="text-5xl mb-3">📂</div>
              <p>No projects found. Create your first project!</p>
            </div>
          )}
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

      {/* Create/Edit Modal */}
      {modal && (
        <Modal title={modal === 'create' ? 'New Project' : 'Edit Project'} onClose={() => setModal(null)}>
          <ProjectForm
            defaultValues={modal !== 'create' ? modal : {}}
            loading={createMutation.isPending || updateMutation.isPending}
            onSubmit={(d) => modal === 'create' ? createMutation.mutate(d) : updateMutation.mutate({ id: modal.id, ...d })}
          />
        </Modal>
      )}

      {/* Delete confirm */}
      {deleting && (
        <Modal title="Delete Project" onClose={() => setDeleting(null)}>
          <p className="mb-4 text-sm" style={{ color: 'var(--muted)' }}>Are you sure? This will also delete all tasks in this project.</p>
          <div className="flex gap-2">
            <button onClick={() => setDeleting(null)}
              className="flex-1 py-2 border rounded-lg text-sm transition-colors hover:bg-gray-50"
              style={{ borderColor: 'var(--border)' }}>Cancel</button>
            <button onClick={() => deleteMutation.mutate(deleting)} disabled={deleteMutation.isPending}
              className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm transition-colors disabled:opacity-60">
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
