import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Card, Chip, Button, Icon, Empty, toneFor, fmt12, toMin, nowMinutes, periodState } from '@/components/designkit';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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

// ---- Stats ----
function StatTile({ value, label }) {
  return (
    <Card className="px-2 py-5 flex flex-col items-center text-center shadow-card">
      <p className="font-800 text-ink text-[28px] leading-none tnum tracking-[-0.02em]">{value}</p>
      <p className="text-[11px] font-600 text-ink-soft mt-2 leading-tight">{label}</p>
    </Card>
  );
}

function StatCard({ icon, label, value }) {
  return (
    <Card className="p-4 shadow-card hover:shadow-card-lg transition-shadow flex items-center gap-3">
      <div className="w-11 h-11 rounded-xl grid place-items-center shrink-0" style={{ background: '#EFF4FF', color: '#2563EB' }}>
        <Icon name={icon} size={21} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="font-800 text-ink text-[24px] leading-none tnum tracking-[-0.01em]">{value}</p>
        <p className="text-[12px] font-600 text-ink-soft mt-1.5 leading-tight">{label}</p>
      </div>
    </Card>
  );
}

// ---- Up next / live now ----
function UpNext({ periods, nowMin, onAttendance, onTimetable }) {
  const live = periods.find(p => periodState(p, nowMin) === 'live');
  const next = periods.find(p => periodState(p, nowMin) === 'upcoming');
  const p = live || next;
  if (!p) {
    return (
      <Card className="p-5 flex items-center gap-3.5 shadow-card">
        <div className="w-11 h-11 rounded-xl bg-blue-50 grid place-items-center text-blue-600"><Icon name="coffee" size={22} /></div>
        <div>
          <p className="font-700 text-ink text-[15px]">No more classes today</p>
          <p className="text-ink-soft text-[13px]">You're all done — enjoy the rest of your day.</p>
        </div>
      </Card>
    );
  }
  const isLive = !!live;
  const t = toneFor(p.subject);
  const mins = isLive ? toMin(p.endTime) - nowMin : toMin(p.startTime) - nowMin;
  return (
    <Card className="shadow-card overflow-hidden flex">
      <div className="w-1.5 shrink-0" style={{ background: t.dot }}></div>
      <div className="flex-1 p-5 min-w-0">
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-700 tracking-[0.08em] uppercase" style={{ color: isLive ? '#2563EB' : '#5C6573' }}>
            {isLive ? <span className="w-2 h-2 rounded-full bg-blue-600 now-dot"></span> : <Icon name="clock" size={14} strokeWidth={2.25} />}
            {isLive ? 'Live now' : 'Up next'}
          </span>
          <Chip tone="blue">{isLive ? `${mins} min left` : `in ${mins} min`}</Chip>
        </div>
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h3 className="font-700 text-ink text-[21px] leading-tight tracking-[-0.01em] truncate">{p.subject || 'Free Period'}</h3>
            <p className="text-ink-soft text-[13px] mt-1 tnum flex items-center gap-2 flex-wrap">
              <span>Class {p.className}-{p.sectionName}</span><span className="text-line">•</span>
              <span>{fmt12(p.startTime)}–{fmt12(p.endTime)}</span>
            </p>
          </div>
        </div>
        <div className="mt-4 flex flex-col lg:flex-row gap-2.5">
          <Button onClick={() => onAttendance(p)} icon="clipboard-check" className="w-full lg:flex-1">Take attendance</Button>
          <Button variant="outline" onClick={onTimetable} icon="calendar-days" className="w-full lg:w-auto">Schedule</Button>
        </div>
      </div>
    </Card>
  );
}

