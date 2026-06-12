import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar } from '@/components/ui/avatar';
import {
  CalendarDays, Clock, Users, ChevronRight, ClipboardCheck,
  NotebookPen, CalendarCheck, Star, GraduationCap,
} from 'lucide-react';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const EVENT_CATEGORIES = {
  'Holiday': { color: '#e11d48', bg: '#fff1f2' },
  'Annual Function': { color: '#7c3aed', bg: '#f5f3ff' },
  'Sports Day': { color: '#059669', bg: '#ecfdf5' },
  'Exam': { color: '#d97706', bg: '#fffbeb' },
  'Meeting': { color: '#2563eb', bg: '#eff6ff' },
  'Event': { color: '#0891b2', bg: '#ecfeff' },
  'Other': { color: '#64748b', bg: '#f1f5f9' },
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
    { label: 'Periods Today', value: todayPeriods.length, icon: CalendarDays },
    { label: 'Classes / Week', value: weekCount, icon: Clock },
    { label: 'My Classes', value: classCount, icon: Users },
  ];

  const actions = [
    { name: 'Take Attendance', sub: 'Mark today', icon: ClipboardCheck, path: '/attendance' },
    { name: 'Assign Homework', sub: 'New task', icon: NotebookPen, path: '/homework' },
    { name: 'My Timetable', sub: 'Full week', icon: CalendarDays, path: '/timetable' },
    { name: 'My Classes', sub: `${classCount} sections`, icon: Users, path: '/classes' },
  ];

  return (
    <div className="min-h-full px-4 lg:px-8 pt-5 pb-32 lg:pb-10 space-y-5 max-w-5xl mx-auto">
      {/* Greeting */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar src={avatar} alt={teacher?.fullName || 'Teacher'} className="h-11 w-11">
            {(teacher?.fullName || 'T').charAt(0)}
          </Avatar>
          <div className="min-w-0">
            <h1 className="font-manrope text-2xl font-bold tracking-tight truncate">
              {greeting}, {teacher?.fullName || 'Teacher'}
            </h1>
            <p className="text-sm text-muted-foreground">{dateStr}</p>
          </div>
        </div>
        <Badge variant="outline" className="hidden sm:inline-flex shrink-0 gap-1.5 py-1.5 px-3">
          <GraduationCap className="h-3.5 w-3.5 text-primary" />
          <span className="max-w-[180px] truncate">{school?.name || 'My School'}</span>
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground truncate">{s.label}</CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{s.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Schedule + side column */}
      <div className="lg:grid lg:grid-cols-3 lg:gap-5 space-y-5 lg:space-y-0">
        {/* Today's Schedule */}
        <Card className="lg:col-span-2 h-fit">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div className="space-y-1">
              <CardTitle>Today's Schedule</CardTitle>
              <CardDescription>{dateStr}</CardDescription>
            </div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/timetable')}>
              View week
              <ChevronRight className="h-4 w-4" />
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-10 w-14 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-2/5" />
                      <Skeleton className="h-3 w-1/4" />
                    </div>
                  </div>
                ))}
              </div>
            ) : todayPeriods.length === 0 ? (
              <div className="py-10 text-center">
                <CalendarCheck className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-3 text-sm font-semibold">No periods today</p>
                <p className="mt-1 text-xs text-muted-foreground">Enjoy your day off from teaching.</p>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {todayPeriods.map((p, i) => (
                  <div key={i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="w-14 text-center shrink-0">
                      <p className="text-sm font-bold text-primary leading-tight">{p.startTime || '--'}</p>
                      <p className="text-[10px] text-muted-foreground">P{p.periodNumber}</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{p.subject || 'Free Period'}</p>
                      <p className="text-xs text-muted-foreground">
                        Class {p.className}-{p.sectionName}{p.endTime ? ` · ends ${p.endTime}` : ''}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Side column */}
        <div className="space-y-5">
          {/* Quick actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 lg:grid-cols-1 gap-3">
              {actions.map((a) => {
                const Icon = a.icon;
                return (
                  <Button
                    key={a.path}
                    variant="outline"
                    onClick={() => navigate(a.path)}
                    className="h-auto justify-start gap-3 p-4"
                  >
                    <span className="h-9 w-9 rounded-md bg-primary/10 text-primary grid place-items-center shrink-0">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="min-w-0 text-left">
                      <span className="block text-sm font-semibold truncate">{a.name}</span>
                      <span className="block text-xs font-normal text-muted-foreground truncate">{a.sub}</span>
                    </span>
                  </Button>
                );
              })}
            </CardContent>
          </Card>

          {/* My classes */}
          {myClasses.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>My Classes</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-2">
                {myClasses.map((c) => (
                  <Badge
                    key={c.sectionId}
                    variant="secondary"
                    className="cursor-pointer py-1.5 px-3"
                    onClick={() => navigate('/classes')}
                  >
                    {c.className}-{c.sectionName}
                    {c.isClassTeacher && <Star className="h-3 w-3 text-amber-500 fill-amber-500" />}
                  </Badge>
                ))}
              </CardContent>
            </Card>
          )}

          {/* Upcoming events */}
          {events.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Upcoming Events</CardTitle>
              </CardHeader>
              <CardContent className="divide-y divide-border">
                {events.map((ev, i) => {
                  const cat = EVENT_CATEGORIES[ev.category] || EVENT_CATEGORIES['Other'];
                  return (
                    <div key={ev._id || i} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                      <span className="h-9 w-9 rounded-md grid place-items-center shrink-0" style={{ background: cat.bg }}>
                        <span className="h-2.5 w-2.5 rounded-full" style={{ background: cat.color }} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate">{ev.title}</p>
                        <p className="text-xs text-muted-foreground">{ev.category}</p>
                      </div>
                      <Badge variant="outline" className="shrink-0">{eventDayLabel(ev.date)}</Badge>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Week at a glance */}
      {!loading && weekDays.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>This Week at a Glance</CardTitle>
            <CardDescription>Periods per day across your timetable.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end justify-between gap-2 sm:gap-4 h-36">
              {weekDays.map((d) => {
                const max = Math.max(...weekDays.map(x => x.count), 1);
                const pct = Math.round((d.count / max) * 100);
                const isToday = d.day === todayName;
                return (
                  <div key={d.day} className="flex-1 flex flex-col items-center justify-end gap-1.5 h-full">
                    <span className="text-xs font-semibold">{d.count}</span>
                    <div
                      className={`w-full max-w-[40px] rounded-md ${isToday ? 'bg-primary' : 'bg-muted'}`}
                      style={{ height: `${Math.max(pct, 6)}%` }}
                    ></div>
                    <span className={`text-xs ${isToday ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                      {d.day.substring(0, 3)}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
