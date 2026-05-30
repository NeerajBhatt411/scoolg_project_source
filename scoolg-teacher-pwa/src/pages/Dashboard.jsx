import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Dashboard = () => {
  const { teacher, school } = useAuth();
  const navigate = useNavigate();
  const [todayPeriods, setTodayPeriods] = useState([]);
  const [weekCount, setWeekCount] = useState(0);
  const [classCount, setClassCount] = useState(0);
  const [weekDays, setWeekDays] = useState([]);
  const [myClasses, setMyClasses] = useState([]);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const todayName = DAYS[now.getDay()];

  useEffect(() => {
    const load = async () => {
      try {
        const [ttRes, clsRes] = await Promise.all([
          api.get('/teacher/timetable'),
          api.get('/teacher/my-classes'),
        ]);
        const sched = ttRes.data?.schedule || [];
        setTodayPeriods((sched.find(d => d.dayOfWeek === todayName)?.periods) || []);
        setWeekCount(sched.reduce((sum, d) => sum + (d.periods?.length || 0), 0));
        setWeekDays(sched.map(d => ({ day: d.dayOfWeek, count: d.periods?.length || 0 })));
        const cls = Array.isArray(clsRes.data) ? clsRes.data : [];
        setClassCount(cls.length);
        setMyClasses(cls);
      } catch (e) {
        console.error('Dashboard load failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [todayName]);

  const Shimmer = () => <div className="h-8 w-16 bg-slate-200 animate-pulse rounded-lg mt-1"></div>;

  const stats = [
    { label: 'Periods Today', value: todayPeriods.length, icon: 'today', tag: 'Schedule' },
    { label: 'Classes / Week', value: weekCount, icon: 'date_range', tag: 'Weekly' },
    { label: 'My Classes', value: classCount, icon: 'groups', tag: 'Teaching' },
  ];

  const actions = [
    { name: 'Take Attendance', icon: 'fact_check', path: '/attendance' },
    { name: 'Assign Homework', icon: 'assignment', path: '/homework' },
    { name: 'My Timetable', icon: 'event_note', path: '/timetable' },
    { name: 'My Classes', icon: 'groups', path: '/classes' },
  ];

  const SectionTitle = ({ children }) => (
    <h5 className="text-xl text-slate-900 font-black flex items-center gap-3 tracking-tight">
      <span className="w-1.5 h-7 bg-blue-600 rounded-full shadow-[0_0_15px_rgba(37,99,235,0.4)]"></span>
      {children}
    </h5>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 sm:p-8 pb-32 lg:pb-10 space-y-8 max-w-full">
      {/* Welcome */}
      <section className="flex flex-col gap-2">
        <h3 className="text-[20px] sm:text-[28px] font-[800] text-slate-900 tracking-tight leading-tight">
          Welcome back, {teacher?.fullName?.split(' ')[0] || 'Teacher'}!
        </h3>
        <p className="text-slate-500 font-medium text-xs sm:text-sm">{todayName} · Here's your snapshot for today.</p>
      </section>

      {/* Stat Cards Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white p-4 sm:p-6 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.05)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.1)] transition-all duration-500 flex items-start justify-between border border-slate-50 group">
            <div>
              <p className="text-slate-500 text-[11px] uppercase font-bold tracking-widest mb-1">{s.label}</p>
              {loading ? <Shimmer /> : <h4 className="text-3xl font-black text-slate-900 tracking-tighter">{s.value}</h4>}
              <div className="flex items-center gap-2 mt-2 text-slate-400 font-black text-[10px] uppercase tracking-widest group-hover:text-blue-600 transition-colors">
                <span className="w-1 h-1 rounded-full bg-slate-300 group-hover:bg-blue-600"></span>
                <span>{s.tag}</span>
              </div>
            </div>
            <div className="p-4 bg-slate-50 text-slate-900 rounded-[20px] group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-[0_10px_20px_rgba(37,99,235,0.2)] transition-all duration-500 border border-slate-100">
              <span className="material-symbols-outlined text-3xl">{s.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-slate-100/50 py-10 px-0 rounded-[48px] border-2 border-slate-200/40 shadow-[inset_0_4px_12px_rgba(0,0,0,0.05)]">
        <div className="mb-8 px-6 sm:px-8"><SectionTitle>Quick Actions</SectionTitle></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 px-4 sm:px-6">
          {actions.map((a) => (
            <button key={a.path} onClick={() => navigate(a.path)} className="bg-white border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_40px_80px_rgba(37,99,235,0.15)] text-slate-900 font-black py-8 px-6 rounded-[36px] flex items-center gap-5 transition-all duration-500 group active:scale-95">
              <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-[22px] flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-slate-100 shadow-sm">
                <span className="material-symbols-outlined text-[26px]">{a.icon}</span>
              </div>
              <span className="text-sm font-black tracking-tight text-left">{a.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Today + Weekly */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Today's Schedule */}
        <div className="bg-white p-6 sm:p-8 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
          <div className="flex justify-between items-center mb-8">
            <SectionTitle>Today's Schedule</SectionTitle>
            <button onClick={() => navigate('/timetable')} className="text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-blue-600 transition-all">View week</button>
          </div>
          {loading ? (
            <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 animate-pulse rounded-2xl"></div>)}</div>
          ) : todayPeriods.length === 0 ? (
            <div className="text-center py-10">
              <div className="w-16 h-16 rounded-[20px] bg-slate-50 flex items-center justify-center mx-auto mb-3 border border-slate-100">
                <span className="material-symbols-outlined text-3xl text-slate-300">event_available</span>
              </div>
              <p className="text-slate-900 font-black text-sm">No periods today</p>
              <p className="text-slate-400 text-xs font-medium mt-1">Enjoy your day off 🎉</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayPeriods.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-[24px] hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 group">
                  <div className="w-14 h-14 bg-slate-50 text-slate-900 rounded-[18px] flex flex-col items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border border-slate-100 shrink-0">
                    <span className="text-[11px] font-black leading-none">{p.startTime || '--'}</span>
                    <span className="text-[8px] font-bold uppercase mt-1 opacity-70">P{p.periodNumber}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h6 className="font-bold text-slate-900 text-sm tracking-tight truncate">{p.subject || 'Free Period'}</h6>
                    <p className="text-slate-500 text-[11px] font-medium mt-0.5">Class {p.className}-{p.sectionName}</p>
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{p.endTime || ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Weekly Overview */}
        <div className="bg-white p-6 sm:p-8 rounded-[36px] shadow-[0_20px_50px_rgba(0,0,0,0.03)] border border-slate-50">
          <div className="mb-8"><SectionTitle>This Week</SectionTitle></div>
          {loading ? (
            <div className="h-40 bg-slate-100 animate-pulse rounded-2xl"></div>
          ) : weekDays.length === 0 ? (
            <p className="text-slate-400 text-sm font-medium text-center py-10">No schedule yet.</p>
          ) : (
            <div className="flex items-end justify-between gap-2 sm:gap-3 h-44">
              {weekDays.map((d) => {
                const max = Math.max(...weekDays.map(x => x.count), 1);
                const pct = Math.round((d.count / max) * 100);
                const isToday = d.day === todayName;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
                    <span className="text-xs font-black text-slate-900">{d.count}</span>
                    <div className={`w-full max-w-[36px] rounded-t-xl rounded-b-md transition-all duration-700 ${isToday ? 'bg-blue-600 shadow-[0_6px_16px_rgba(37,99,235,0.35)]' : 'bg-slate-100'}`}
                      style={{ height: `${Math.max(pct, 8)}%` }}></div>
                    <span className={`text-[10px] font-black uppercase tracking-wider ${isToday ? 'text-blue-600' : 'text-slate-400'}`}>{d.day.substring(0, 3)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* My Classes */}
      {myClasses.length > 0 && (
        <div>
          <div className="mb-5"><SectionTitle>My Classes</SectionTitle></div>
          <div className="flex flex-wrap gap-3">
            {myClasses.map((c) => (
              <button key={c.sectionId} onClick={() => navigate('/classes')}
                className="flex items-center gap-3 bg-white border border-slate-100 rounded-[24px] pl-3 pr-5 py-3 shadow-[0_10px_30px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.12)] transition-all duration-500 group active:scale-95">
                <span className="w-11 h-11 rounded-[16px] bg-slate-50 text-slate-900 group-hover:bg-blue-600 group-hover:text-white flex items-center justify-center font-black border border-slate-100 transition-all duration-500">{c.className}</span>
                <span className="text-sm font-black text-slate-900 tracking-tight">{c.className}-{c.sectionName}</span>
                {c.isClassTeacher && <span className="material-symbols-outlined text-[18px] text-amber-500" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
