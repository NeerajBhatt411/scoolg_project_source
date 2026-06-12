import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar } from '@/components/ui/avatar';
import { Mail, Phone, GraduationCap, BookOpen, Lock, LogOut, ChevronRight, ChevronDown, School } from 'lucide-react';

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

  const InfoRow = ({ icon: Icon, label, value }) => (
    <div className="flex items-center gap-3 py-3">
      <div className="h-9 w-9 rounded-md bg-primary/10 text-primary grid place-items-center shrink-0">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm font-semibold truncate">{value || '—'}</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-full px-4 lg:px-8 pt-5 pb-32 lg:pb-10 space-y-5 max-w-5xl mx-auto">
      <div>
        <h1 className="font-manrope text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-sm text-muted-foreground">Your account and personal details.</p>
      </div>

      {/* Identity */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar src={avatar} alt={teacher?.fullName || 'Teacher'} className="h-16 w-16">
              {(teacher?.fullName || 'T').charAt(0).toUpperCase()}
            </Avatar>
            <div className="flex-1 min-w-0">
              <h2 className="font-manrope text-xl font-bold truncate">{teacher?.fullName || 'Teacher'}</h2>
              {teacher?.teacherAppId && (
                <Badge variant="secondary" className="font-mono mt-1">{teacher.teacherAppId}</Badge>
              )}
            </div>
          </div>

          {/* School row */}
          <div className="flex items-center gap-2.5 mt-4 text-sm text-muted-foreground">
            {school?.logo
              ? <img src={school.logo} alt="" className="h-6 w-6 rounded object-cover shrink-0" />
              : <School className="h-4 w-4 shrink-0" />}
            <span className="truncate">{school?.name || 'School'}</span>
          </div>

          {/* Stat tiles */}
          <div className="grid grid-cols-3 gap-3 mt-4 text-center">
            {stats.map((s, i) => (
              <div key={i} className="rounded-md border bg-muted/40 py-3">
                <p className="text-xl font-bold">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y divide-border">
            <InfoRow icon={Mail} label="Email" value={teacher?.email} />
            <InfoRow icon={Phone} label="Phone" value={teacher?.phone} />
            <InfoRow icon={GraduationCap} label="Qualification" value={teacher?.highestQualification} />
            <InfoRow icon={BookOpen} label="Specialization" value={teacher?.specialization} />
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardContent className="pt-4 pb-4">
          <button onClick={() => setShowPwd(s => !s)} className="w-full flex items-center gap-3 text-left">
            <div className="h-9 w-9 rounded-md bg-primary/10 text-primary grid place-items-center shrink-0">
              <Lock className="h-4 w-4" />
            </div>
            <span className="text-sm font-semibold flex-1">Change Password</span>
            {showPwd
              ? <ChevronDown className="h-4 w-4 text-muted-foreground" />
              : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
          </button>
          {showPwd && (
            <div className="mt-4 space-y-3">
              <Input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} placeholder="New password" />
              <Input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} placeholder="Confirm password" />
              {msg && (
                <p className={`text-xs font-medium ${msg.type === 'ok' ? 'text-emerald-600' : 'text-red-600'}`}>{msg.text}</p>
              )}
              <Button onClick={handleChangePassword} disabled={saving} className="w-full">
                {saving ? 'Updating...' : 'Update Password'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Logout */}
      <Button variant="destructive" className="w-full" onClick={() => { logout(); navigate('/login'); }}>
        <LogOut className="h-4 w-4 mr-1.5" /> Logout
      </Button>
    </div>
  );
};

export default Profile;
