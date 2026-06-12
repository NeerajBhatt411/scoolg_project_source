import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const JS_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const subjectTone = (subject) => {
  const s = (subject || '').toLowerCase();
  if (s.includes('math')) return 'bg-blue-50 text-blue-700 border-blue-100';
  if (s.includes('sci') || s.includes('phys') || s.includes('chem')) return 'bg-teal-50 text-teal-700 border-teal-100';
  if (s.includes('eng')) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  if (s.includes('hin')) return 'bg-amber-50 text-amber-700 border-amber-100';
  if (s.includes('com') || s.includes('it')) return 'bg-indigo-50 text-indigo-700 border-indigo-100';
  return 'bg-surface-container-low text-on-surface border-surface-container';
};

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
    <div className="min-h-full px-container-margin lg:px-8 pt-6 pb-32 lg:pb-10 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-1">
          <p className="text-label-md font-label-md text-secondary uppercase tracking-widest">My Schedule</p>
          <h2 className="text-display-lg font-display-lg text-on-surface">Weekly Timetable</h2>
        </div>
        {!loading && (
          <span className="shrink-0 px-3 py-1.5 mb-0.5 rounded-full bg-surface-container-low border border-surface-container text-[10px] font-bold uppercase tracking-widest text-on-surface-variant whitespace-nowrap">
            {periods.length} {periods.length === 1 ? 'period' : 'periods'}
          </span>
        )}
      </div>

      {/* Day tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
        {DAYS.map(day => (
          <button
            key={day}
            onClick={() => setActiveDay(day)}
            className={`px-5 py-2.5 rounded-full text-label-md font-bold whitespace-nowrap transition-all active:scale-95 ${activeDay === day
              ? 'bg-primary text-on-primary shadow-md shadow-primary/20'
              : 'bg-white text-on-surface-variant border border-surface-container'}`}
          >
            <span className="inline-flex items-center gap-1.5">
              {day.substring(0, 3)}
              {day === today && activeDay !== day && (
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" aria-label="Today"></span>
              )}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-primary">
          <div className="animate-spin w-9 h-9 border-4 border-current border-t-transparent rounded-full"></div>
        </div>
      ) : periods.length === 0 ? (
        <div className="bg-white border border-dashed border-surface-container-high rounded-3xl p-10 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-5xl opacity-30 mb-2">event_busy</span>
          <p className="text-body-md font-bold">No classes on {activeDay}.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {periods.map((p, i) => {
            const live = isLive(p);
            return (
              <div
                key={i}
                className={`bg-white rounded-2xl p-4 flex items-center gap-4 shadow-sm border transition-all ${live
                  ? 'ring-2 ring-primary/40 border-primary/30'
                  : 'border-surface-container'}`}
              >
                <div className="w-16 text-center shrink-0">
                  <p className="text-label-md font-bold text-primary leading-none">{p.startTime || '--'}</p>
                  <p className="text-[10px] text-on-surface-variant mt-1">{p.endTime || ''}</p>
                </div>
                <div className="w-px h-12 bg-surface-container-high"></div>
                <div className="flex-1">
                  <div className={`inline-block px-2.5 py-0.5 rounded-lg border text-[10px] font-black uppercase tracking-wider mb-1 ${subjectTone(p.subject)}`}>
                    Period {p.periodNumber}
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="text-title-lg font-bold text-on-surface leading-tight">{p.subject || 'Free'}</p>
                    {live && (
                      <span className="text-[9px] font-black uppercase bg-primary text-white px-2 py-0.5 rounded-full animate-pulse shrink-0">
                        Now
                      </span>
                    )}
                  </div>
                  <p className="text-label-md text-on-surface-variant">Class {p.className}-{p.sectionName}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Timetable;
