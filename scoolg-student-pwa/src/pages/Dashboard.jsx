import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { Calendar, BookOpen, Clock, LayoutDashboard, FileEdit, ClipboardCheck, ChevronRight, BookType, BarChart, FileText, Palmtree } from 'lucide-react';
import { DashboardShimmer } from '../components/StudentShimmer';

const getSubjectColor = (subject) => {
    const sub = (subject || '').toLowerCase();
    if (sub.includes('math')) return '#22c55e'; // Green
    if (sub.includes('computer') || sub.includes('cs')) return '#3b82f6'; // Blue
    if (sub.includes('english') || sub.includes('lang')) return '#a855f7'; // Purple
    if (sub.includes('science') || sub.includes('phy') || sub.includes('chem') || sub.includes('bio')) return '#f97316'; // Orange
    if (sub.includes('history') || sub.includes('social')) return '#eab308'; // Yellow
    return '#64748b'; // Slate
};

const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
};

const Dashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [todayPeriods, setTodayPeriods] = useState([]);
    const [weekCount, setWeekCount] = useState(0);
    const [attendanceStats, setAttendanceStats] = useState({ percentage: 0, present: 0, absent: 0, leave: 0, total: 0 });
    const [upcomingEvents, setUpcomingEvents] = useState([]);
    const [pendingHomework, setPendingHomework] = useState(0);
    const [loading, setLoading] = useState(true);

    const now = new Date();
    const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayName = DAYS[now.getDay()];
    const studentName = user?.firstName || 'Student';
    const dateString = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const greeting = getGreeting();

    const quickActions = [
        { label: 'Homework', icon: FileText, path: '/homework', color: 'text-blue-600', bg: 'bg-blue-50/80' },
        { label: 'Timetable', icon: Calendar, path: '/timetable', color: 'text-blue-600', bg: 'bg-blue-50/80' },
        { label: 'Results', icon: BarChart, path: '/results', color: 'text-blue-600', bg: 'bg-blue-50/80' },
        { label: 'Subjects', icon: BookOpen, path: '/subjects', color: 'text-blue-600', bg: 'bg-blue-50/80' },
    ];

    useEffect(() => {
        const load = async () => {
            try {
                const [ttRes, attRes, hwRes] = await Promise.all([
                    api.get('/student/timetable').catch(() => ({ data: { schedule: [] } })),
                    api.get('/student/attendance').catch(() => ({ data: [] })),
                    api.get('/student/homework').catch(() => ({ data: [] })),
                ]);

                // Timetable
                const sched = ttRes.data?.schedule || [];
                setTodayPeriods((sched.find(d => d.dayOfWeek === todayName)?.periods) || []);
                setWeekCount(sched.reduce((sum, d) => sum + (d.periods?.length || 0), 0));

                // Attendance
                const attData = Array.isArray(attRes.data) ? attRes.data : [];
                const presentCount = attData.filter(r => r.status === 'Present' || r.status === 'P').length;
                const absentCount = attData.filter(r => r.status === 'Absent' || r.status === 'A').length;
                const leaveCount = attData.filter(r => r.status === 'Leave' || r.status === 'Late' || r.status === 'L').length;
                const total = attData.length;
                const percentage = total > 0 ? Math.round((presentCount / total) * 100) : 0;
                setAttendanceStats({ percentage, present: presentCount, absent: absentCount, leave: leaveCount, total });

                // Homework
                const hwData = Array.isArray(hwRes.data) ? hwRes.data : [];
                setPendingHomework(hwData.filter(h => h.status === 'Pending').length);

                // Upcoming Events
                try {
                    const calRes = await api.get('/student/calendar');
                    const events = Array.isArray(calRes.data) ? calRes.data : [];
                    const futureEvents = events.filter(e => new Date(e.date) >= now);
                    futureEvents.sort((a,b) => new Date(a.date) - new Date(b.date));
                    setUpcomingEvents(futureEvents.slice(0, 3));
                } catch(err) {
                    const currentYear = now.getFullYear();
                    const currentMonth = now.getMonth();
                    const mockEvents = [
                        { id: 1, title: 'Winter Vacation', type: 'Holiday', date: new Date(currentYear, currentMonth, 25).toISOString() },
                        { id: 2, title: 'Annual Sports Meet', type: 'Event', date: new Date(currentYear, currentMonth, 15).toISOString() },
                        { id: 3, title: 'Science Exhibition', type: 'Academic', date: new Date(currentYear, currentMonth, 10).toISOString() },
                    ];
                    const futureEvents = mockEvents.filter(e => new Date(e.date) >= now);
                    futureEvents.sort((a,b) => new Date(a.date) - new Date(b.date));
                    setUpcomingEvents(futureEvents.slice(0, 3));
                }

            } catch (e) {
                console.error('Dashboard load failed', e);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, [todayName]);

    if (loading) {
        return <DashboardShimmer />;
    }

    return (
        <div className="w-full h-full pb-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-2 sm:pt-6 space-y-4 sm:space-y-6">
                {/* Header Greeting */}
                <div className="mb-4 sm:mb-8 mt-1 lg:mt-0">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight truncate">
                        {greeting}, <span className="capitalize">{studentName}</span>
                    </h1>
                    <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">{dateString}</p>
                </div>

                {/* Top Stat Cards */}
                <div className="grid grid-cols-2 gap-3 sm:gap-6">
                    {/* Attendance Card */}
                    <div className="bg-[#faf9f6] rounded-[16px] sm:rounded-[24px] p-3 sm:p-5 shadow-[0_10px_30px_rgba(120,113,108,0.08)] border border-stone-200 border-b-[6px] border-b-stone-300 flex items-center gap-2 sm:gap-4 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(120,113,108,0.12)] hover:border-b-stone-400 transition-all cursor-pointer" onClick={() => navigate('/attendance')}>
                        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                            <ClipboardCheck className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-xs font-bold text-stone-500 leading-tight mb-0.5">Attendance</p>
                            <h4 className="text-lg sm:text-2xl font-black text-slate-900 leading-none drop-shadow-sm">{attendanceStats.percentage}%</h4>
                        </div>
                    </div>

                    {/* Card 2: Periods Today */}
                    <div className="bg-[#faf9f6] rounded-[16px] sm:rounded-[24px] p-3 sm:p-5 shadow-[0_10px_30px_rgba(120,113,108,0.08)] border border-stone-200 border-b-[6px] border-b-stone-300 flex items-center gap-2 sm:gap-4 hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(120,113,108,0.12)] hover:border-b-stone-400 transition-all cursor-pointer" onClick={() => navigate('/timetable')}>
                        <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100/50 text-blue-600 flex items-center justify-center shrink-0 shadow-inner">
                            <Calendar className="h-4 w-4 sm:h-6 sm:w-6" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-[9px] sm:text-xs font-bold text-stone-500 leading-tight mb-0.5">Periods Today</p>
                            <h4 className="text-lg sm:text-2xl font-black text-slate-900 leading-none drop-shadow-sm">{todayPeriods.length}</h4>
                        </div>
                    </div>

                </div>

                {/* Middle Row */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Today's Schedule Timeline & Holiday */}
                    <div className="lg:col-span-2 flex flex-col gap-6">
                      <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-100 flex-1">
                        <div className="flex justify-between items-center mb-6 sm:mb-8">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                Today's Schedule
                            </h2>
                            <button onClick={() => navigate('/timetable')} className="text-[11px] sm:text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 sm:gap-1 whitespace-nowrap">
                                Full Timetable <ChevronRight className="h-3 w-3" />
                            </button>
                        </div>

                        {todayPeriods.length === 0 ? (
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
                                            <div className="w-12 sm:w-16 shrink-0 text-right pr-2 sm:pr-3 py-3">
                                                <p className="text-[10px] sm:text-xs font-black text-slate-900 leading-none">{p.startTime}</p>
                                                <p className="text-[8px] sm:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-1">{p.endTime}</p>
                                            </div>

                                            {/* Timeline divider */}
                                            <div className="relative flex flex-col items-center px-1">
                                                <div className="w-[2px] h-full bg-slate-200 absolute top-0 bottom-0"></div>
                                                <div className="w-3 h-3 rounded-full border-[2px] border-slate-50 relative mt-3 shadow-sm z-10 transition-transform group-hover:scale-125" style={{ backgroundColor: color }}></div>
                                            </div>

                                            {/* Card Content */}
                                            <div className="flex-1 py-1 pl-2 sm:pl-4">
                                                <div className="bg-[#faf9f6] p-3 sm:p-4 rounded-[16px] sm:rounded-[20px] shadow-[0_4px_12px_rgba(120,113,108,0.04)] border border-stone-200/60 border-b-[3px] border-b-stone-300/60 hover:shadow-[0_6px_16px_rgba(120,113,108,0.08)] hover:border-b-stone-400/50 transition-all flex justify-between items-center group-hover:-translate-y-0.5">
                                                    <div className="min-w-0 pr-2">
                                                        <h4 className="text-xs sm:text-sm font-black text-slate-900 mb-1 truncate drop-shadow-sm">{p.subject || 'Subject Not Set'}</h4>
                                                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] sm:text-[9px] font-black uppercase tracking-widest leading-none shadow-inner bg-white/80" style={{ color: color, border: `1px solid ${color}20`, backgroundColor: `${color}0A` }}>
                                                            {p.teacher || 'Unassigned'}
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
                    </div>

                    <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-100">
                      <div className="flex justify-between items-center mb-6">
                            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-1.5 sm:gap-2">
                                <ClipboardCheck className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                                Attendance Overview
                            </h2>
                      </div>
                      <div className="bg-slate-50 rounded-[24px] p-6 sm:p-8 border border-slate-100 flex flex-col items-center">
                        <div className="w-full flex items-end justify-center gap-6 sm:gap-10 h-40 sm:h-48 mt-2 mb-6">
                            {/* Present Bar */}
                            <div className="flex flex-col items-center h-full group w-12 sm:w-16">
                                <span className="text-[11px] sm:text-xs font-black text-emerald-700 bg-emerald-50 border border-emerald-100 shadow-sm px-2.5 py-1 rounded-xl z-10 mb-2 transition-transform group-hover:-translate-y-1">{attendanceStats.present}</span>
                                <div className="flex-1 w-full flex items-end bg-slate-100/50 rounded-t-2xl p-1 pb-0">
                                    <div className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-xl transition-all duration-1000 shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] group-hover:from-emerald-400 group-hover:to-emerald-300" style={{ height: `${attendanceStats.total ? Math.max((attendanceStats.present/attendanceStats.total)*100, 5) : 5}%` }}></div>
                                </div>
                                <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-widest mt-2">Present</span>
                            </div>
                            
                            {/* Absent Bar */}
                            <div className="flex flex-col items-center h-full group w-12 sm:w-16">
                                <span className="text-[11px] sm:text-xs font-black text-rose-700 bg-rose-50 border border-rose-100 shadow-sm px-2.5 py-1 rounded-xl z-10 mb-2 transition-transform group-hover:-translate-y-1">{attendanceStats.absent}</span>
                                <div className="flex-1 w-full flex items-end bg-slate-100/50 rounded-t-2xl p-1 pb-0">
                                    <div className="w-full bg-gradient-to-t from-rose-500 to-rose-400 rounded-t-xl transition-all duration-1000 shadow-[0_0_15px_rgba(244,63,94,0.3)] group-hover:shadow-[0_0_20px_rgba(244,63,94,0.5)] group-hover:from-rose-400 group-hover:to-rose-300" style={{ height: `${attendanceStats.total ? Math.max((attendanceStats.absent/attendanceStats.total)*100, 5) : 5}%` }}></div>
                                </div>
                                <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 uppercase tracking-widest mt-2">Absent</span>
                            </div>

                        </div>
                        <div className="w-full border-t border-slate-200/60 pt-4 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Overall Attendance</p>
                                <p className="text-xl sm:text-2xl font-black text-slate-900">{attendanceStats.percentage}%</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Days</p>
                                <p className="text-xl sm:text-2xl font-black text-slate-900">{attendanceStats.total}</p>
                            </div>
                        </div>
                      </div>
                      
                      {/* Upcoming Events List */}
                      <div className="mt-8">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg sm:text-xl font-bold text-slate-900">Upcoming Events</h3>
                            <button onClick={() => navigate('/calendar')} className="text-[13px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5">
                                View Calendar <ChevronRight size={16} strokeWidth={2.5} />
                            </button>
                        </div>
                        
                        <div className="space-y-3">
                            {upcomingEvents.map((evt, idx) => {
                                const dateObj = new Date(evt.date);
                                const month = dateObj.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                                const dateNum = dateObj.getDate();
                                const eventType = (evt.type || '').toLowerCase();
                                const colorClass = eventType === 'holiday' ? 'bg-rose-500' : eventType === 'event' ? 'bg-amber-500' : 'bg-blue-500';
                                
                                return (
                                    <div key={idx} onClick={() => navigate('/calendar')} className="flex items-center gap-4 bg-white p-3 rounded-[24px] shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-md transition-all border border-slate-100/60 cursor-pointer hover:-translate-y-0.5 group">
                                        <div className="bg-slate-50 w-14 h-14 sm:w-16 sm:h-16 rounded-[18px] flex flex-col items-center justify-center border border-slate-100 shrink-0 shadow-inner">
                                            <span className="text-[10px] sm:text-[11px] font-bold text-blue-600 leading-none mb-1">{month}</span>
                                            <span className="text-xl sm:text-2xl font-black text-slate-800 leading-none">{dateNum}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-[15px] sm:text-base text-slate-900 leading-tight mb-1 truncate group-hover:text-blue-600 transition-colors">{evt.title}</h4>
                                            <p className="text-xs sm:text-[13px] font-medium text-slate-500">{eventType === 'holiday' ? 'School Holiday' : 'School Event'}</p>
                                        </div>
                                        <div className="flex items-center gap-1.5 sm:gap-2 pr-2 sm:pr-4">
                                            <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${colorClass}`}></div>
                                            <span className="text-[11px] sm:text-xs font-bold text-slate-400 whitespace-nowrap">All Day</span>
                                        </div>
                                    </div>
                                );
                            })}
                            {upcomingEvents.length === 0 && (
                                <p className="text-slate-500 text-sm py-6 text-center font-medium bg-slate-50 rounded-2xl border border-slate-100 border-dashed">No upcoming events.</p>
                            )}
                        </div>
                      </div>
                    </div>
                </div>

                {/* Bottom Row - Quick Actions */}
                <div className="grid grid-cols-1 gap-6 pt-2">
                    <div className="bg-white rounded-[32px] p-6 sm:p-8 shadow-sm border border-slate-100">
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
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
