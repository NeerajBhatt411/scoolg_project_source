import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ADMIN_API_BASE } from '../lib/api';
import { useAdmin } from '../context/AdminContext';
import { useToast } from '../context/ToastContext';
import MenuButton from '../components/MenuButton';
import AttendanceTrendChart from '../components/AttendanceTrendChart';

// Illustrative weekly attendance %. TODO: wire to a real attendance-trend endpoint.
const WEEK_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEK_ATTENDANCE = [94, 91, 96, 89, 93, 88];
const WEEK_AVG = Math.round(WEEK_ATTENDANCE.reduce((a, b) => a + b, 0) / WEEK_ATTENDANCE.length);

const CAT_META = {
    'Holiday': { icon: 'beach_access', color: '#e11d48', bg: '#fff1f2' },
    'Annual Function': { icon: 'celebration', color: '#7c3aed', bg: '#f5f3ff' },
    'Sports Day': { icon: 'sports_soccer', color: '#059669', bg: '#ecfdf5' },
    'Exam': { icon: 'history_edu', color: '#d97706', bg: '#fffbeb' },
    'Meeting': { icon: 'groups', color: '#2563eb', bg: '#eff6ff' },
    'Event': { icon: 'event', color: '#0891b2', bg: '#ecfeff' },
    'Other': { icon: 'push_pin', color: '#64748b', bg: '#f1f5f9' },
};
const catMeta = (k) => CAT_META[k] || CAT_META['Other'];
const eventDayLabel = (ds) => {
    const d = new Date(ds + 'T00:00:00');
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.round((d - today) / 86400000);
    if (diff === 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    if (diff > 1 && diff < 7) return `In ${diff} days`;
    return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const Dashboard = () => {
    const { stats, loadingStats, refreshStats, can, schoolId } = useAdmin();
    const { toast } = useToast();
    const navigate = useNavigate();
    const schoolName = localStorage.getItem('scoolg_school_name') || 'St. Andrews International';
    const [upcoming, setUpcoming] = useState([]);

    const StatValue = ({ children }) =>
        (loadingStats && !stats)
            ? <div className="h-8 w-20 bg-slate-200 animate-pulse rounded-lg mt-1"></div>
            : <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{children}</h4>;

    const quickActions = [
        { module: 'students', label: 'Add Student', icon: 'person_add', path: '/admin/students/add' },
        { module: 'teachers', label: 'Add Teacher', icon: 'person_add_alt', path: '/admin/teachers/add' },
        { module: 'notices', label: 'Send Notice', icon: 'send', path: '/admin/notices' },
        { module: 'timetable', label: 'Timetable', icon: 'event_note', path: '/admin/timetable' },
    ].filter(a => can(a.module));

    useEffect(() => {
        // Refresh silently in background when landing on dashboard
        refreshStats(true);
    }, []);

    useEffect(() => {
        if (!schoolId) return;
        // Pull ALL calendar events (across years), then show upcoming first;
        // if there are none upcoming, fall back to the most recent so the
        // events you scheduled always appear here.
        axios.get(`${ADMIN_API_BASE}/calendar?schoolId=${schoolId}&_=${Date.now()}`)
            .then((res) => {
                const all = Array.isArray(res.data) ? res.data : [];
                const today = new Date().toISOString().split('T')[0];
                const future = all.filter((e) => e.date >= today).sort((a, b) => a.date.localeCompare(b.date));
                const list = future.length ? future : [...all].sort((a, b) => b.date.localeCompare(a.date));
                setUpcoming(list.slice(0, 5));
            })
            .catch((e) => console.error('Calendar events fetch failed', e));
    }, [schoolId]);

    const Shimmer = ({ className }) => (
        <div className={`animate-pulse bg-slate-200 rounded ${className}`}></div>
    );


    return (
        <>
            {/* TopNavBar Shell */}
            <header className="h-auto md:h-[72px] w-full sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b-[1px] border-slate-200/50 flex flex-col md:flex-row justify-between items-center gap-4 px-4 md:px-8 py-4 md:py-0">
                <div className="flex items-center gap-2 w-full md:w-auto">
                    <MenuButton />
                    <h2 className="text-[1.5rem] md:text-[1.8rem] font-[900] text-on-surface tracking-tight">Dashboard</h2>
                    <div className="flex md:hidden items-center gap-3 ml-auto">
                        <button onClick={() => navigate('/notifications')} title="Notifications" className="h-9 w-9 flex items-center justify-center bg-slate-100 rounded-full">
                            <span className="material-symbols-outlined text-[20px] text-[#434655]">notifications</span>
                        </button>
                        <button onClick={() => navigate('/profile')} title="View profile" className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-sm flex items-center justify-center shadow-sm ring-2 ring-white active:scale-95 transition-all shrink-0">
                            {schoolName.charAt(0).toUpperCase()}
                        </button>
                    </div>
                </div>
                <div className="flex items-center gap-4 md:w-auto justify-end">
                    <div className="hidden md:flex items-center gap-3">
                        <button onClick={() => navigate('/notifications')} title="Notifications" className="hover:bg-[#e6e8ea] rounded-full p-2 transition-all active:scale-95">
                            <span className="material-symbols-outlined text-[#434655]">notifications</span>
                        </button>
                        <button onClick={() => navigate('/profile')} title="View profile" className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 text-white font-black text-base flex items-center justify-center shadow-sm ring-2 ring-white hover:ring-blue-100 active:scale-95 transition-all shrink-0">
                            {schoolName.charAt(0).toUpperCase()}
                        </button>
                    </div>
                </div>
            </header>


            <div className="min-h-[calc(100vh-72px)] bg-slate-50/50 p-4 sm:p-8 space-y-8 max-w-full">
                {/* Welcome Section */}
                <section className="max-w-full overflow-hidden flex flex-col gap-2">
                    <h3 className="text-[20px] sm:text-[28px] font-[800] text-on-surface tracking-tight leading-tight truncate sm:whitespace-normal" title={schoolName}>
                        Welcome back, {schoolName}!
                    </h3>
                    <p className="text-on-surface-variant font-medium text-xs sm:text-sm">
                        Snapshot of today's academic metrics.
                    </p>
                </section>



                {/* Stat Cards Bento */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <div onClick={() => navigate('/students')} className="bg-white p-4 sm:p-6 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.1)] transition-all duration-500 flex items-start justify-between border border-slate-50 group cursor-pointer active:scale-95">
                        <div>
                            <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                                Total Students
                            </p>
                            <StatValue>{stats?.students?.toLocaleString() || 0}</StatValue>
                            <div className="flex items-center gap-2 mt-2 text-slate-400 font-black text-[10px] uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                                <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-blue-600 animate-pulse"></span>
                                <span>Live Metrics</span>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-[20px] group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all duration-500 border border-slate-100">
                            <span className="material-symbols-outlined text-3xl">group</span>
                        </div>
                    </div>

                    <div onClick={() => navigate('/teachers')} className="bg-white p-4 sm:p-6 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.1)] transition-all duration-500 flex items-start justify-between border border-slate-50 group cursor-pointer active:scale-95">
                        <div>
                            <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                                Teachers
                            </p>
                            <StatValue>{stats?.teachers || 0}</StatValue>
                            <div className="flex items-center gap-2 mt-2 text-slate-400 font-black text-[10px] uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                                <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-blue-600"></span>
                                <span>Faculty</span>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-[20px] group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all duration-500 border border-slate-100">
                            <span className="material-symbols-outlined text-3xl">school</span>
                        </div>
                    </div>



                    <div onClick={() => navigate('/classes')} className="bg-white p-4 sm:p-6 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.1)] transition-all duration-500 flex items-start justify-between border border-slate-50 group cursor-pointer active:scale-95">
                        <div>
                            <p className="text-on-surface-variant text-[11px] uppercase font-bold tracking-widest mb-1">
                                Classes
                            </p>
                            <StatValue>{stats?.classes || 0}</StatValue>
                            <div className="flex items-center gap-2 mt-2 text-slate-400 font-black text-[10px] uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                                <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-blue-600"></span>
                                <span>Academic</span>
                            </div>
                        </div>
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-[20px] group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all duration-500 border border-slate-100">
                            <span className="material-symbols-outlined text-3xl">class</span>
                        </div>
                    </div>
                </div>

                {/* Quick Actions Section */}
                <div className="bg-slate-100/50 py-10 px-0 rounded-[48px] border-2 border-slate-200/40 shadow-[inset_0_4px_12px_rgba(0,0,0,0.05)] relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8 px-6 sm:px-8">
                        <h5 className="text-xl text-slate-900 font-black flex items-center gap-3 tracking-tight">
                            <span className="w-1.5 h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></span>
                            Quick Actions
                        </h5>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-6">
                        {quickActions.map((a) => (
                            <button key={a.module} onClick={() => window.location.href = a.path} className="bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.15)] text-slate-900 font-black py-8 px-6 rounded-[36px] flex items-center gap-5 transition-all duration-500 group cursor-pointer active:scale-95">
                                <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-[22px] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-slate-100 shadow-sm">
                                    <span className="material-symbols-outlined text-[26px]">{a.icon}</span>
                                </div>
                                <span className="text-sm font-black tracking-tight">{a.label}</span>
                            </button>
                        ))}
                        {quickActions.length === 0 && (
                            <p className="text-slate-400 text-sm font-bold col-span-full text-center py-4">No quick actions available for your role.</p>
                        )}
                    </div>
                </div>

                {/* Middle Row: Charts & Notices */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                    {/* Attendance Chart Card */}
                    <div className="bg-white p-6 sm:p-8 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 group transition-all duration-500">
                        <div className="flex justify-between items-center mb-8 px-2">
                            <h5 className="text-xl text-slate-900 font-black flex items-center gap-3 tracking-tight">
                                <span className="w-1.5 h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></span>
                                Attendance Snapshot
                            </h5>
                            <button onClick={() => navigate('/attendance/analytics')} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-all flex items-center gap-2">
                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                View Analytics
                            </button>
                        </div>
                        <div className="px-2">
                            <div className="flex items-end justify-between mb-5">
                                <div>
                                    <p className="text-3xl font-black text-slate-900 tracking-tight leading-none">{WEEK_AVG}%</p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">Avg this week</p>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                    <span className="material-symbols-outlined text-[14px]">trending_up</span> Healthy
                                </span>
                            </div>
                            <AttendanceTrendChart labels={WEEK_LABELS} values={WEEK_ATTENDANCE} />
                        </div>
                    </div>

                    {/* Scheduled Events Card (from School Calendar) */}
                    <div className="bg-white p-6 sm:p-8 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50 group transition-all duration-500">
                        <div className="flex justify-between items-center mb-8 px-2">
                            <h5 className="text-xl text-slate-900 font-black flex items-center gap-3 tracking-tight">
                                <span className="w-1.5 h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></span>
                                Scheduled Events
                            </h5>
                            <button onClick={() => navigate('/calendar')} className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:text-blue-700 transition-all flex items-center gap-1">
                                Calendar <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                            </button>
                        </div>
                        <div className="space-y-4">
                            {upcoming.length === 0 ? (
                                <div className="text-center py-10">
                                    <div className="w-14 h-14 mx-auto bg-slate-50 text-slate-300 rounded-[18px] flex items-center justify-center border border-slate-100 mb-3">
                                        <span className="material-symbols-outlined text-2xl">event_upcoming</span>
                                    </div>
                                    <p className="text-slate-500 text-sm font-bold">No scheduled events yet.</p>
                                    <button onClick={() => navigate('/calendar')} className="mt-3 text-blue-600 text-[13px] font-black hover:underline">Add events on the calendar →</button>
                                </div>
                            ) : (
                                upcoming.map((ev) => {
                                    const c = catMeta(ev.category);
                                    return (
                                        <div key={ev._id} onClick={() => navigate('/calendar')} className="group flex items-center gap-4 p-4 rounded-[24px] hover:bg-slate-50 transition-all cursor-pointer border border-transparent hover:border-slate-100">
                                            <div className="w-14 h-14 rounded-[18px] flex items-center justify-center border border-slate-100 shadow-sm shrink-0" style={{ background: c.bg, color: c.color }}>
                                                <span className="material-symbols-outlined text-2xl">{c.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h6 className="font-bold text-slate-900 text-sm tracking-tight truncate">{ev.title}</h6>
                                                <p className="text-[11px] font-bold mt-0.5" style={{ color: c.color }}>{ev.category}</p>
                                                {ev.description && <p className="text-slate-500 text-[11px] font-medium mt-0.5 line-clamp-1">{ev.description}</p>}
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{eventDayLabel(ev.date)}</span>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </>
    );
};

export default Dashboard;