// ---- Today's schedule ----
function ScheduleList({ periods, nowMin, onAttendance, onTimetable }) {
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 h-[52px] border-b border-line">
        <p className="font-700 text-ink text-[14.5px]">Today's Schedule</p>
        <button onClick={onTimetable} className="text-[12.5px] font-600 text-blue-600 hover:text-blue-700">View week</button>
      </div>
      {periods.length === 0
        ? <Empty icon="coffee" title="No periods today" sub="Enjoy the day off from teaching." />
        : periods.map((p, i) => {
          const st = periodState(p, nowMin);
          const t = toneFor(p.subject);
          return (
            <button key={i} onClick={() => onAttendance(p)} className={`w-full flex items-center gap-3.5 px-5 py-3.5 text-left hover:bg-line-soft/70 transition-colors ${i ? 'border-t border-line' : ''}`}>
              <div className="w-[60px] shrink-0">
                <p className="text-[13px] font-700 text-ink tnum leading-none">{fmt12(p.startTime).replace(' ', '')}</p>
                <p className="text-[11px] text-ink-faint mt-1 tnum">{fmt12(p.endTime).replace(' ', '')}</p>
              </div>
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: t.dot }}></span>
              <div className="flex-1 min-w-0">
                <p className="font-600 text-ink text-[14.5px] truncate">{p.subject || 'Free Period'}</p>
                <p className="text-ink-soft text-[12.5px] tnum">Class {p.className}-{p.sectionName}</p>
              </div>
              {st === 'live' && <Chip tone="blue">Now</Chip>}
              {st === 'done' && <Icon name="check-circle" size={17} className="text-blue-600" />}
              <Icon name="chevron-right" size={18} className="text-ink-faint shrink-0" />
            </button>
          );
        })}
    </Card>
  );
}

// ---- Quick actions ----
function QuickActions({ classCount, navigate }) {
  const actions = [
    { name: 'Take attendance', sub: 'Mark today’s register', icon: 'clipboard-check', path: '/attendance' },
    { name: 'Assign homework', sub: 'Create a new task', icon: 'book-open', path: '/homework' },
    { name: 'View timetable', sub: 'Your full week', icon: 'calendar-days', path: '/timetable' },
    { name: 'My classes', sub: `${classCount} sections`, icon: 'users', path: '/classes' },
  ];
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="px-5 h-[52px] flex items-center border-b border-line"><p className="font-700 text-ink text-[14.5px]">Quick actions</p></div>
      {actions.map((a, i) => (
        <button key={a.path} onClick={() => navigate(a.path)} className={`w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-line-soft/70 transition-colors ${i ? 'border-t border-line' : ''}`}>
          <div className="w-9 h-9 rounded-lg grid place-items-center shrink-0 bg-blue-50 text-blue-600"><Icon name={a.icon} size={18} strokeWidth={2} /></div>
          <div className="flex-1 min-w-0">
            <p className="font-600 text-ink text-[14px] leading-tight">{a.name}</p>
            <p className="text-ink-faint text-[12px]">{a.sub}</p>
          </div>
          <Icon name="chevron-right" size={18} className="text-ink-faint" />
        </button>
      ))}
    </Card>
  );
}

