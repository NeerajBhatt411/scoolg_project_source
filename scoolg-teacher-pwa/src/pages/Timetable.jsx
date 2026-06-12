import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDays } from 'lucide-react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const JS_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const Timetable = () => {
  const today = JS_DAYS[new Date().getDay()];
  const [activeDay, setActiveDay] = useState(DAYS.includes(today) ? today : 'Monday');
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nowHM, setNowHM] = useState(() => new Date().toTimeString().slice(0, 5));

  // Keep the "now" clock fresh so the live highlight moves between periods
  useEffect(() => {
    const tick = setInterval(() => setNowHM(new Date().toTimeString().slice(0, 5)), 30000);
    return () => clearInterval(tick);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/teacher/timetable');
        setSchedule(res.data?.schedule || []);
      } catch (e) {
        console.error('Timetable load failed', e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const periods = schedule.find(d => d.dayOfWeek === activeDay)?.periods || [];

  const isLive = (p) =>
    activeDay === today &&
    !!p.startTime && !!p.endTime &&
    p.startTime <= nowHM && nowHM < p.endTime;

  return (
    <div className="min-h-full px-4 lg:px-8 pt-5 pb-32 lg:pb-10 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h1 className="font-manrope text-2xl font-bold tracking-tight">Weekly Timetable</h1>
          <p className="text-sm text-muted-foreground">Your teaching schedule for the week.</p>
        </div>
        {!loading && (
          <Badge variant="outline" className="shrink-0 mb-1 whitespace-nowrap">
            {periods.length} {periods.length === 1 ? 'period' : 'periods'}
          </Badge>
        )}
      </div>

      {/* Day tabs */}
      <Tabs value={activeDay} onValueChange={setActiveDay}>
        <TabsList className="w-full overflow-x-auto justify-start">
          {DAYS.map(day => (
            <TabsTrigger key={day} value={day}>
              <span className="inline-flex items-center gap-1.5">
                {day.substring(0, 3)}
                {day === today && activeDay !== day && (
                  <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" aria-label="Today"></span>
                )}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : periods.length === 0 ? (
        <Card>
          <CardContent className="p-10 text-center">
            <CalendarDays className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No classes on {activeDay}.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-border">
            {periods.map((p, i) => {
              const live = isLive(p);
              return (
                <div key={i} className={`flex items-center gap-4 px-4 py-3 ${live ? 'bg-primary/5' : ''}`}>
                  <div className="w-14 shrink-0">
                    <p className="text-sm font-bold text-primary leading-none">{p.startTime || '--'}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{p.endTime || ''}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{p.subject || 'Free'}</p>
                      <Badge variant="secondary" className="shrink-0">P{p.periodNumber}</Badge>
                      {live && <Badge className="animate-pulse shrink-0">NOW</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">Class {p.className}-{p.sectionName}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Timetable;
