import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const EVENT_CATEGORIES = {
  'Holiday': { icon: 'beach_access', color: '#e11d48', bg: '#fff1f2' },
  'Annual Function': { icon: 'celebration', color: '#7c3aed', bg: '#f5f3ff' },
  'Sports Day': { icon: 'sports_soccer', color: '#059669', bg: '#ecfdf5' },
  'Exam': { icon: 'history_edu', color: '#d97706', bg: '#fffbeb' },
  'Meeting': { icon: 'groups', color: '#2563eb', bg: '#eff6ff' },
  'Event': { icon: 'event', color: '#0891b2', bg: '#ecfeff' },
  'Other': { icon: 'push_pin', color: '#64748b', bg: '#f1f5f9' },
};

const eventDayLabel = (dateStr) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr);
  d.setHours(0, 0, 0, 0);
  const diff = Math.round((d - today) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Tomorrow';
  if (diff > 1 && diff < 7) return `In ${diff} days`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
};

const Dashboard = () => {
  const { teacher, school } = useAuth();
  const navigate = useNavigate();
  const [todayPeriods, setTodayPeriods] = useState([]);
  const [weekCount, setWeekCount] = useState(0);
  const [classCount, setClassCount] = useState(0);
  const [weekDays, setWeekDays] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const todayName = DAYS[now.getDay()];
  const dateStr = `${todayName}, ${now.getDate()} ${MONTHS[now.getMonth()]} ${now.getFullYear()}`;
  const avatar = teacher?.profileImageUrl || `https://api.dicebear.com/7.x/initials/svg?seed=${teacher?.fullName || 'T'}`;
  const hour = now.getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  useEffect(() => {
    const load = async () => {
      try {
        const [ttRes, clsRes, evRes] = await Promise.all([
          api.get('/teacher/timetable'),
          api.get('/teacher/my-classes'),
          api.get('/teacher/events?limit=5').catch(() => ({ data: [] })),
        ]);
        const sched = ttRes.data?.schedule || [];
        setTodayPeriods((sched.find(d => d.dayOfWeek === todayName)?.periods) || []);
        setWeekCount(sched.reduce((sum, d) => sum + (d.periods?.length || 0), 0));
        setWeekDays(sched.map(d => ({ day: d.dayOfWeek, count: d.periods?.length || 0 })));
        const cls = Array.isArray(clsRes.data) ? clsRes.data : [];
        setClassCount(cls.length);
        setMyClasses(cls);
        setEvents(Array.isArray(evRes.data) ? evRes.data : []);
      } catch (e) {
        console.error('Dashboard load failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [todayName]);

  const stats = [
    { label: 'Periods Today', value: todayPeriods.length, icon: 'today' },
    { label: 'Classes / Week', value: weekCount, icon: 'date_range' },
    { label: 'My Classes', value: classCount, icon: 'groups' },
  ];

  const actions = [
    { name: 'Take Attendance', sub: 'Mark today', icon: 'fact_check', path: '/attendance' },
    { name: 'Assign Homework', sub: 'New task', icon: 'assignment', path: '/homework' },
    { name: 'My Timetable', sub: 'Full week', icon: 'calendar_today', path: '/timetable' },
    { name: 'My Classes', sub: `${classCount} sections`, icon: 'groups', path: '/classes' },
  ];

  return (
    <div className="min-h-full px-container-margin lg:px-8 pt-5 pb-32 lg:pb-10 max-w-6xl mx-auto">
      {/* HERO — light, clean */}
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/5 rounded-full blur-3xl -mr-10 -mt-10"></div>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="relative shrink-0">
              <img src={avatar} alt="" className="w-16 h-16 rounded-[20px] object-cover ring-2 ring-blue-600/15 bg-slate-50 border border-slate-100" />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white"></span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">{greeting} 👋</p>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight truncate">{teacher?.fullName || 'Teacher'}</h2>
              <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5 mt-0.5">
                <span className="material-symbols-outlined text-[15px]">calendar_month</span> {dateStr}
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-2.5 bg-slate-50 rounded-[20px] px-3.5 py-2.5 border border-slate-100">
            <div className="w-9 h-9 rounded-[14px] overflow-hidden bg-white border border-slate-100 flex items-center justify-center shrink-0">
              {school?.logo ? <img src={school.logo} alt="" className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-blue-600 text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>}
            </div>
            <div className="pr-1 max-w-[160px]">
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">School</p>
              <p className="text-xs font-black text-slate-900 leading-tight truncate">{school?.name || 'My School'}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3 mt-5">
        {stats.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 * i }}
            className="bg-white p-4 sm:p-6 rounded-[28px] sm:rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.1)] transition-all duration-500 flex items-start justify-between border border-slate-50 group">
            <div className="min-w-0">
              <p className="text-slate-400 text-[11px] uppercase font-bold tracking-widest mb-1 leading-tight">{s.label}</p>
              <p className="text-3xl font-black text-slate-900 tracking-tighter">{s.value}</p>
            </div>
            <div className="hidden sm:block p-3 sm:p-4 bg-slate-50 text-slate-900 rounded-[18px] sm:rounded-[20px] group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-slate-100 shrink-0">
              <span className="material-symbols-outlined text-2xl sm:text-3xl">{s.icon}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* DESKTOP 2-COLUMN / MOBILE STACK */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-6 mt-6 space-y-6 lg:space-y-0">
        {/* LEFT: Today schedule */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4 px-1">
            <h5 className="text-xl text-slate-900 font-black flex items-center gap-3 tracking-tight"><span className="w-1.5 h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></span>Today's Schedule</h5>
            <button onClick={() => navigate('/timetable')} className="text-[11px] font-black text-blue-600 uppercase tracking-widest hover:underline">View week</button>
          </div>
          {loading ? (
            <div className="space-y-3">
              <div className="animate-pulse bg-slate-100 rounded-[20px] h-20"></div>
              <div className="animate-pulse bg-slate-100 rounded-[20px] h-20"></div>
              <div className="animate-pulse bg-slate-100 rounded-[20px] h-20"></div>
            </div>
          ) : todayPeriods.length === 0 ? (
            <div className="border-2 border-dashed border-slate-200 rounded-[28px] p-10 text-center bg-slate-50/50">
              <div className="w-16 h-16 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center mx-auto mb-3">
                <span className="material-symbols-outlined text-[32px] text-blue-500" style={{ fontVariationSettings: "'FILL' 1" }}>event_available</span>
              </div>
              <p className="font-bold text-slate-700">No periods today</p>
              <p className="text-sm text-slate-500 mt-1">Enjoy your day off from teaching 🎉</p>
            </div>
          ) : (
            <div className="bg-white p-2 sm:p-4 rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
              {todayPeriods.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-[20px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                  <div className="flex flex-col items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-[16px] bg-blue-50 text-blue-600 border border-slate-100 shadow-sm shrink-0">
                    <span className="text-[11px] font-black leading-none">{p.startTime || '--'}</span>
                    <span className="text-[8px] font-bold text-blue-400 mt-1 uppercase tracking-wider">Period {p.periodNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 text-sm tracking-tight truncate">{p.subject || 'Free Period'}</p>
                    <p className="text-[11px] font-bold text-slate-400 mt-0.5">Class {p.className}-{p.sectionName}{p.endTime ? ` · ends ${p.endTime}` : ''}</p>
                  </div>
                  <span className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                    <span className="material-symbols-outlined text-[18px]">chevron_right</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Quick actions */}
        <div className="lg:col-span-1">
          <h5 className="text-xl text-slate-900 font-black flex items-center gap-3 tracking-tight mb-4 px-1"><span className="w-1.5 h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></span>Quick Actions</h5>
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {actions.map((a, i) => (
              <motion.button key={a.path} onClick={() => navigate(a.path)}
                initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.05 * i }}
                className="bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.15)] text-slate-900 font-black py-5 px-5 rounded-[28px] flex flex-col lg:flex-row lg:items-center gap-4 text-left transition-all duration-500 group cursor-pointer active:scale-95">
                <div className="w-12 h-12 bg-slate-50 text-slate-900 rounded-[18px] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-slate-100 shrink-0">
                  <span className="material-symbols-outlined text-2xl" style={{ fontVariationSettings: "'FILL' 1" }}>{a.icon}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-black text-slate-900 text-sm tracking-tight leading-tight truncate">{a.name}</p>
                  <p className="text-[11px] font-bold text-slate-400">{a.sub}</p>
                </div>
              </motion.button>
            ))}
          </div>

          {/* My classes chips */}
          {myClasses.length > 0 && (
            <div className="mt-6">
              <h5 className="text-xl text-slate-900 font-black flex items-center gap-3 tracking-tight mb-4 px-1"><span className="w-1.5 h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></span>My Classes</h5>
              <div className="flex flex-wrap gap-2">
                {myClasses.map((c) => (
                  <button key={c.sectionId} onClick={() => navigate('/classes')}
                    className="flex items-center gap-2 bg-white border border-slate-100 rounded-full pl-2 pr-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:border-blue-200 hover:shadow-[0_20px_40px_rgba(37,99,235,0.12)] active:scale-95 transition-all duration-300">
                    <span className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xs font-black">{c.className}</span>
                    <span className="text-xs font-black text-slate-900 tracking-tight">{c.className}-{c.sectionName}</span>
                    {c.isClassTeacher && <span className="material-symbols-outlined text-[16px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }} title="Class Teacher">star</span>}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming events */}
          {events.length > 0 && (
            <div className="mt-6">
              <h5 className="text-xl text-slate-900 font-black flex items-center gap-3 tracking-tight mb-4 px-1"><span className="w-1.5 h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></span>Upcoming Events</h5>
              <div className="bg-white p-2 sm:p-3 rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
                {events.map((ev, i) => {
                  const cat = EVENT_CATEGORIES[ev.category] || EVENT_CATEGORIES['Other'];
                  return (
                    <div key={ev._id || i} className="flex items-center gap-4 p-4 rounded-[20px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[16px] flex items-center justify-center border border-slate-100 shadow-sm shrink-0" style={{ background: cat.bg, color: cat.color }}>
                        <span className="material-symbols-outlined text-[22px]" style={{ fontVariationSettings: "'FILL' 1" }}>{cat.icon}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-900 text-sm tracking-tight truncate">{ev.title}</p>
                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">{ev.category}</p>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">{eventDayLabel(ev.date)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* WEEKLY OVERVIEW */}
      {!loading && weekDays.length > 0 && (
        <div className="mt-6">
          <h5 className="text-xl text-slate-900 font-black flex items-center gap-3 tracking-tight mb-4 px-1"><span className="w-1.5 h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.3)]"></span>This Week at a Glance</h5>
          <div className="bg-white p-5 sm:p-8 rounded-[28px] sm:rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
            <div className="flex items-end justify-between gap-2 sm:gap-4 h-40">
              {weekDays.map((d) => {
                const max = Math.max(...weekDays.map(x => x.count), 1);
                const pct = Math.round((d.count / max) * 100);
                const isToday = d.day === todayName;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
                    <span className="text-xs font-black text-slate-900 tracking-tight">{d.count}</span>
                    <div className={`w-full max-w-[40px] rounded-t-xl rounded-b-md transition-all duration-500 ${isToday ? '' : 'bg-slate-100'}`}
                      style={{
                        height: `${Math.max(pct, 6)}%`,
                        background: isToday ? 'linear-gradient(to top,#2563eb,#6366f1)' : undefined
                      }}></div>
                    <span className={`text-[11px] font-bold ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{d.day.substring(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