// ---- Week at a glance ----
function WeekGlance({ days, todayName, total }) {
  const max = Math.max(...days.map(d => d.count), 1);
  return (
    <Card className="shadow-card p-5">
      <div className="flex items-center justify-between mb-4">
        <p className="font-700 text-ink text-[14.5px]">This week</p>
        <Chip tone="soft">{total} periods</Chip>
      </div>
      <div className="flex items-end justify-between gap-2 h-24">
        {days.map(d => {
          const isToday = d.day === todayName;
          return (
            <div key={d.day} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className={`text-[11px] font-700 tnum ${isToday ? 'text-blue-700' : 'text-ink-faint'}`}>{d.count}</span>
              <div className="w-full max-w-[30px] rounded-md transition-all duration-700" style={{ height: `${Math.max((d.count / max) * 100, 8)}%`, background: isToday ? '#2563EB' : '#DBE6FE' }}></div>
              <span className={`text-[10.5px] font-600 ${isToday ? 'text-blue-700' : 'text-ink-faint'}`}>{d.day.slice(0, 1)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

// ---- Upcoming events ----
function UpcomingEvents({ events }) {
  return (
    <Card className="shadow-card overflow-hidden">
      <div className="px-5 h-[52px] flex items-center border-b border-line"><p className="font-700 text-ink text-[14.5px]">Upcoming events</p></div>
      {events.map((ev, i) => (
        <div key={ev._id || i} className={`flex items-center gap-3 px-5 py-3.5 ${i ? 'border-t border-line' : ''}`}>
          <div className="w-9 h-9 rounded-lg grid place-items-center shrink-0 bg-blue-50 text-blue-600"><Icon name="calendar-days" size={18} strokeWidth={2} /></div>
          <div className="flex-1 min-w-0">
            <p className="font-600 text-ink text-[14px] leading-tight truncate">{ev.title}</p>
            <p className="text-ink-faint text-[12px]">{ev.category}</p>
          </div>
          <span className="text-[11px] font-700 text-ink-faint uppercase tracking-[0.04em] shrink-0">{eventDayLabel(ev.date)}</span>
        </div>
      ))}
    </Card>
  );
}

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
  const [nowMin, setNowMin] = useState(nowMinutes());

  const todayName = DAYS[new Date().getDay()];
  const firstName = teacher?.fullName?.split(' ')[0] || 'Teacher';
  const hour = Math.floor(nowMin / 60);
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Keep "Live now" / "in X min" fresh.
  useEffect(() => {
    const id = setInterval(() => setNowMin(nowMinutes()), 30000);
    return () => clearInterval(id);
  }, []);

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

  // Navigate to attendance with the period's class prefilled (full class object when known).
  const goAttendance = (p) => {
    const match = myClasses.find(c => String(c.className) === String(p.className) && String(c.sectionName) === String(p.sectionName));
    navigate('/attendance', { state: match || { className: p.className, sectionName: p.sectionName } });
  };
  const goTimetable = () => navigate('/timetable');

  return (
    <div className="p-4 pb-32 lg:p-6 lg:pb-10 max-w-[1200px] mx-auto space-y-5 fade-up">
      {/* Greeting */}
      <div>
        <h1 className="font-700 text-ink tracking-[-0.02em] leading-tight text-[22px] lg:text-[26px]">{greeting}, {firstName}</h1>
        <p className="text-ink-soft text-[13.5px] mt-1">Here's what's happening at {school?.name || 'your school'} today.</p>
      </div>

      {loading ? (
        <>
          <div className="grid grid-cols-3 gap-2.5 lg:gap-4">
            {[0, 1, 2].map(i => <div key={i} className="h-[88px] animate-pulse bg-line-soft rounded-2xl" />)}
          </div>
          <div className="lg:grid lg:grid-cols-3 lg:gap-5 lg:items-start space-y-5 lg:space-y-0">
            <div className="lg:col-span-2 space-y-5">
              <div className="h-44 animate-pulse bg-line-soft rounded-2xl" />
              <div className="h-64 animate-pulse bg-line-soft rounded-2xl" />
            </div>
            <div className="space-y-5">
              <div className="h-56 animate-pulse bg-line-soft rounded-2xl" />
              <div className="h-44 animate-pulse bg-line-soft rounded-2xl" />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Stats — mobile tiles */}
          <div className="grid grid-cols-3 gap-2.5 lg:hidden">
            <StatTile value={todayPeriods.length} label="Periods today" />
            <StatTile value={weekCount} label="Classes this week" />
            <StatTile value={classCount} label="My classes" />
          </div>
          {/* Stats — desktop cards */}
          <div className="hidden lg:grid grid-cols-3 gap-4">
            <StatCard icon="calendar-days" label="Periods today" value={todayPeriods.length} />
            <StatCard icon="calendar-range" label="Classes this week" value={weekCount} />
            <StatCard icon="users" label="My classes" value={classCount} />
          </div>

          <div className="lg:grid lg:grid-cols-3 lg:gap-5 lg:items-start space-y-5 lg:space-y-0">
            <div className="lg:col-span-2 space-y-5">
              {todayPeriods.length > 0 && (
                <UpNext periods={todayPeriods} nowMin={nowMin} onAttendance={goAttendance} onTimetable={goTimetable} />
              )}
              <ScheduleList periods={todayPeriods} nowMin={nowMin} onAttendance={goAttendance} onTimetable={goTimetable} />
              {events.length > 0 && <UpcomingEvents events={events} />}
            </div>
            <div className="space-y-5">
              <QuickActions classCount={classCount} navigate={navigate} />
              {weekDays.length > 0 && <WeekGlance days={weekDays} todayName={todayName} total={weekCount} />}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
