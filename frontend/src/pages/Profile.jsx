import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const profileSchema = z.object({
  name: z.string().min(2, 'At least 2 characters'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Required'),
  newPassword: z.string().min(6, 'At least 6 characters'),
  confirm: z.string(),
}).refine(d => d.newPassword === d.confirm, { message: "Passwords don't match", path: ['confirm'] });

const inputClass = "w-full px-3 py-2 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:ring-blue-500";
const inputStyle = { backgroundColor: 'var(--bg)', borderColor: 'var(--border)', color: 'var(--text)' };

export default function Profile() {
  const { user, login } = useAuth();
  const [tab, setTab] = useState('profile');

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: () => api.get('/auth/profile').then(r => r.data),
  });

  const profileForm = useForm({ resolver: zodResolver(profileSchema), values: { name: profile?.name || '' } });
  const passwordForm = useForm({ resolver: zodResolver(passwordSchema) });

  const profileMutation = useMutation({
    mutationFn: (d) => api.put('/auth/profile', d),
    onSuccess: (res) => {
      toast.success('Profile updated');
      // update localStorage user name
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...stored, name: res.data.name }));
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const passwordMutation = useMutation({
    mutationFn: (d) => api.put('/auth/profile', d),
    onSuccess: () => { toast.success('Password updated'); passwordForm.reset(); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Profile & Settings</h1>

      {/* User Card */}
      <div className="p-6 rounded-xl border flex items-center gap-4" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
        <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
          {profile?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <p className="text-xl font-semibold">{profile?.name}</p>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{profile?.email}</p>
          <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Member since {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '—'}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b" style={{ borderColor: 'var(--border)' }}>
        {['profile', 'password'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize transition-colors border-b-2 -mb-px ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent'}`}
            style={tab !== t ? { color: 'var(--muted)' } : {}}>
            {t === 'profile' ? '👤 Edit Profile' : '🔒 Change Password'}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <form onSubmit={profileForm.handleSubmit(d => profileMutation.mutate(d))} className="flex flex-col gap-4 p-6 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input {...profileForm.register('name')} className={inputClass} style={inputStyle} />
            {profileForm.formState.errors.name && <p className="text-red-500 text-xs mt-1">{profileForm.formState.errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input value={profile?.email || ''} disabled className={inputClass} style={{ ...inputStyle, opacity: 0.6 }} />
            <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>Email cannot be changed</p>
          </div>
          <button type="submit" disabled={profileMutation.isPending}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium self-start transition-colors disabled:opacity-60">
            {profileMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}

      {tab === 'password' && (
        <form onSubmit={passwordForm.handleSubmit(d => passwordMutation.mutate(d))} className="flex flex-col gap-4 p-6 rounded-xl border" style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}>
          {[
            { name: 'currentPassword', label: 'Current Password' },
            { name: 'newPassword', label: 'New Password' },
            { name: 'confirm', label: 'Confirm New Password' },
          ].map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm font-medium mb-1">{label}</label>
              <input {...passwordForm.register(name)} type="password" placeholder="••••••••" className={inputClass} style={inputStyle} />
              {passwordForm.formState.errors[name] && (
                <p className="text-red-500 text-xs mt-1">{passwordForm.formState.errors[name].message}</p>
              )}
            </div>
          ))}
          <button type="submit" disabled={passwordMutation.isPending}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium self-start transition-colors disabled:opacity-60">
            {passwordMutation.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      )}
    </div>
  );
}
