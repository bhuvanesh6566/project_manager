import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

export default function Activity() {
  const [page, setPage] = useState(1);
  const limit = 20;

  const { data, isLoading } = useQuery({
    queryKey: ['activity', page],
    queryFn: () => api.get('/dashboard').then(r => r.data.activityLogs),
  });

  const icons = { Project: '📂', Task: '📝' };

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Activity Log</h1>
      {isLoading ? (
        <div className="text-center py-12" style={{ color: 'var(--muted)' }}>Loading...</div>
      ) : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--border)' }}>
          {data?.map((log, i) => (
            <div key={log.id}
              className="flex items-start gap-3 px-5 py-4 border-b text-sm transition-colors hover:opacity-90"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-base flex-shrink-0">
                {icons[log.entity] || '📌'}
              </div>
              <div className="flex-1">
                <p className="font-medium">{log.action}</p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>{new Date(log.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))}
          {data?.length === 0 && (
            <div className="text-center py-16" style={{ backgroundColor: 'var(--card)', color: 'var(--muted)' }}>
              <div className="text-5xl mb-3">📋</div>
              <p>No activity yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
