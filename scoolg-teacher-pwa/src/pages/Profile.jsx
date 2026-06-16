import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Mail, Phone, GraduationCap, BookOpen, Lock, LogOut, ChevronRight, ChevronDown, School, BadgeCheck, Save, Loader2, User, KeyRound, Bell } from 'lucide-react';
import MenuButton from '../components/MenuButton';
import { initPush } from '../firebase';

const Profile = () => {
    const { teacher, school, logout } = useAuth();
    const navigate = useNavigate();
    const [showPwd, setShowPwd] = useState(false);
    const [newPwd, setNewPwd] = useState('');
    const [confirmPwd, setConfirmPwd] = useState('');
    const [msg, setMsg] = useState(null);
    const [saving, setSaving] = useState(false);
    const [classCount, setClassCount] = useState(null);
    const [pushMsg, setPushMsg] = useState(null);
    const [pushBusy, setPushBusy] = useState(false);

    const enablePush = async () => {
        setPushBusy(true); setPushMsg(null);
        try {
            const token = await initPush({
                role: 'teacher', userId: teacher?._id, schoolId: school?.id,
                onToken: (t) => api.post('/notifications/token', { role: 'teacher', userId: teacher?._id, schoolId: school?.id, token: t }),
            });
            if (!token) { setPushMsg({ type: 'err', text: 'Permission denied / not supported. Allow notifications in your browser settings, then retry.' }); return; }
            await api.post('/notifications/test', { token });
            setPushMsg({ type: 'ok', text: 'Enabled! A test notification was just sent — check your device 🔔' });
        } catch (e) {
            setPushMsg({ type: 'err', text: 'Could not enable notifications.' });
        } finally { setPushBusy(false); }
    };

    const name = teacher?.fullName || 'Teacher';
    const colors = ['from-blue-500 to-cyan-500', 'from-rose-500 to-pink-500', 'from-amber-500 to-orange-500', 'from-emerald-500 to-teal-500', 'from-indigo-500 to-purple-500'];
    const bgGradient = colors[name.length % colors.length];

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

    const SectionCard = ({ icon, iconBg, iconColor, title, children, full }) => (
        <div className={`bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] p-6 ${full ? 'lg:col-span-2' : ''}`}>
            <div className="flex items-center gap-2.5 mb-5">
                <div className="w-10 h-10 rounded-xl grid place-items-center" style={{ background: iconBg }}>{React.cloneElement(icon, { size: 20, color: iconColor })}</div>
                <h3 className="text-lg font-bold text-slate-800">{title}</h3>
            </div>
            {children}
        </div>
    );

    const Field = ({ label, val }) => (
        <div>
            <label className="flex items-center gap-1 text-[11px] font-black text-slate-400 uppercase tracking-widest mb-1.5">
                {label} <Lock size={11} className="text-slate-300" />
            </label>
            <p className={`text-[14.5px] font-semibold ${val ? 'text-slate-800' : 'text-slate-300'}`}>{val || '—'}</p>
        </div>
    );

    const inputCls = 'w-full h-11 px-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-[14px] outline-none focus:ring-2 focus:ring-blue-500/30 focus:bg-white transition-all';

    return (
        <div className="p-4 sm:p-6 lg:p-10 max-w-[1000px] mx-auto pb-24">
            {/* title + actions */}
            <div className="flex items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3 min-w-0">
                    <div className="lg:hidden">
                        <MenuButton />
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight truncate">My Profile</h1>
                        <p className="text-slate-500 font-medium text-sm hidden sm:block">Your personal and academic details.</p>
                    </div>
                </div>
                <button onClick={() => { logout(); navigate('/login'); }} className="px-4 h-10 sm:h-11 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-sm inline-flex items-center gap-1.5 transition-colors">
                    <LogOut size={17} /> <span className="hidden sm:inline">Logout</span>
                </button>
            </div>

            {/* identity header (read-only) */}
            <div className="bg-white rounded-[24px] sm:rounded-[28px] border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-5 sm:p-8 mb-6 flex flex-col sm:flex-row sm:items-center gap-5 sm:gap-6">
                <div className={`h-20 w-20 sm:h-24 sm:w-24 rounded-3xl bg-gradient-to-br ${bgGradient} text-white flex items-center justify-center text-3xl sm:text-4xl font-black shrink-0 shadow-inner overflow-hidden border-2 border-white ring-1 ring-slate-100`}>
                    {teacher?.profileImageUrl ? (
                        <img src={teacher.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                        <img src={`https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(name)}&backgroundColor=transparent`} alt="avatar" className="w-[85%] h-[85%] object-contain drop-shadow-md translate-y-1" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{teacher?.fullName || 'Teacher'}</h2>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-600"><BadgeCheck size={12} />ACTIVE</span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 sm:gap-x-6 gap-y-2 mt-2 sm:mt-3">
                        <span className="flex items-center gap-2 text-slate-600 text-sm font-semibold min-w-0"><Mail size={16} className="text-slate-400 shrink-0" /><span className="truncate">{teacher?.email || '—'}</span></span>
                        <span className="flex items-center gap-2 text-slate-600 text-sm font-semibold"><Phone size={16} className="text-slate-400 shrink-0" />{teacher?.phone || '—'}</span>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">Teacher ID</span>
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs sm:text-sm font-black tabular-nums">{teacher?.teacherAppId || '—'}</span>
                        </div>
                        <div className="flex items-center gap-2 ml-0 sm:ml-4">
                            <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest">School</span>
                            <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-700 border border-slate-100 text-xs sm:text-sm font-black flex items-center gap-1.5"><School size={14} className="text-slate-400" /> {school?.name || '—'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SectionCard icon={<GraduationCap />} iconBg="#eff6ff" iconColor="#2563eb" title="Academic Information">
                    <div className="space-y-5">
                        <Field label="Highest Qualification" val={teacher?.highestQualification} />
                        <Field label="Specialization" val={teacher?.specialization} />
                        <Field label="Experience" val={teacher?.experienceYears ? `${teacher.experienceYears} Years` : null} />
                    </div>
                </SectionCard>

                <SectionCard icon={<BookOpen />} iconBg="#fef2f2" iconColor="#ef4444" title="Workload Stats">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Classes</p>
                            <p className="text-3xl font-black text-slate-900">{classCount ?? '—'}</p>
                        </div>
                        <div className="bg-slate-50 rounded-2xl p-4 text-center border border-slate-100">
                            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Subjects</p>
                            <p className="text-3xl font-black text-slate-900">{teacher?.subjects?.length || 0}</p>
                        </div>
                    </div>
                    {teacher?.subjects?.length > 0 && (
                        <div className="mt-5">
                            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2">Assigned Subjects</p>
                            <div className="flex flex-wrap gap-2">
                                {teacher.subjects.map((sub, i) => (
                                    <span key={i} className="px-3 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-lg shadow-sm">
                                        {sub}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                </SectionCard>

                <SectionCard icon={<Bell />} iconBg="#eff6ff" iconColor="#2563eb" title="Notifications" full>
                    <div className="max-w-md">
                        <p className="text-sm font-medium text-slate-500 mb-4">Get instant alerts for homework, attendance and school events on this device.</p>
                        <button onClick={enablePush} disabled={pushBusy} className="px-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm inline-flex items-center gap-2 transition-colors disabled:opacity-60">
                            {pushBusy ? <Loader2 size={16} className="animate-spin" /> : <Bell size={16} />} {pushBusy ? 'Enabling…' : 'Enable & test notifications'}
                        </button>
                        {pushMsg && <p className={`mt-3 text-sm font-semibold ${pushMsg.type === 'ok' ? 'text-emerald-600' : 'text-rose-600'}`}>{pushMsg.text}</p>}
                    </div>
                </SectionCard>

                <SectionCard icon={<KeyRound />} iconBg="#fffbeb" iconColor="#f59e0b" title="Account Security" full>
                    <div className="max-w-md">
                        <p className="text-sm font-medium text-slate-500 mb-5">Keep your account secure by regularly updating your password.</p>
                        
                        {!showPwd ? (
                            <button onClick={() => setShowPwd(true)} className="px-5 h-11 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-sm inline-flex items-center gap-2 transition-colors">
                                <Lock size={16} /> Change Password
                            </button>
                        ) : (
                            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-100">
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">New Password</label>
                                    <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} className={inputCls} placeholder="Enter new password" />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Confirm Password</label>
                                    <input type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} className={inputCls} placeholder="Confirm new password" />
                                </div>
                                
                                {msg && (
                                    <div className={`p-3 rounded-lg text-xs font-bold ${msg.type === 'ok' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                        {msg.text}
                                    </div>
                                )}
                                
                                <div className="flex items-center gap-3 pt-2">
                                    <button onClick={handleChangePassword} disabled={saving} className="px-5 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm inline-flex items-center justify-center min-w-[120px] transition-colors disabled:opacity-60 shadow-md">
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : 'Update'}
                                    </button>
                                    <button onClick={() => { setShowPwd(false); setMsg(null); setNewPwd(''); setConfirmPwd(''); }} className="px-5 h-11 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 font-bold text-sm inline-flex items-center justify-center transition-colors">
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </SectionCard>
            </div>
        </div>
    );
};

export default Profile;
