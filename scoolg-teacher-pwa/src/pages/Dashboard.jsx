import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { getCached } from '../utils/cache';
import TopHeader from '@/components/TopHeader';
import { Calendar, Users, BookOpen, ChevronRight, Clock, Calculator, Code, BookType, Beaker, FileText, LayoutDashboard, ClipboardCheck, FileEdit, Megaphone, CloudUpload, PenTool, BarChart } from 'lucide-react';
import AttendanceTrendChart from '../components/AttendanceTrendChart';

// Map subjects to colors for the timeline dot
const getSubjectColor = (subject) => {
    const sub = (subject || '').toLowerCase();
    if (sub.includes('math')) return '#22c55e'; // Green
    if (sub.includes('computer') || sub.includes('cs')) return '#3b82f6'; // Blue
    if (sub.includes('english') || sub.includes('lang')) return '#a855f7'; // Purple
    if (sub.includes('science') || sub.includes('phy') || sub.includes('chem') || sub.includes('bio')) return '#f97316'; // Orange
    if (sub.includes('history') || sub.includes('social')) return '#eab308'; // Yellow
    return '#64748b'; // Slate
};

const EVENT_CATEGORIES = {
    'Holiday': { color: '#ef4444', label: 'Holiday' },
    'Annual Function': { color: '#8b5cf6', label: 'School Event' },
    'Sports Day': { color: '#f59e0b', label: 'School Event' },
    'Exam': { color: '#3b82f6', label: 'Exam' },
    'Meeting': { color: '#22c55e', label: 'Meeting' },
    'Event': { color: '#06b6d4', label: 'School Event' },
    'Other': { color: '#64748b', label: 'Other' },
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

let cachedDashboardData = null;

const Dashboard = () => {
    const { teacher } = useAuth();
    const navigate = useNavigate();

    const [todayPeriods, setTodayPeriods] = useState(cachedDashboardData?.todayPeriods || []);
    const [weekCount, setWeekCount] = useState(cachedDashboardData?.weekCount || 0);
    const [classCount, setClassCount] = useState(cachedDashboardData?.classCount || 0);
    const [weekDays, setWeekDays] = useState(cachedDashboardData?.weekDays || [0, 0, 0, 0, 0, 0, 0]);
    const [events, setEvents] = useState(cachedDashboardData?.events || []);
    const [loading, setLoading] = useState(!cachedDashboardData);

    const now = new Date();
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = DAYS[now.getDay()];
    const teacherName = teacher?.fullName || 'Teacher';
    const dateString = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const greeting = getGreeting();

    useEffect(() => {
        const load = async () => {
            try {
                // Shared cache: timetable & my-classes are reused by their own pages,
                // so navigating around doesn't refetch them. Events get a shorter TTL.
                const [tt, cls, ev] = await Promise.all([
                    getCached('teacher:timetable', () => api.get('/teacher/timetable').then(r => r.data)).catch(() => ({ schedule: [] })),
                    getCached('teacher:my-classes', () => api.get('/teacher/my-classes').then(r => Array.isArray(r.data) ? r.data : [])).catch(() => []),
                    getCached('teacher:events', () => api.get('/teacher/events?limit=5').then(r => Array.isArray(r.data) ? r.data : []), { ttl: 5 * 60 * 1000 }).catch(() => []),
                ]);

                const sched = tt?.schedule || [];
                setTodayPeriods((sched.find(d => d.dayOfWeek === todayName)?.periods) || []);
                setWeekCount(sched.reduce((sum, d) => sum + (d.periods?.length || 0), 0));

                const dayCounts = [0, 0, 0, 0, 0, 0, 0];
                const mapDay = { 'Monday': 0, 'Tuesday': 1, 'Wednesday': 2, 'Thursday': 3, 'Friday': 4, 'Saturday': 5, 'Sunday': 6 };
                sched.forEach(d => {
                    if (mapDay[d.dayOfWeek] !== undefined) {
                        dayCounts[mapDay[d.dayOfWeek]] = d.periods?.length || 0;
                    }
                });
                setWeekDays(dayCounts);

                const classList = Array.isArray(cls) ? cls : [];
                setClassCount(classList.length);

                const newEvents = Array.isArray(ev) ? ev : [];
                setEvents(newEvents);

                cachedDashboardData = {
                    todayPeriods: sched.find(d => d.dayOfWeek === todayName)?.periods || [],
                    weekCount: sched.reduce((sum, d) => sum + (d.periods?.length || 0), 0),
                    classCount: cls.length,
                    weekDays: dayCounts,
                    events: newEvents,
                };
            } catch (e) {
                console.error('Dashboard load failed', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [todayName]);

    const totalStudents = classCount * 38; // Estimated

    const quickActions = [
        { label: 'Take Attendance', icon: ClipboardCheck, path: '/attendance', color: 'text-blue-600', bg: 'bg-blue-50/80' },
        { label: 'Assign Homework', icon: FileEdit, path: '/homework', color: 'text-blue-600', bg: 'bg-blue-50/80' },
        { label: 'My Timetable', icon: Calendar, path: '/timetable', color: 'text-blue-600', bg: 'bg-blue-50/80' },
        { label: 'My Classes', icon: Users, path: '/classes', color: 'text-blue-600', bg: 'bg-blue-50/80' },
    ];

    const upcoming = events.slice(0, 3);

    if (loading) {
        return (
            <div className="bg-[#f8fafc] min-h-screen pb-10">
                <TopHeader title="Dashboard" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
                    {/* Title */}
                    <div className="space-y-2.5 mb-6 sm:mb-8">
                        <div className="w-48 sm:w-64 h-8 sm:h-10 rounded-xl bg-slate-200/70 animate-pulse"></div>
                        <div className="w-32 h-4 rounded-md bg-slate-200/50 animate-pulse"></div>
                    </div>

                    {/* 4 Cards Grid */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-[16px] sm:rounded-[24px] p-4 sm:p-5 border border-slate-100 flex items-center gap-3 sm:gap-4 shadow-sm">
                                <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-slate-100 animate-pulse shrink-0"></div>
                                <div className="flex-1 space-y-2">
                                    <div className="h-2.5 w-16 bg-slate-100 rounded animate-pulse"></div>
                                    <div className="h-6 sm:h-8 w-12 bg-slate-200/60 rounded animate-pulse"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Middle Section */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
                        <div className="lg:col-span-2 bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm min-h-[350px]">
                            <div className="flex justify-between items-center mb-8">
                                <div className="w-40 h-6 bg-slate-200/70 rounded-lg animate-pulse"></div>
                                <div className="w-24 h-4 bg-slate-100 rounded animate-pulse"></div>
                            </div>
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex gap-4 items-center">
                                        <div className="w-16 h-10 bg-slate-100 rounded-lg animate-pulse shrink-0"></div>
                                        <div className="w-[2px] h-12 bg-slate-100 shrink-0"></div>
                                        <div className="flex-1 h-16 bg-slate-50 border border-slate-100 rounded-[20px] animate-pulse"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-slate-100 shadow-sm min-h-[350px]">
                            <div className="w-32 h-6 bg-slate-200/70 rounded-lg animate-pulse mb-6"></div>
                            <div className="grid grid-cols-2 gap-3">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className="h-24 bg-slate-50 border border-slate-100 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-[#f8fafc] min-h-screen pb-10">
            <TopHeader title="Dashboard" />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
                {/* Header Greeting */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                        {greeting}, <span className="capitalize">{teacherName.split(' ')[0]}</span>
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">{dateString}</p>
                </div>

                {/* Top Stat Cards (Horizontal Layout with Unified Blue) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
                    {/* Card 1 */}
                    <div className="bg-[#faf9f6] rounded-[16px] sm:rounded-[24px] p-3 sm:p-5 shadow-[0_10px_30px_rgba(120,113,108,0.08)] border border-stone-200 border-b-[6px] border-b-stone-300 flex items-center gap-2 sm:gap-4 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(120,113,108,0.12)] hover:border-b-stone-400 transition-all cursor-pointer" onClick={() => navigate('/timetable')}>
                        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                            <Calendar className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-xs font-bold text-stone-500 leading-tight mb-0.5">Periods Today</p>
                            <h4 className="text-lg sm:text-2xl font-black text-slate-900 leading-none drop-shadow-sm">{todayPeriods.length}</h4>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="bg-[#faf9f6] rounded-[16px] sm:rounded-[24px] p-3 sm:p-5 shadow-[0_10px_30px_rgba(120,113,108,0.08)] border border-stone-200 border-b-[6px] border-b-stone-300 flex items-center gap-2 sm:gap-4 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(120,113,108,0.12)] hover:border-b-stone-400 transition-all cursor-pointer" onClick={() => navigate('/timetable')}>
                        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                            <LayoutDashboard className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-xs font-bold text-stone-500 leading-tight mb-0.5">Classes Week</p>
                            <h4 className="text-lg sm:text-2xl font-black text-slate-900 leading-none drop-shadow-sm">{weekCount}</h4>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="bg-[#faf9f6] rounded-[16px] sm:rounded-[24px] p-3 sm:p-5 shadow-[0_10px_30px_rgba(120,113,108,0.08)] border border-stone-200 border-b-[6px] border-b-stone-300 flex items-center gap-2 sm:gap-4 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(120,113,108,0.12)] hover:border-b-stone-400 transition-all cursor-pointer" onClick={() => navigate('/classes')}>
                        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                            <BookOpen className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-xs font-bold text-stone-500 leading-tight mb-0.5">My Classes</p>
                            <h4 className="text-lg sm:text-2xl font-black text-slate-900 leading-none drop-shadow-sm">{classCount}</h4>
                        </div>
                    </div>

                    {/* Card 4 */}
                    <div className="bg-[#faf9f6] rounded-[16px] sm:rounded-[24px] p-3 sm:p-5 shadow-[0_10px_30px_rgba(120,113,108,0.08)] border border-stone-200 border-b-[6px] border-b-stone-300 flex items-center gap-2 sm:gap-4 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(120,113,108,0.12)] hover:border-b-stone-400 transition-all cursor-pointer" onClick={() => navigate('/students')}>
                        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                            <Users className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-xs font-bold text-stone-500 leading-tight mb-0.5">Students</p>
                            <h4 className="text-lg sm:text-2xl font-black text-slate-900 leading-none drop-shadow-sm">{totalStudents}</h4>
                        </div>
                    </div>
                </div>

                {/* Middle Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Schedule Timeline */}
                    <div className="lg:col-span-2 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                Today's Schedule
                            </h2>
                            <button onClick={() => navigate('/timetable')} className="text-[11px] sm:text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                                Full Timetable <ChevronRight className="h-3 w-3" />
                            </button>
                        </div>

                        {loading ? (
                            <div className="space-y-6">
                                {[1, 2, 3].map(i => <div key={i} className="h-16 animate-pulse bg-slate-50 rounded-2xl"></div>)}
                            </div>
                        ) : todayPeriods.length === 0 ? (
                            <div className="py-12 text-center">
                                <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Clock className="h-8 w-8 text-slate-300" />
                                </div>
                                <p className="text-slate-500 font-medium">No classes scheduled for today.</p>
                            </div>
                        ) : (
                            <div className="flex flex-col relative">
                                {todayPeriods.map((p, i) => {
                                    const color = getSubjectColor(p.subject);
                                    return (
                                        <div key={i} className="relative flex items-stretch group cursor-pointer">
                                            {/* Time Column */}
                                            <div className="w-14 sm:w-20 shrink-0 text-right pr-3 sm:pr-4 py-6">
                                                <p className="text-[11px] sm:text-sm font-black text-slate-900 leading-none">{p.startTime}</p>
                                                <p className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5">{p.endTime}</p>
                                            </div>

                                            {/* Timeline divider */}
                                            <div className="relative flex flex-col items-center px-1">
                                                <div className="w-[2px] h-full bg-slate-200 absolute top-0 bottom-0"></div>
                                                <div className="w-3.5 h-3.5 rounded-full border-[2px] border-slate-50 relative mt-6 shadow-sm z-10 transition-transform group-hover:scale-125" style={{ backgroundColor: color }}></div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="flex-1 py-3 pl-3 sm:pl-5">
                                                <div className="bg-[#faf9f6] p-4 sm:p-5 rounded-[20px] sm:rounded-[24px] shadow-[0_8px_20px_rgba(120,113,108,0.06)] border border-stone-200/60 border-b-[4px] border-b-stone-300/60 hover:shadow-[0_12px_25px_rgba(120,113,108,0.1)] hover:border-b-stone-400/50 transition-all flex justify-between items-center group-hover:-translate-y-1">
                                                    <div className="min-w-0 pr-2">
                                                        <h4 className="text-[13px] sm:text-base font-black text-slate-900 mb-1.5 truncate drop-shadow-sm">{p.subject || 'Subject Not Set'}</h4>
                                                        <span className="inline-flex items-center px-2 py-1 rounded-lg text-[9px] sm:text-[10px] font-black uppercase tracking-widest leading-none shadow-inner bg-white/80" style={{ color: color, border: `1px solid ${color}20`, backgroundColor: `${color}0A` }}>
                                                            {p.className} {p.sectionName}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Classes This Week Chart */}
                    <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col">
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900">Classes This Week</h2>
                            <button onClick={() => navigate('/timetable')} className="text-[11px] sm:text-xs font-semibold text-blue-600 flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                                This Week <ChevronRight className="h-3 w-3" />
                            </button>
                        </div>

                        <div className="flex-1 min-h-[200px]">
                            {loading ? (
                                <div className="h-full w-full animate-pulse bg-slate-50 rounded-2xl"></div>
                            ) : (
                                <AttendanceTrendChart labels={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']} values={weekDays} height="h-[220px]" color="#2563eb" />
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-6">
                            <div className="bg-slate-50 rounded-2xl p-3 text-center">
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Total</p>
                                <p className="text-lg font-bold text-slate-900">{weekCount}</p>
                            </div>
                            <div className="bg-green-50/50 rounded-2xl p-3 text-center border border-green-100">
                                <p className="text-[10px] font-bold text-green-600 uppercase tracking-wider mb-1">Highest</p>
                                <p className="text-[13px] font-bold text-slate-900">{Math.max(...weekDays)}</p>
                            </div>
                            <div className="bg-rose-50/50 rounded-2xl p-3 text-center border border-rose-100">
                                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-wider mb-1">Lowest</p>
                                <p className="text-[13px] font-bold text-slate-900">{Math.min(...weekDays.filter(v => v > 0)) || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Quick Actions */}
                    <div className="lg:col-span-2 bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-100">
                        <h2 className="text-lg font-bold text-slate-900 mb-6">Quick Actions</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {quickActions.map((action, idx) => {
                                const Icon = action.icon;
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => navigate(action.path)}
                                        className="flex flex-col items-center justify-center p-4 rounded-2xl border border-slate-100 hover:shadow-md hover:border-blue-100 transition-all active:scale-95 group"
                                    >
                                        <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-3 ${action.bg} ${action.color} group-hover:scale-110 transition-transform duration-300`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <span className="text-[11px] sm:text-xs font-bold text-slate-700 text-center leading-tight">
                                            {action.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upcoming Events */}
                    <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-lg font-bold text-slate-900">Upcoming Events</h2>
                            <button onClick={() => navigate('/calendar')} className="text-xs font-semibold text-blue-600 flex items-center gap-1">
                                View Calendar <ChevronRight className="h-3 w-3" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                [1, 2, 3].map(i => <div key={i} className="h-14 animate-pulse bg-slate-50 rounded-2xl"></div>)
                            ) : upcoming.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-slate-500 text-sm font-medium">No upcoming events.</p>
                                </div>
                            ) : (
                                upcoming.map((ev, idx) => {
                                    const meta = EVENT_CATEGORIES[ev.category] || EVENT_CATEGORIES['Other'];
                                    const dateObj = new Date(ev.date);
                                    const month = dateObj.toLocaleString('en-GB', { month: 'short' }).toUpperCase();
                                    const day = dateObj.getDate();

                                    return (
                                        <div key={idx} onClick={() => navigate('/calendar')} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer border border-transparent hover:border-slate-100">
                                            <div className="w-12 h-12 rounded-[14px] bg-slate-50 border border-slate-100 flex flex-col items-center justify-center shrink-0">
                                                <span className="text-[10px] font-bold text-blue-600 leading-tight">{month}</span>
                                                <span className="text-lg font-black text-slate-900 leading-tight">{day}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="text-sm font-bold text-slate-900 truncate">{ev.title}</h4>
                                                <p className="text-[11px] font-semibold text-slate-500 mt-0.5">{meta.label}</p>
                                            </div>
                                            <div className="shrink-0 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: meta.color }}></span>
                                                <span className="text-[10px] font-semibold text-slate-400">All Day</span>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
