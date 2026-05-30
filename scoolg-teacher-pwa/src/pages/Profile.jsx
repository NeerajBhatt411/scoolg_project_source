import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { teacher, school, logout } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [classCount, setClassCount] = useState(null);

  const avatar = teacher?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${teacher?.fullName || 'T'}`;

  useEffect(() => {
    api.get('/teacher/my-classes').then(r => setClassCount(Array.isArray(r.data) ? r.data.length : 0)).catch(() => setClassCount(0));
  }, []);

  const handleChangePassword = async () => {
    setMsg(null);
    if (newPwd.length < 4) return setMsg({ type: 'err', text: 'Password must be at least 4 characters' });
    if (newPwd !== confirmPwd) return setMsg({ type: 'err', text: 'Passwords do not match' });
    setSaving(true);
    try {
      await api.post('/teacher/change-password', { newPassword: newPwd });
      setMsg({ type: 'ok', text: 'Password updated successfully' });
      setNewPwd(''); setConfirmPwd('');
      setTimeout(() => setShowPwd(false), 1200);
    } catch (e) {
      setMsg({ type: 'err', text: e.response?.data?.error || 'Failed to update password' });
    } finally { setSaving(false); }
  };

  const stats = [
    { label: 'Classes', value: classCount ?? '—' },
    { label: 'Subjects', value: teacher?.subjects?.length || 0 },
    { label: 'Experience', value: teacher?.experienceYears ? `${teacher.experienceYears}y` : '—' },
  ];

  const InfoRow = ({ icon, label, value }) => (
    <div className="flex items-center gap-3 px-4 py-3.5">
      <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant shrink-0">
        <span className="material-symbols-outlined text-[19px]">{icon}</span>
      </div>
      <span className="text-body-md text-on-surface-variant flex-1">{label}</span>
      <span className="text-body-md font-bold text-on-surface text-right truncate max-w-[55%]">{value || '—'}</span>
    </div>
  );

  return (
    <div className="min-h-full pb-32 lg:pb-10 max-w-2xl mx-auto">
      {/* Cover + overlapping avatar */}
      <div className="px-container-margin lg:px-8 pt-5">
        <div className="relative">
          <div className="h-28 rounded-[28px] bg-gradient-to-r from-[#2563eb] to-[#3b82f6] relative overflow-hidden">
            <div className="absolute -top-8 -right-6 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
          </div>
          {/* card pulled up under cover */}
          <div className="bg-white border border-surface-container rounded-[28px] -mt-10 relative shadow-[0_10px_30px_-16px_rgba(15,23,42,0.18)] pt-14 pb-5 px-5 text-center">
            <img src={avatar} alt="" className="w-24 h-24 rounded-full object-cover absolute -top-12 left-1/2 -translate-x-1/2 ring-4 ring-white shadow-lg bg-surface-container-low" />
            <h2 className="text-[22px] font-manrope font-extrabold text-on-surface leading-tight">{teacher?.fullName || 'Teacher'}</h2>
            <p className="text-label-md text-on-surface-variant mt-0.5">{teacher?.teacherAppId} · {school?.name || 'School'}</p>

            {/* stat tiles */}
            <div className="grid grid-cols-3 gap-3 mt-5">
              {stats.map((s, i) => (
                <div key={i} className="bg-surface-container-low rounded-2xl py-3">
                  <p className="text-[22px] font-manrope font-extrabold text-on-surface leading-none">{s.value}</p>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="px-container-margin lg:px-8 mt-5 space-y-4">
        {/* Details */}
        <div className="bg-white border border-surface-container rounded-3xl overflow-hidden shadow-sm divide-y divide-surface-container/70">
          <p className="px-4 pt-4 pb-1 text-[11px] font-bold text-on-surface-variant/70 uppercase tracking-widest">Details</p>
          <InfoRow icon="mail" label="Email" value={teacher?.email} />
          <InfoRow icon="call" label="Phone" value={teacher?.phone} />
          <InfoRow icon="workspace_premium" label="Qualification" value={teacher?.highestQualification} />
          <InfoRow icon="menu_book" label="Specialization" value={teacher?.specialization} />
        </div>

        {/* Change password */}
        <div className="bg-white border border-surface-container rounded-3xl shadow-sm overflow-hidden">
          <button onClick={() => setShowPwd(s => !s)} className="w-full flex items-center gap-3 px-4 py-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[19px]">lock</span>
            </div>
            <span className="text-body-md font-bold text-on-surface flex-1 text-left">Change Password</span>
            <span className="material-symbols-outlined text-on-surface-variant">{showPwd ? 'expand_less' : 'chevron_right'}</span>
          </button>
          {showPwd && (
            <div className="px-4 pb-4 space-y-3">
              <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="New password"
                className="w-full h-12 px-4 rounded-2xl bg-surface-container-low border border-surface-container font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all" />
              <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Confirm password"
                className="w-full h-12 px-4 rounded-2xl bg-surface-container-low border border-surface-container font-bold text-on-surface outline-none focus:ring-2 focus:ring-primary focus:bg-white transition-all" />
              {msg && <p className={`text-label-md font-bold px-3 py-2 rounded-xl ${msg.type === 'ok' ? 'bg-green-50 text-green-700' : 'bg-error/10 text-error'}`}>{msg.text}</p>}
              <button onClick={handleChangePassword} disabled={saving} className="w-full h-12 bg-primary text-on-primary rounded-2xl font-bold text-label-md disabled:opacity-50">
                {saving ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={() => { logout(); navigate('/login'); }}
          className="w-full flex items-center justify-center gap-2 h-[52px] bg-white border border-surface-container text-error rounded-3xl font-bold text-body-md shadow-sm active:scale-[0.99] transition-transform">
          <span className="material-symbols-outlined text-[20px]">logout</span> Logout
        </button>
      </div>
    </div>
  );
};

export default Profile;
