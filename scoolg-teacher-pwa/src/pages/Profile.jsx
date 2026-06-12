import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Card, Button, Icon, Avatar } from '@/components/designkit';

const fieldCls = 'w-full h-11 px-3.5 rounded-[10px] bg-white border border-line text-ink font-500 text-[13.5px] outline-none focus:ring-2 focus:ring-blue-600/25 focus:border-blue-400 transition-all';

const Profile = () => {
  const { teacher, school, logout } = useAuth();
  const navigate = useNavigate();
  const [showPwd, setShowPwd] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [msg, setMsg] = useState(null);
  const [saving, setSaving] = useState(false);
  const [classCount, setClassCount] = useState(null);

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

  const details = [
    { icon: 'mail', label: 'Email', value: teacher?.email },
    { icon: 'phone', label: 'Phone', value: teacher?.phone },
    { icon: 'award', label: 'Qualification', value: teacher?.highestQualification },
    { icon: 'book-open', label: 'Specialization', value: teacher?.specialization },
  ].filter(d => d.value);

  const idLine = [teacher?.teacherAppId, school?.name].filter(Boolean).join(' · ');

  return (
    <div className="p-4 pb-28 lg:p-6 max-w-[640px] mx-auto space-y-4 fade-up">
      {/* Identity */}
      <Card className="shadow-card overflow-hidden">
        <div className="h-20 bg-blue-600"></div>
        <div className="px-5 pb-5">
          <div className="flex items-end gap-4 -mt-9">
            <div className="relative">
              <Avatar src={teacher?.profileImageUrl} name={teacher?.fullName || 'Teacher'} size={76} className="rounded-2xl ring-4 ring-white" />
              <span className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-blue-600 ring-2 ring-white grid place-items-center">
                <Icon name="check" size={13} strokeWidth={2.5} className="text-white" />
              </span>
            </div>
            <div className="pb-1 min-w-0">
              <h2 className="font-700 text-ink text-[19px] tracking-[-0.01em] truncate">{teacher?.fullName || 'Teacher'}</h2>
              {idLine && <p className="text-ink-soft text-[12.5px] tnum truncate">{idLine}</p>}
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-5">
            {stats.map(s => (
              <div key={s.label} className="rounded-xl bg-line-soft py-3 text-center">
                <p className="font-800 text-ink text-[20px] tnum leading-none">{s.value}</p>
                <p className="text-[11px] font-600 text-ink-faint mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </Card>

      {/* Details */}
      {details.length > 0 && (
        <Card className="shadow-card overflow-hidden">
          <p className="px-5 pt-4 pb-1 text-[11px] font-700 tracking-[0.06em] uppercase text-ink-faint">Details</p>
          {details.map((d, i) => (
            <div key={d.label} className={`flex items-center gap-3.5 px-5 py-3.5 ${i ? 'border-t border-line-soft' : ''}`}>
              <div className="w-9 h-9 rounded-lg bg-line-soft grid place-items-center text-ink-soft shrink-0"><Icon name={d.icon} size={18} /></div>
              <span className="text-[13px] text-ink-soft flex-1">{d.label}</span>
              <span className="text-[13px] font-600 text-ink text-right truncate max-w-[58%]">{d.value}</span>
            </div>
          ))}
        </Card>
      )}

      {/* Change password */}
      <Card className="shadow-card overflow-hidden">
        <button onClick={() => setShowPwd(o => !o)} className="w-full flex items-center gap-3.5 px-5 py-4 text-left">
          <div className="w-9 h-9 rounded-lg bg-blue-50 grid place-items-center text-blue-600 shrink-0"><Icon name="lock" size={18} /></div>
          <span className="text-[14px] font-600 text-ink flex-1">Change password</span>
          <Icon name={showPwd ? 'chevron-up' : 'chevron-right'} size={18} className="text-ink-faint" />
        </button>
        {showPwd && (
          <div className="px-5 pb-5 space-y-3">
            <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="New password" className={fieldCls} />
            <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Confirm password" className={fieldCls} />
            {msg && (
              <p className={`text-[12.5px] font-600 ${msg.type === 'ok' ? 'text-emerald-600' : 'text-rose-600'}`}>{msg.text}</p>
            )}
            <Button className="w-full" onClick={handleChangePassword} disabled={saving}>
              {saving ? 'Updating…' : 'Update password'}
            </Button>
          </div>
        )}
      </Card>

      {/* Logout */}
      <Button variant="danger" className="w-full h-12" icon="log-out" onClick={() => { logout(); navigate('/login'); }}>
        Log out
      </Button>
    </div>
  );
};

export default Profile;
